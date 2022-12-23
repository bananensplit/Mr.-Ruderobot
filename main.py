from datetime import datetime
from pprint import pprint
from queue import Queue
import openai
import threading
import asyncio
import concurrent
import logging
from pymongo import MongoClient
from QueueThread import QueueThread

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Logging
logger = logging.getLogger("KURWA")
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
# ch.setLevel(logging.INFO)
formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
ch.setFormatter(formatter)
logger.addHandler(ch)


queue_thread = QueueThread(name="QueueThread")
queue_thread.start()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionModel(BaseModel):
    question: str


def get_total_requests():
    with MongoClient("mongodb://localhost:27017/") as client:
        collection = client["chat-gpt"]["requests"]
        total_requests = collection.count_documents({})
    return total_requests


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup")


@app.on_event("shutdown")
def shutdown_event():
    logger.info("FastAPI shutdown")


@app.get("/api/metadata", status_code=200)
async def get_metadata(response: Response):
    global queue_thread
    # data = asyncio.all_tasks(loop)
    # print("Name                              done          loop")
    # for task in data:
        # print(f"{task.get_name(): <34s}{str(task.done()): <14s}{task._loop}")
    # print()
    return {"totalrequests": get_total_requests(), "pendingrequests": queue_thread.get_pending_requests()}


@app.post("/api/askquestion", status_code=200)
async def askquestion(request: QuestionModel, response: Response):
    global queue_thread    
    question = request.question
    logger.debug("Received question: %s", question)

    if len(question) <= 0 or len(question) > 128:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Question must be between 1 and 128 characters long."}


    answer = "alksjd"
    def loop_callback(x):
        answer = x
        # print("telletubbie: " + answer)
        # return {"answer": answer}

    logger.debug("Putting question in queue: %s", question)
    queue_thread.put(question, loop_callback)

    while answer is None or answer == "alksjd":
        logger.debug("Waiting for answer: %s", answer)
        await asyncio.sleep(2)

    return {"answer": answer}

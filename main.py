from datetime import datetime
from pprint import pprint
from queue import Queue
import openai
import threading
import asyncio
import concurrent
import logging
from pymongo import MongoClient

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# Logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
# ch.setLevel(logging.INFO)
formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
ch.setFormatter(formatter)
logger.addHandler(ch)
logger.info('log message with level info')


lock = threading.Lock()
_pool = concurrent.futures.ThreadPoolExecutor()
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
        pprint(collection.count_documents({}))
        total_requests = collection.count_documents({})
    return total_requests


async def get_answer(question):
    # Acquire Lock
    global lock
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_pool, lock.acquire)

    # Do request    
    openai.api_key = "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"

    prompt = "The following is a conversation with an AI assistant named 'Mr. Robot'. The assistant will answer every question in a sarcastic, insulting and snooty manner. The AI assistant will occasionally also use words like 'idiot' and 'smartass'.\n\nHuman:"
    prompt += question
    prompt += "\nAI: "

    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        temperature=0.7,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        stop=["\nAI:", "\nHuman:"],
    )

    answer = response["choices"][0]["text"].strip()

    with MongoClient("mongodb://localhost:27017/") as client:
        collection = client["chat-gpt"]["requests"]
        collection.insert_one({"question": question, "answer": answer, "response": response, "time": datetime.now()})

    # Timeout and release lock
    asyncio.create_task(continuine_wait(lock, 5), name="continuine_wait")
    print("should wait for 5 more seconds")
    return answer


async def continuine_wait(lock, time=5):
    await asyncio.sleep(time)
    lock.release()


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup")


@app.on_event("shutdown")
def shutdown_event():
    logger.info("FastAPI shutdown")


@app.get("/api/metadata", status_code=200)
async def get_metadata(response: Response):
    # BUG: pending_requests is notupdated
    loop = asyncio.get_event_loop()
    data = asyncio.all_tasks(loop)
    print("Name          done          loop")
    for task in data:
        print(f"{task.get_name(): <14s}{str(task.done()): <14s}{task._loop}")
    # pprint([task.done() for task in data if task.get_name() == "get_answer" and task.done() == False])
    return {"totalrequests": get_total_requests(), "pendingrequests": -1}


@app.post("/api/askquestion", status_code=200)
async def askquestion(request: QuestionModel, response: Response):
    question = request.question

    if len(question) <= 0 or len(question) > 128:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Question must be between 1 and 128 characters long."}

    # return {"answer": await get_answer(question)}
    return {"answer": await asyncio.create_task(get_answer(question), name="get_answer")}

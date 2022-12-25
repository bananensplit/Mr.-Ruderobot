import logging
import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

from QueueThread import QueueThread

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
    with MongoClient(MONGO_CONNECTION_STRING) as client:
        collection = client["chat-gpt"]["requests"]
        total_requests = collection.count_documents({})
    return total_requests


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup")
    queue_thread.start()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI shutdown")
    queue_thread.stop()


@app.get("/api/metadata", status_code=200)
async def get_metadata(response: Response):
    total, pending = get_total_requests(), queue_thread.get_pending_requests()
    logger.debug(f"api/metadata requested: total={total}, pending={pending}")
    return {"totalrequests": total, "pendingrequests": pending}


@app.post("/api/askquestion", status_code=200)
async def askquestion(request: QuestionModel, response: Response):
    question = request.question
    logger.debug(f"api/askquestion: received request, question='{question}'")

    if len(question) <= 0 or len(question) > 128:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Question must be between 1 and 128 characters long."}

    logger.debug(f"api/askquestion: question='{question}' added to queue")
    future = queue_thread.put(question)
    logger.debug(f"api/askquestion: question='{question}' waiting for answer")
    answer = future.result()
    
    logger.debug(f"api/askquestion: question='{question}' got answer='{answer}'")
    return {"answer": answer}


if __name__ == '__main__':
    # Setup Logging
    logger = logging.getLogger("KURWA")
    logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    # Load environment variables
    load_dotenv()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
    
    if OPENAI_API_KEY is None:
        logger.error("OPENAI_API_KEY environment variable not set!")
        exit(1)
    if MONGO_CONNECTION_STRING is None:
        logger.error("MONGO_CONNECTION_STRING environment variable not set!")
        exit(1)

    # Setup queue thread
    queue_thread = QueueThread(
        name="QueueThread",
        api_key=OPENAI_API_KEY,
        mongo_connection_string=MONGO_CONNECTION_STRING,
        logger=logger,
        daemon=True
    )

    uvicorn.run(app, host="0.0.0.0", port=8000)
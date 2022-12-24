import asyncio
import logging
import threading
import openai_async
from concurrent.futures import Future
from datetime import datetime
from pprint import pprint

import openai
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

# Logging
logger = logging.getLogger("KURWA")
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
ch.setFormatter(formatter)
logger.addHandler(ch)

loop = asyncio.new_event_loop()

def create_queue_thread(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

queue_thread = threading.Thread(target=create_queue_thread, args=(loop,))
queue_thread.start()
lock = asyncio.Lock(loop=loop)


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

def get_pending_requests():
    global loop
    return len(asyncio.all_tasks(loop=loop))


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI shutdown")


@app.get("/api/metadata", status_code=200)
async def get_metadata(response: Response):
    total, pending = get_total_requests(), get_pending_requests()
    logger.debug("Received metadata request: totalrequests: %s, pendingrequests: %s", total, pending)
    return {"totalrequests": total, "pendingrequests": pending}


@app.post("/api/askquestion", status_code=200)
async def askquestion(request: QuestionModel, response: Response):
    question = request.question
    logger.debug("Received question: %s", question)

    if len(question) <= 0 or len(question) > 128:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"message": "Question must be between 1 and 128 characters long."}

    logger.debug("Processing question: %s", question)

    future = Future()
    logger.debug("Created future: %s", question)
    loop.call_soon_threadsafe(loop.create_task, ask_openai(question, future))
    # future.set_result("KURWA")
    # asyncio.run_coroutine_threadsafe(ask_openapi(question, future), loop)
    logger.debug("Waiting for result: %s", question)
    answer = future.result()
    logger.debug("Got answer: %s (%s)", answer, question)

    return {"answer": answer}


async def ask_openai(question, future: Future = None):
    logger.debug("Waiting for lock: %s", question)
    await lock.acquire()
    logger.debug("Acquired lock: %s", question)

    # Do request
    openai.api_key = "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"

    prompt = "The following is a conversation with an AI assistant named 'Mr. Robot'. The assistant will answer every question in a sarcastic, insulting and snooty manner. The AI assistant will occasionally also use words like 'idiot' and 'smartass'.\n\nHuman:"
    prompt += question
    prompt += "\nAI: "

    response = await openai_async.complete(
        "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",
        timeout=None,
        payload={
            "model": "text-davinci-003",
            "prompt": prompt,
            "temperature": 0.7,
            "max_tokens": 256,
            "top_p":1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stop": ["\nAI:", "\nHuman:"],
        }
    )
    response = response.json()

    #TODO: Schauen wann die acreate commiten und dann die Version hier verwenden
    # response = openai.Completion.acreate(
    #     model="text-davinci-003",
    #     prompt=prompt,
    #     temperature=0.7,
    #     max_tokens=256,
    #     top_p=1,
    #     frequency_penalty=0,
    #     presence_penalty=0,
    #     stop=["\nAI:", "\nHuman:"],
    # )

    answer = response["choices"][0]["text"].strip()

    with MongoClient("mongodb://localhost:27017/") as client:
        collection = client["chat-gpt"]["requests"]
        collection.insert_one({"question": question, "answer": answer, "response": response, "time": datetime.now()})
    
    # Setting future result
    logger.debug("Setting future: %s", question)
    future.set_result(answer)

    logger.debug("Sleeping for 5 more seconds: %s", question)
    await asyncio.sleep(5)

    logger.debug("Releasing lock: %s", question)
    lock.release()

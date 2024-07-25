import datetime
import logging
import os

from dotenv import load_dotenv
from openai.error import OpenAIError
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from pymongo import MongoClient

from QueueThread import QueueThread

# Setup Logging
logger = logging.getLogger("KURWA")
logger.setLevel(logging.DEBUG)
formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
ch = logging.StreamHandler()
fh = logging.FileHandler('logs/fastapi.log')
ch.setFormatter(formatter)
fh.setFormatter(formatter)
logger.addHandler(ch)
logger.addHandler(fh)

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGO_CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
BASE_URL = os.getenv("BASE_URL")

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


app = FastAPI(root_path=BASE_URL, title="Mr. Robot Chat API (powered by OpenAI)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="../frontend/dist")


class RequestQuestionModel(BaseModel):
    question: str

class ResponseQuestionModel(BaseModel):
    question: str
    answer: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    time: datetime.datetime

class ResponseAllQuestionsModel(BaseModel):
    total_questions: int
    questions: list[ResponseQuestionModel]


def get_total_requests():
    with MongoClient(MONGO_CONNECTION_STRING) as client:
        collection = client["chat-gpt"]["requests"]
        total_requests = collection.count_documents({})
    return total_requests


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup")
    logger.info("Using OPENAI_API_KEY: %s", OPENAI_API_KEY)
    logger.info("Using MONGO_CONNECTION_STRING: %s", MONGO_CONNECTION_STRING)
    logger.info("Using BASE_URL: %s", BASE_URL)
    queue_thread.start()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI shutdown")
    queue_thread.stop()


@app.get("/api", include_in_schema=False)
async def api_info(response: Response):
    return {"message": "go to /api/docs to get to documentation for this API"}


@app.get("/api/metadata", status_code=200)
async def get_metadata(response: Response):
    total, pending = get_total_requests(), queue_thread.get_pending_requests()
    logger.info(f"api/metadata requested: total={total}, pending={pending}")
    return {"totalrequests": total, "pendingrequests": pending}


@app.post("/api/askquestion", status_code=200)
async def askquestion(request: RequestQuestionModel, response: Response):
    question = request.question
    logger.info(f"api/askquestion: received request, question='{question}'")

    if len(question) <= 0 or len(question) > 128:
        response.status_code = status.HTTP_400_BAD_REQUEST
        logger.error(f"api/askquestion: question='{question}' is invalid (too many characters)")
        return {"message": "Question must be between 1 and 128 characters long."}

    logger.debug(f"api/askquestion: question='{question}' waiting for answer")
    try:
        answer = await queue_thread.put(question)
    except OpenAIError as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        logger.error(f"api/askquestion: question='{question}' generated error: '{e.user_message}'")
        return {"message": e.user_message}

    logger.info(f"api/askquestion: question='{question}' got answer='{answer}'")
    return {"answer": answer}
    

@app.get("/api/allquestions", status_code=200, response_model=ResponseAllQuestionsModel)
async def allquestions(response: Response):
    logger.info(f"api/allquestions: received request")

    with MongoClient(MONGO_CONNECTION_STRING) as client:
        collection = client["chat-gpt"]["requests"]
        all_questions = collection.find({}).sort("time", -1)
        all_questions = [ResponseQuestionModel(**{
            "question": question["question"],
            "answer": question["answer"],
            "prompt_tokens": question["response"]["usage"]["prompt_tokens"],
            "completion_tokens": question["response"]["usage"]["completion_tokens"],
            "total_tokens": question["response"]["usage"]["total_tokens"],
            "time": question["time"]
        }) for question in all_questions]
        total_questions = len(all_questions)
        logger.info(f"api/allquestions: got {total_questions} questions")
    
    return ResponseAllQuestionsModel(total_questions=total_questions, questions=all_questions)


app.mount("/assets", StaticFiles(directory="../frontend/dist/assets", html=True, check_dir=True), name="frontend-assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(request: Request, full_path: str):
    logger.info(f"frontend: serving frontend for path={full_path}")
    return templates.TemplateResponse("index.html", {"request": request})

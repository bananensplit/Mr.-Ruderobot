import logging
import time
import threading
import openai
from pymongo import MongoClient
from queue import Queue
from datetime import datetime


class QueueThread(threading.Thread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.queue = Queue()
        self.logger = logging.getLogger("KURWA")
        self.timer = 0

    def put(self, question):
        self.queue.put(question)
        self.timer = 0

    def get_pending_requests(self) -> int:
        return self.queue.qsize()

    def run(self) -> None:
        while True:
            if self.queue.empty():
                time.sleep(1)
                continue

            question = self.queue.get()
            answer = ask_openapi(question)

            time.sleep(5)


def ask_openapi(question):
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
    
    return answer

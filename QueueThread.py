import logging
import threading
import time
from concurrent.futures import Future
from datetime import datetime
from queue import Queue

import openai
from pymongo import MongoClient


class QueueThread(threading.Thread):
    def __init__(self, name="QueueThread", logger=None, daemon=True, *args, **kwargs):
        super().__init__(name=name, daemon=daemon, *args, **kwargs)
        self.queue = Queue()
        self.logger = logging.getLogger(__name__) if logger is None else logger
        self.stopp = False

    def put(self, question):
        future = Future()
        self.queue.put([question, future])
        return future

    def get_pending_requests(self) -> int:
        return self.queue.qsize()

    def stop(self):
        self.stopp = True

    def run(self) -> None:
        while True:
            if self.stopp:
                break

            if self.queue.empty():
                time.sleep(1)
                continue

            question, future = self.queue.get()
            answer = ask_openai(question, self.logger)

            # Setting future result
            future.set_result(answer)
            self.queue.task_done()
            time.sleep(5)


def ask_openai(question, logger: logging.Logger):
    # Do request
    openai.api_key = "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"

    prompt = "The following is a conversation with an AI assistant named 'Mr. Robot'. The assistant will answer every question in a sarcastic, insulting and snooty manner. The AI assistant will occasionally also use words like 'idiot' and 'smartass'.\n\nHuman:"
    prompt += question
    prompt += "\nAI: "

    # response = await openai_async.complete(
    #     "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",
    #     timeout=None,
    #     payload={
    #         "model": "text-davinci-003",
    #         "prompt": prompt,
    #         "temperature": 0.7,
    #         "max_tokens": 256,
    #         "top_p":1,
    #         "frequency_penalty": 0,
    #         "presence_penalty": 0,
    #         "stop": ["\nAI:", "\nHuman:"],
    #     }
    # )
    # response = response.json()

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

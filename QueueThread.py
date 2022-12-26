import asyncio
import logging
import threading
import time
from collections import deque
from datetime import datetime

import openai
from pymongo import MongoClient


class QueueThread(threading.Thread):
    def __init__(self, name="QueueThread", api_key=None, mongo_connection_string=None, logger=None, daemon=True, *args, **kwargs):
        super().__init__(name=name, daemon=daemon, *args, **kwargs)
        self.queue = deque()
        self.loop = None

        self.api_key = api_key
        self.mongo_connection_string = mongo_connection_string
        self.logger = logging.getLogger(__name__) if logger is None else logger
        self.stopp = False

    async def put(self, question):
        future = asyncio.Future(loop=self.loop)
        self.queue.append([question, future])

        while not future.done():
            await asyncio.sleep(1)
        
        return future.result()

    def get_pending_requests(self) -> int:
        return len(self.queue)

    def stop(self):
        self.stopp = True

    def run(self) -> None:
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

        while True:
            if self.stopp:
                break

            if len(self.queue) == 0:
                time.sleep(1)
                continue

            question, future = self.queue.popleft()
            answer = self.ask_openai(question)

            # Setting future result
            future.set_result(answer)
            time.sleep(5)

    def ask_openai(self, question):
        # Do request
        openai.api_key = self.api_key

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

        with MongoClient(self.mongo_connection_string) as client:
            collection = client["chat-gpt"]["requests"]
            collection.insert_one({"question": question, "answer": answer, "response": response, "time": datetime.now()})

        return answer

FROM python:3.9.16

WORKDIR /usr/src/app

# COPY THE SOURCE CODE
# Backend
COPY requirements.txt ./
COPY main.py ./
COPY QueueThread.py ./

# Frontend
COPY frontend/dist ./frontend/dist

# SETUP FASTAPI
# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Setup Log
RUN mkdir logs

# Create .env file
ENV OPENAI_API_KEY=""
ENV MONGO_CONNECTION_STRING=""

RUN touch .env
RUN echo "OPENAI_API_KEY=\"${OPENAI_API_KEY}\"" >> .env
RUN echo "MONGO_CONNECTION_STRING=\"${MONGO_CONNECTION_STRING}\"" >> .env

# EXPOSE PORT 80
EXPOSE 80

# RUN THE APP
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
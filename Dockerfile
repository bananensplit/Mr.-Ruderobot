FROM python:3.9.16

WORKDIR /usr/src/app

# Copy the source code
COPY requirements.txt ./
COPY main.py ./
COPY QueueThread.py ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 80
EXPOSE 80

# Setup Log
RUN mkdir logs

# Create .env file
ENV OPENAI_API_KEY=""
ENV MONGO_CONNECTION_STRING=""

RUN touch .env
RUN echo "OPENAI_API_KEY=\"${OPENAI_API_KEY}\"" >> .env
RUN echo "MONGO_CONNECTION_STRING=\"${MONGO_CONNECTION_STRING}\"" >> .env

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
FROM python:3.9.16


# SETUP THE BACKEND
WORKDIR /usr/src/app/backend

COPY backend/requirements.txt ./
COPY backend/main.py ./
COPY backend/QueueThread.py ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Setup Log
RUN mkdir backend/logs

# Create .env file
ENV OPENAI_API_KEY=""
ENV MONGO_CONNECTION_STRING=""
ENV BASE_URL="/"

RUN touch backend/.env
RUN echo "OPENAI_API_KEY=\"${OPENAI_API_KEY}\"" >> ./backend/.env
RUN echo "MONGO_CONNECTION_STRING=\"${MONGO_CONNECTION_STRING}\"" >> ./backend/.env
RUN echo "BASE_URL=\"${BASE_URL}\"" >> ./backend/.env


# SETUP THE FRONTEND
WORKDIR /usr/src/app/frontend

# Frontend
COPY frontend/dist ./frontend/dist


# EXPOSE PORT 80
EXPOSE 80

# RUN THE APP
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
FROM nikolaik/python-nodejs:python3.9-nodejs14


# SETUP THE BACKEND
WORKDIR /usr/src/app/backend

COPY backend/requirements.txt ./
COPY backend/main.py ./
COPY backend/QueueThread.py ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Setup Backend Logs
RUN mkdir logs

# Create .env file
ENV OPENAI_API_KEY=""
ENV MONGO_CONNECTION_STRING=""
ENV BASE_URL="/"

RUN touch backend/.env
RUN echo "OPENAI_API_KEY=\"${OPENAI_API_KEY}\"" >> .env
RUN echo "MONGO_CONNECTION_STRING=\"${MONGO_CONNECTION_STRING}\"" >> .env
RUN echo "BASE_URL=\"${BASE_URL}\"" >> .env


# SETUP THE FRONTEND
WORKDIR /usr/src/app/frontend

# Frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
COPY frontend/vite.config.js ./
COPY frontend/src ./src
COPY index.html ./

# Install dependencies
RUN npm install

# Build the frontend
RUN npm run build -- --base ${BASE_URL}


# SETUP THE APP
WORKDIR /usr/src/app

# EXPOSE PORT 80
EXPOSE 80

# RUN THE APP
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
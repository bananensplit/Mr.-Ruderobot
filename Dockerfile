FROM nikolaik/python-nodejs:python3.9-nodejs20
USER pn

# ARGs
ARG BASE_URL="/"

# ENVs
ENV OPENAI_API_KEY=""
ENV MONGO_CONNECTION_STRING=""


# SETUP THE FRONTEND
WORKDIR /home/pn/app/frontend

# Frontend
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
COPY frontend/vite.config.js ./
COPY frontend/src ./src
COPY frontend/index.html ./

# Install dependencies
RUN npm install

# Build the frontend
RUN npm run build -- --base ${BASE_URL}


# SETUP THE BACKEND
WORKDIR /home/pn/app/backend

COPY backend/requirements.txt ./
COPY backend/main.py ./
COPY backend/QueueThread.py ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Setup Backend Logs
RUN mkdir logs

# Create .env file
RUN touch .env && \
    echo "OPENAI_API_KEY=\"${OPENAI_API_KEY}\"" >> .env && \
    echo "MONGO_CONNECTION_STRING=\"${MONGO_CONNECTION_STRING}\"" >> .env && \
    echo "BASE_URL=\"${BASE_URL}\"" >> .env


# SETUP THE APP
WORKDIR /home/pn/app/backend

# EXPOSE PORT 80
EXPOSE 80

# RUN THE APP
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]
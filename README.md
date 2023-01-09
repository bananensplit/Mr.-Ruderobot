# This is a rude MR. Robot Docker container


## Without compose
When using this container without compose you will need to setup a mongodb server separately, and pass the connection string to this container on startup.

### Build the container
```bash
docker compose build \
  -t mr-robot:latest \
  --build-arg BASE_URL=/ruderobot \
  .
```

### Run the container
```bash
docker run -d --name gpt-chat-backend \
	-p 8112:80 \
	-e OPENAI_API_KEY=<API-KEY> \
	-e MONGO_CONNECTION_STRING=mongodb://root:rootPassword@172.19.0.2:27017 \
	-e BASE_URL=/ruderobot \
	gpt-chat
```

### Script
```bash
# create bridge network
docker network create gpt-chat-network


# build
docker build -t gpt-chat:latest .


# start mongo DB
docker run -d --name gpt-chat-db \
	-v gpt-chat-db-volume:/data/db \
	--network gpt-chat-network \
	-e MONGO_INITDB_ROOT_USERNAME=root \
	-e MONGO_INITDB_ROOT_PASSWORD=rootPassword \
	mongo


# start gpt-chat-backend
docker run -d --name gpt-chat-backend \
	-p 80:80 \
	--network gpt-chat-network \
	-e OPENAI_API_KEY=<API-KEY> \
	-e MONGO_CONNECTION_STRING=mongodb://root:rootPassword@172.19.0.2:27017 \
	-e BASE_URL=/ruderobot \
	gpt-chat
```


## Important commands
### Build the container
```bash
docker compose build \
  -t mr-robot:latest \
  --build-arg BASE_URL=/ruderobot \
  .
```

### Run the container
```bash
docker compose up -d
```
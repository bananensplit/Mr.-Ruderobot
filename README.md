# This is a rude Mr. Ruderobot Docker container
This is a bot that answers your questions in a rude way.


## Without compose
> Base container:
> * DockerHub: https://hub.docker.com/r/nikolaik/python-nodejs
> * GitHub: https://github.com/nikolaik/docker-python-nodejs

The following script contains all steps you need to complete to start this container without compose.

Please note that you should probably replace things like `<API-KEY>`, `BASE_URL`, `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` and `MONGO_CONNECTION_STRING` with your own values.

Also the `BASE_URL` can only be set during build time, so you will need to rebuild the container if you want to change it.

```bash
# build base container
docker build -t nikolaik/python-nodejs-own github.com/nikolaik/docker-python-nodejs#main

# build
docker build \
    -t mr-ruderobot-api:latest \
    --build-arg BASE_URL=/ruderobot \
    .

# create bridge network and volume
docker network create mr-ruderobot_net
docker volume create mr-ruderobot_db-volume

# start mongo DB
docker run -d --name mr-ruderobot-db \
    -v mr-ruderobot_db-volume:/data/db \
    --network mr-ruderobot_net \
    -e MONGO_INITDB_ROOT_USERNAME=root \
    -e MONGO_INITDB_ROOT_PASSWORD=rootPassword \
    mongo

# start Mr. Ruderobot container
docker run -d --name mr-ruderobot-api \
    -p 80:80 \
    --network mr-ruderobot_net \
    -e OPENAI_API_KEY=<API-KEY> \
    -e MONGO_CONNECTION_STRING=mongodb://root:rootPassword@172.19.0.2:27017 \
    gpt-chat
```


## With compose
Using the provided compose file you can build you can do it following the script below.

Please note that you should probably replace things like `API_KEY`, `BASE_URL`, `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD` and `MONGO_CONNECTION_STRING` with your own values.

```bash
# build base container
docker build -t nikolaik/python-nodejs-own github.com/nikolaik/docker-python-nodejs#main

# build
docker-compose build

# start
docker-compose up -d
```
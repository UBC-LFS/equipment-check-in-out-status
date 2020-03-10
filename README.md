# Equipment Status Visualizer

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Installation 
```sh
git clone https://github.com/UBC-LFS/equipment-check-in-out-status
cd equipment-check-in-out-status
npm install
```

### Add .env file
Create a `.env` file and specify the following:
```
QUALTRICS_API_DOMAIN=https://yourdatacenterid.qualtrics.com/API/v3/
QUALTRICS_API_TOKEN=YOUR_QUALTRICS_TOKEN
SURVEY_NAME="THE SURVEY NAME"
```

## Development mode
```sh
npm run dev
```

## Production mode
```sh
npm run production
```

## Create Docker image
Make sure to create a `.env` file with the required environment variables before building the image. This file will be copied over during the build process.

To build the Docker image, run the following command:
```sh
# <your tag> will be used to refer to the image once created 
docker build -t <your tag> .
```

## Run Docker image
To run the docker image, run the following command:
```sh 
docker run -p 4000:4000 -d <your tag>
```
The `-p` option maps the container port 4000 to the local port 4000, and the `-d` option runs the container in detached mode. Once the Express server starts, the app will be available at `http://localhost:4000`.

## Print app output
```sh
# get container id from list
docker ps 

# print output to stdout
docker logs <container_id>
```

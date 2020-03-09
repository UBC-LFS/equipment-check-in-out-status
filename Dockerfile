FROM node:10

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# create app dir
WORKDIR /usr/src/app

# copy package.json and local packages
COPY package*.json ./
COPY ./node-qualtrics-api-2.tar ./

RUN npm install
COPY . .

# have docker daemon map port used by app
EXPOSE 4000
CMD ["npm", "start"]
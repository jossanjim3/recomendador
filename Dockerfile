FROM node:9-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN npm install -g n
RUN n stable

COPY index.js .

EXPOSE 3000

CMD npm start
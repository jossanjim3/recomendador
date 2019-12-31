FROM node:9-alpine

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY /src ./src
COPY /views ./views

EXPOSE 3000

CMD npm start
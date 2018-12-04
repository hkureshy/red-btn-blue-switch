FROM node:8-alpine

WORKDIR /testNode

COPY package.json /testNode

RUN npm install

COPY . /testNode

EXPOSE 8085

# FROM node:10.2.0-alpine
FROM keymetrics/pm2:latest-alpine

RUN mkdir -p /usr/src/app/nodejs
WORKDIR /usr/src/app/nodejs
COPY . /usr/src/app/nodejs

RUN npm install
# RUN npm install -g pm2
WORKDIR /usr/src/app/nodejs

EXPOSE 3000

# WORKDIR /usr/src/app
CMD NODE_ENV=production pm2-docker start -i 0 src/app.js

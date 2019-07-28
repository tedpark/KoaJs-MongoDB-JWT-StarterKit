FROM keymetrics/pm2:latest-alpine

RUN mkdir -p /usr/src/app/nodejs
WORKDIR /usr/src/app/nodejs
COPY . /usr/src/app/nodejs

RUN npm install
WORKDIR /usr/src/app/nodejs

EXPOSE 3000

CMD NODE_ENV=production pm2-docker start -i 0 src/app.js

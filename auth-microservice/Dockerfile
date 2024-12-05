FROM node:20.18-alpine

WORKDIR /app

COPY package*.json /app/

RUN ls -al /app

RUN npm ci

COPY . /app/

RUN mkdir -p /app/dist && chown -R node:node /app

EXPOSE 3000

USER node

CMD [ "npm", "start" ]
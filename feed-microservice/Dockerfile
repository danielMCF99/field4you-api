FROM node:20.18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3005

CMD ["npm", "run", "start"]

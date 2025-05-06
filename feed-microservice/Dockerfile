FROM node:20-18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-18-alpine

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

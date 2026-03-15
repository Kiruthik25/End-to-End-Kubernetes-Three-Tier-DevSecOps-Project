
# Stage 1
FROM node:16 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


# Stage 2
FROM node:16-slim

WORKDIR /app

COPY --from=builder /app .

CMD ["npm", "start"]

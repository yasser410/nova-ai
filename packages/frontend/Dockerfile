FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm ci && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/packages/frontend/dist ./

EXPOSE 3000

CMD ["http-server", ".", "-p", "3000", "--gzip"]

FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy root package files
COPY package.json package-lock.json ./

# Copy all packages
COPY packages ./packages

# Install dependencies
RUN npm ci

# Build packages
RUN npm run build

WORKDIR /app/packages/backend

EXPOSE 3001

CMD ["npm", "run", "start"]

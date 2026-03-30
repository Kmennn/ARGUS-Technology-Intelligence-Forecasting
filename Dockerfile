FROM node:20-alpine

# Install build tools needed for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Create the data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 3005

CMD ["npm", "start"]

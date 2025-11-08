FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when package manifests change
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]


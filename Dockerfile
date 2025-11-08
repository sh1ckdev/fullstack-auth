FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_APP_NAME="Fullstack Auth"
ARG VITE_API_URL
ARG VITE_YANDEX_CLIENT_ID
ARG VITE_YANDEX_REDIRECT_URI

ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_YANDEX_CLIENT_ID=${VITE_YANDEX_CLIENT_ID}
ENV VITE_YANDEX_REDIRECT_URI=${VITE_YANDEX_REDIRECT_URI}

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Copy application source, build output and dependencies
COPY --from=build /app /app

ENV NODE_ENV=production

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]


FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL=http://0.0.0.0:5000/api
ARG YANDEX_CLIENT_ID=
ARG YANDEX_REDIRECT_URI=http://0.0.0.0:4173/signin

ENV API_URL=${API_URL}
ENV YANDEX_CLIENT_ID=${YANDEX_CLIENT_ID}
ENV YANDEX_REDIRECT_URI=${YANDEX_REDIRECT_URI}

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


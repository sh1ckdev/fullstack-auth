FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_YANDEX_CLIENT_ID=
ARG VITE_YANDEX_REDIRECT_URI=http://localhost:4173/signin

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


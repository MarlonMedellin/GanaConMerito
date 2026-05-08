FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ARG APP_COMMIT
ARG APP_BUILD_TIME
ENV NEXT_PUBLIC_APP_COMMIT=${APP_COMMIT}
ENV NEXT_PUBLIC_APP_BUILD_TIME=${APP_BUILD_TIME}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$APP_COMMIT" || (echo "APP_COMMIT build arg is required" && exit 1)
RUN test -n "$APP_BUILD_TIME" || (echo "APP_BUILD_TIME build arg is required" && exit 1)
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ARG APP_COMMIT
ARG APP_BUILD_TIME
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_APP_COMMIT=${APP_COMMIT}
ENV NEXT_PUBLIC_APP_BUILD_TIME=${APP_BUILD_TIME}
RUN apk add --no-cache \
    bash \
    curl \
    docker-cli \
    docker-cli-compose \
    git
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]

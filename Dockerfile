# syntax=docker/dockerfile:1.24

FROM node:26-trixie-slim AS build

ARG IMAGE_TAG
ENV NUXT_PUBLIC_IMAGE_TAG=$IMAGE_TAG
ENV CI=true

RUN npm install -g pnpm@11.5.3

# Timeouts on github fetching prebuilt binaries for better-sqlite3 cause it to try to build - and that requires python
# which is not available by default in the arm64 image. Add so that it's there for fallback.

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN rm -rf .nuxt
RUN pnpm nuxi prepare

RUN pnpm run build

FROM node:26-trixie-slim AS deploy

ARG IMAGE_TAG
ENV NUXT_PUBLIC_IMAGE_TAG=$IMAGE_TAG
ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/.output ./

CMD ["node", "./server/index.mjs"]

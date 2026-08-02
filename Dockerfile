# syntax=docker/dockerfile:1.26

FROM node:26-trixie-slim AS build

ARG IMAGE_TAG
ENV NUXT_PUBLIC_IMAGE_TAG=$IMAGE_TAG
ENV CI=true

RUN npm install -g pnpm@11.18.0

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

# `pnpm run build` exits 0 even when prerendering dies part way through the crawl,
# which leaves .output/server empty and ships an image that cannot start.
# Fail the build here instead of pushing a broken image.

RUN <<'SH'
set -eu
if [ ! -s .output/server/index.mjs ]; then
  echo "build check failed: .output/server/index.mjs is missing or empty"
  exit 1
fi
if [ -z "$(find .output/public/_ipx -type f -print -quit 2>/dev/null)" ]; then
  echo "build check failed: no images were generated under .output/public/_ipx"
  exit 1
fi
echo "build check passed"
SH

FROM node:26-trixie-slim AS deploy

ARG IMAGE_TAG
ENV NUXT_PUBLIC_IMAGE_TAG=$IMAGE_TAG
ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/.output ./

CMD ["node", "./server/index.mjs"]

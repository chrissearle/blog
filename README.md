# www.chrissearle.org

Nuxt based static site generator

## Setup

```shell
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```shell
pnpm run dev
```

## Deployment

```shell
pnpm run build
node .output/server/index.mjs
```

## Docker deployment

This builds and packages using a multistage docker build

```shell
docker build -t chrissearle/blog:latest .
```

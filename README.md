# www.chrissearle.org

Personal blog built with [Nuxt 4](https://nuxt.com/) and [Nuxt Content](https://content.nuxt.com/). Supports both SSR (Node.js/Docker) and static site generation.

## Project layout

```
app/          Vue components, pages, composables, and assets
content/      Markdown blog posts, organised by year/month/day
public/       Static assets (images, favicon, robots.txt)
scripts/      CLI utilities (see below)
```

Content files live at `content/YYYY/MM/DD/slug.md` with YAML frontmatter. Images referenced in posts go under `public/images/posts/YYYY/MM/DD/`.

## Setup

```shell
pnpm install
```

## Development

```shell
pnpm dev          # start dev server at http://localhost:3000
pnpm lint         # check code with ESLint
pnpm lint:fix     # auto-fix lint issues
pnpm format       # format with Prettier
```

## Build and deploy

```shell
pnpm build        # build for Node.js server
pnpm generate     # generate a fully static site
pnpm preview      # preview a production build locally
```

**Node.js server** (after `pnpm build`):

```shell
node .output/server/index.mjs
```

**Docker** (multistage build):

```shell
docker build -t chrissearle/blog:latest .
```

## Creating a new post

Use `scripts/post` to scaffold a new post with the correct directory structure and frontmatter:

```shell
node scripts/post "My Post Title"
```

This creates `content/YYYY/MM/DD/my-post-title.md` with a basic frontmatter template:

```yaml
---
title: My Post Title
date: 2026-03-28 14:30 +0100
tags:
intro:
---
```

### Options

| Flag       | Short | Description                                                                                                   |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------- |
| `--images` | `-i`  | Add an `image:` field to frontmatter and create `public/images/posts/YYYY/MM/DD/`                             |
| `--astro`  | `-a`  | Use the astrophotography template (pre-fills category, tags, an object data table, and photo details section) |

```shell
node scripts/post "Orion Nebula" --astro     # astrophotography post
node scripts/post "My Trip" --images         # post with images directory
```

# www.chrissearle.org

Personal blog built with [Nuxt 4](https://nuxt.com/) and [Nuxt Content](https://content.nuxt.com/). Supports both SSR (Node.js/Docker) and static site generation.

## Project layout

```
app/          Vue components, pages, composables, and assets
content/      Markdown blog posts, organised by year/month/day
public/       Static assets (images, favicon, robots.txt)
scripts/      CLI utilities for creating posts (see below)
```

Content files live at `content/YYYY/MM/DD/slug.md` with YAML frontmatter. Images referenced in posts go under `public/images/posts/YYYY/MM/DD/`.

## Requirements

Tool versions are pinned in `mise.toml` (Node.js, pnpm).

## Setup

```shell
pnpm install
```

## Development

```shell
pnpm dev          # start dev server at http://localhost:3000
pnpm lint         # check code with ESLint
pnpm lint:fix     # auto-fix lint issues
pnpm typecheck    # type-check the Nuxt app
pnpm typecheck:scripts   # type-check scripts/astro
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

| Flag       | Short | Description                                                                       |
| ---------- | ----- | --------------------------------------------------------------------------------- |
| `--images` | `-i`  | Add an `image:` field to frontmatter and create `public/images/posts/YYYY/MM/DD/` |
| `--astro`  | `-a`  | Interactive astrophotography post - see below                                     |

```shell
node scripts/post "My Trip" --images         # post with images directory
```

## Astrophotography posts

`node scripts/post --astro` builds a complete post interactively. The code is in `scripts/astro/` - TypeScript that Node runs directly, no build step.

```shell
node scripts/post --astro                                     # asks for everything
node scripts/post --astro "M 81"                              # target given
node scripts/post --astro "Horsehead Nebula, Flame Nebula"    # multi-target post
node scripts/post --astro "M 81" --image ~/m81.png --dry-run  # print the post, write nothing
```

It:

1. Looks the target up in [SIMBAD](https://simbad.cds.unistra.fr/) (coordinates, magnitude, size, catalog ids), Wikipedia (description, footnote link, infobox size) and Wikidata (constellation, distance, Caldwell numbers). If [Stellarium](https://stellarium.org/) is running with the Remote Control plugin on `localhost:8090`, it fills remaining gaps.
2. Shows the result and lets you correct the names.
3. Copies the image to `public/images/posts/YYYY/MM/DD/<CATALOG_ID>.<ext>`.
4. Asks for photo details - equipment from a menu, dates, integration time per filter, calibration, processing, notes.
5. Writes the post: frontmatter (title, tags, intro, image, `targets`), a data table and Wikipedia lead per target, the image, a Photo Details table and footnotes.

Tags are `astrophotography`, every catalog id (`messier 81`, `ngc 3031`, `sh2-142`), an object type (`galaxy` / `nebula` / `cluster`) and the equipment's tags. Tags not used on any other post are listed so they can be checked.

Where to change things:

| File                           | What                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `scripts/astro/equipment.json` | Telescopes, cameras, mounts, control software and their tags. The script's "add new ..." menu entry appends here. |
| `scripts/astro/catalogs.ts`    | Which catalogs count, and their order (Messier, NGC, IC, Caldwell, ...)                                           |
| `scripts/astro/render.ts`      | Post layout, `pickTitle()` (title rule) and `buildIntro()` (intro text)                                           |

The last equipment setup used is remembered in `scripts/astro/.last-setup.json` (not committed).

### Targets page

The `targets` frontmatter on astro posts drives [`/astrophotography`](https://www.chrissearle.org/astrophotography/) - every object imaged, with catalog numbers and Messier/Caldwell progress. Each astro post links to it from its date line.

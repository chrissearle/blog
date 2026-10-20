# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server at http://localhost:3000
pnpm build            # Build for production (SSR)
pnpm generate         # Static site generation
pnpm preview          # Preview production build
pnpm lint             # Run ESLint
pnpm lint:fix         # Run ESLint with auto-fix
pnpm format           # Run Prettier
```

### Creating a new post

Always use the script — and ask if images are needed before running:

```bash
node scripts/post "Post Title"            # Creates content/YYYY/MM/DD/post-title.md
node scripts/post "Post Title" --images   # Also creates public/images/posts/YYYY/MM/DD/
```

### Creating an astrophotography post

`node scripts/post --astro` is interactive (code in `scripts/astro/`, TypeScript run directly by Node):

```bash
node scripts/post --astro                        # asks for everything
node scripts/post --astro "M 81"                 # target given; comma-separate for multi-target posts
node scripts/post --astro "M 81" --image ~/x.png --dry-run   # print the post, write nothing
node scripts/post --astro --laminar ~/Saturn.json            # planetary: read a Laminar capture sidecar (repeatable)
node scripts/post --astro "IC 342" --gallery "IC 342"        # use a gallery photo (id, URL or search) instead of a local file
```

- Looks the target up in SIMBAD (coordinates, magnitude, size, catalog ids), Wikipedia (description, lead sentences, footnote link, infobox size) and Wikidata (constellation, distance, Caldwell numbers). Stellarium's Remote Control plugin on `localhost:8090` fills gaps if running.
- Sun, Moon and planets (`scripts/astro/solar.ts`) skip SIMBAD: fixed facts are hard-coded, and constellation, distance, magnitude, apparent size, phase and Saturn's ring tilt are computed offline by `astronomy-engine` for the first capture date plus a time the script asks for. Their `targets` entries have no `ids`, `ra` or `dec` (they move, so they stay off the sky map); `type` is `planet`, `moon` or `star`.
- Laminar (planetary capture app) JSON sidecars, via `--laminar` or asked for when a target is a planet (`scripts/astro/laminar.ts`): supply the default target, capture dates/times (UTC), duration, frame count, camera settings (gain, exposure, format, ROI), the camera (matched by model in `equipment.json`), a preselected telescope (matched by focal length), a Barlow note, and a pre-filled Conditions answer from the weather block. Site coordinates, observer and file names are deliberately not used.
- The image is either a local file (the default), copied to `public/images/posts/YYYY/MM/DD/<CATALOG_ID>.<ext>`, or a photo already in the gallery (`--gallery`, or chosen at the prompt; `scripts/astro/gallery.ts`). A gallery photo is found by id, gallery URL or search, with the targets' names searched first. It is written as `image: lychee:<id>` and `:lychee{id="<id>"}`, and nothing is copied.
- Asks for photo details. Equipment comes from `scripts/astro/equipment.json` ("add new ..." appends to it); the last setup used is remembered in the gitignored `scripts/astro/.last-setup.json`.
- Title rule and intro wording live in `pickTitle()` / `buildIntro()` in `scripts/astro/render.ts`. Catalog whitelist and order are in `scripts/astro/catalogs.ts`.
- Tags: `astrophotography`, every whitelisted catalog id (`messier 81`, `ngc 3031`, `sh2-142`), an object type (`galaxy` / `nebula` / `cluster`), and the optics' telescope + manufacturer tags. The script lists tags not used on any other post, for confirmation.
- Check with `pnpm lint` and `pnpm typecheck:scripts`.

## Architecture

This is a **Nuxt 4** blog using **@nuxt/content** for markdown-based content management. Content is prerendered as a static site via Nitro.

### Key modules

- `@nuxt/content` - Markdown content with SQLite-backed querying via `queryCollection("content")`
- `@nuxt/ui` + TailwindCSS 4 - UI components (UContainer, UPageGrid, UApp, etc.)
- `@nuxt/image` - Image optimisation
- `@nuxt/scripts` - Third-party script loading, used for self-hosted Umami analytics. `app/plugins/umami.client.ts` fetches `/api/analytics` (`server/api/analytics.get.ts`), which answers with the server's `NUXT_UMAMI_WEBSITE_ID`, `NUXT_UMAMI_DOMAINS` (JSON array) and `NUXT_UMAMI_SRC`, set only on the production deployment in flux-hetzner. Without them it answers 204 and no tracker loads, which is what keeps local dev, preview and blog.home (same image) out of the stats. A route rather than public runtime config, because prerendered pages carry public runtime config from build time. The plugin also sends `error-<status>` events with the path and referrer (the previous in-site path after client-side navigation). The `scripts.registry.umamiAnalytics` entry in `nuxt.config.ts` (`trigger: false, proxy: false, bundle: false`) must stay: without it the module bundles Umami Cloud's script and sends to Umami Cloud
- `@nuxtjs/seo` - SEO including sitemap, robots, schema.org, link checker. Its OG image generation, skew protection and ai-ready modules are disabled in `nuxt.config.ts`; `og:image` comes from each post's own `image` (`posts/long.vue`)
- `@prometheus-io/client` - Prometheus metrics on a separate port (`server/plugins/metrics.ts`, `runtimeConfig.metricsPort`, default 9090); not a Nuxt module. Series `app_build_info{version}` and `http_server_request_duration_seconds{method,route_group,status_code}`, the same as the other Nuxt apps, which share the "Nuxt Apps" Grafana dashboard. The same plugin logs each 404 as `[404] <method> <path> from <referer>`

### Gallery (gallery.chrissearle.org)

Photos in the self-hosted Lychee gallery can be used instead of local images. This is an alternative: local images stay as they are. Only public photos work, meaning photos in albums that are public and not link-only or password-protected.

- `shared/lychee.ts` is the API client, used by the scripts and the build. It has no Nuxt imports, so Node runs it directly. It reads the album list (which needs the XSRF cookie echoed as a header) and each album's no-login `/Embed/<album>` endpoint.
- `modules/gallery.ts` (via `shared/lycheeContent.ts`) resolves references while content is parsed:
  - `image: lychee:<id>` becomes the gallery's medium URL, which og:image and RSS use as-is. It also sets `imageLink` to the photo page and `imageSrcset` to Lychee's size variants.
  - Cards and thumbnails (`posts/short.vue`, `posts/featured.vue`, `/astrophotography`, the sky map) render through `posts/image.vue`. It uses `<img srcset>` when there is an `imageSrcset`, and NuxtImg otherwise. List queries must `.select("imageSrcset")` alongside `image`.
  - `:lychee{id="..."}` gets src, srcset, size, title and href. An optional `title="..."` overrides the gallery title.
  - Any form `parseGalleryRef` accepts also works: a bare id, a photo page URL, or a "copy image URL".
- **The running site never calls the gallery API.** Images load straight from Lychee's size variants (no NuxtImg/IPX). Clicking one opens its gallery page in a new tab instead of the lightbox.
- A reference that doesn't resolve fails `pnpm build`/`generate` (in `build:before`). In dev, the post shows an error in place. The module collects problems rather than throwing, because Nuxt Content silently drops a post whose parsing throws.
- Nuxt Content caches parsed posts by checksum in `.data`. A cached post skips the hook, so after a gallery-side change (a photo made private, an album moved), `rm -rf .data` before a local build. CI builds from a clean checkout.
- `node scripts/gallery "<search | id | URL>"` prints the `image:` line and `:lychee{}` snippet for hand-written posts.

### Content structure

Blog posts live in `content/YYYY/MM/DD/slug.md`. The URL path mirrors the directory structure. All markdown files are indexed in a single `content` collection defined in `content.config.ts`.

Post frontmatter schema (defined in `content.config.ts`):

- `title` (required)
- `date` (required, format: `YYYY-MM-DD HH:mm +ZZZZ`)
- `tags` (array of strings)
- `category` (optional string)
- `intro` (optional summary)
- `image` (optional URL, typically `/images/posts/YYYY/MM/DD/filename.ext`, or a gallery photo as `lychee:<id>`)
- `imageLink`, `imageSrcset` (set at build time for gallery images: the photo's gallery page and size variants; never written by hand)
- `embedImage` (optional URL)
- `series` (optional string for grouping related posts)
- `targets` (astrophotography posts: list of `{ name, ids, type, constellation, ra, dec }`, one per object imaged — written by `node scripts/post --astro`, drives the `/astrophotography` page; `ra`/`dec` are J2000 degrees and place the target on the sky map)

Post images are stored in `public/images/posts/YYYY/MM/DD/`.

### App structure (`app/`)

- `app.vue` - Root component: NavBar + NuxtPage + NavFooter
- `error.vue` - Error page (any status) in the same layout, using `UError`
- `pages/index.vue` - Paginated post list (12 per page)
- `pages/[...slug].vue` - Individual post renderer using `PostsLong`
- `pages/tags/`, `pages/categories/`, `pages/series/` - Taxonomy pages
- `pages/astrophotography.vue` - "My targets" overview built from `targets` frontmatter (table on md+, cards below, then the sky map `astro/SkyMap.vue`); astro posts link to it from the date line in `posts/long.vue`. Stars and constellation lines come from `app/assets/sky.json`, generated by `node scripts/astro/sky.ts` from d3-celestial (BSD-3-Clause, credited under the map)
- `pages/keys.vue`, `pages/version.vue` - Utility pages

**Components** (`app/components/`):

- `posts/short.vue` - Post card for list views
- `posts/long.vue` - Full post renderer with `<ContentRenderer>`
- `posts/pagination.vue` - Pagination controls
- `posts/image.vue` - Card/thumbnail image: Lychee srcset for gallery images, NuxtImg otherwise
- `content/Lychee.vue` - `:lychee{id}` gallery photo; its props are filled in at build time (see Gallery)
- `nav/bar.vue`, `nav/footer.vue` - Site navigation
- `badge/`, `content/`, `tags/`, `categories/`, `series/` - Supporting components

**Composables** (`app/composables/`):

- `usePaging.ts` - Pagination logic (12 posts/page)
- `useDates.ts` - Date formatting via Luxon (parses `YYYY-MM-DD HH:mm ZZZ` and `YYYY-MM-DD HH:mm:ss ZZZ`)
- `useLinks.ts`, `useStrings.ts`, `useBadges.ts` - Utility helpers
- `useTargets.ts` - Rows, catalog columns and Messier/Caldwell progress for `/astrophotography`

**Utils** (`app/utils/`):

- `notFound.ts` - The fatal 404 every page throws when it has nothing to show (unknown post, tag, category, series or page number). Must be fatal, or client-side navigation leaves a blank page; never render an empty list with a 200

### Querying content

Use `queryCollection("content")` in pages/components. The collection supports `.select()`, `.order()`, `.limit()`, `.where()`, `.path()`, `.count()`, and `.all()`/`.first()`.

### Code style

ESLint runs Prettier through `eslint-plugin-prettier`, so `pnpm lint` fails on formatting differences and `pnpm lint:fix` applies Prettier: the two always agree. The Husky pre-commit hook runs lint-staged: `pnpm lint:fix` on staged `.js`, `.mjs`, `.ts`, `.vue` files, and `prettier --write` on staged Markdown, JSON, CSS and YAML (files in `.prettierignore`, such as `content/`, are skipped). CI (`pr.yaml`) runs `pnpm lint` and `pnpm format:check`.

### Deployment settings

The same image runs as www.chrissearle.org (nornour) and blog.home (bonnet), so nothing that differs between deployments may be in the code. Analytics ids and hosts, and anything else per-deployment, come from the deployment's env in the Flux repos (see `runtimeConfig` in `nuxt.config.ts`). The site's own identity is not a deployment setting: `site.url`, the link-checker excludes, links to the other sites (such as the 360 base URL in `content/Pano.vue`) and the deploy targets in the workflows stay in the code, since prerendering bakes them into the pages.

## Working with content files

Only frontmatter (header metadata) should be edited in `content/` files. Do not write or modify the post body unless explicitly asked to fix a markdown issue.

### Tagging posts

When helping tag a post, reusing existing tags from other posts is fine. Any new tag (not already used elsewhere) must be confirmed with the user before adding.

## TypeScript

- All changes must pass linting (`pnpm lint`) and type checking
- `any` is never acceptable — always use correct, specific types

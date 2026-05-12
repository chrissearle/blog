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
node scripts/post "Post Title" --astro    # Astrophotography template (category, tags, object table, photo details)
```

## Architecture

This is a **Nuxt 4** blog using **@nuxt/content** for markdown-based content management. Content is prerendered as a static site via Nitro.

### Key modules

- `@nuxt/content` - Markdown content with SQLite-backed querying via `queryCollection("content")`
- `@nuxt/ui` + TailwindCSS 4 - UI components (UContainer, UPageGrid, UApp, etc.)
- `@nuxt/image` - Image optimisation
- `@nuxt/scripts` - Third-party script loading
- `@nuxtjs/seo` - SEO including sitemap, robots, OG images, schema.org
- `nuxt-gtag` - Google Analytics
- `@artmizu/nuxt-prometheus` - Prometheus metrics endpoint

### Content structure

Blog posts live in `content/YYYY/MM/DD/slug.md`. The URL path mirrors the directory structure. All markdown files are indexed in a single `content` collection defined in `content.config.ts`.

Post frontmatter schema (defined in `content.config.ts`):

- `title` (required)
- `date` (required, format: `YYYY-MM-DD HH:mm +ZZZZ`)
- `tags` (array of strings)
- `category` (optional string)
- `intro` (optional summary)
- `image` (optional URL, typically `/images/posts/YYYY/MM/DD/filename.ext`)
- `embedImage` (optional URL)
- `series` (optional string for grouping related posts)

Post images are stored in `public/images/posts/YYYY/MM/DD/`.

### App structure (`app/`)

- `app.vue` - Root component: NavBar + NuxtPage + NavFooter
- `pages/index.vue` - Paginated post list (12 per page)
- `pages/[...slug].vue` - Individual post renderer using `PostsLong`
- `pages/tags/`, `pages/categories/`, `pages/series/` - Taxonomy pages
- `pages/keys.vue`, `pages/version.vue` - Utility pages

**Components** (`app/components/`):

- `posts/short.vue` - Post card for list views
- `posts/long.vue` - Full post renderer with `<ContentRenderer>`
- `posts/pagination.vue` - Pagination controls
- `nav/bar.vue`, `nav/footer.vue` - Site navigation
- `badge/`, `content/`, `tags/`, `categories/`, `series/` - Supporting components

**Composables** (`app/composables/`):

- `usePaging.ts` - Pagination logic (12 posts/page)
- `useDates.ts` - Date formatting via Luxon (parses `YYYY-MM-DD HH:mm ZZZ` and `YYYY-MM-DD HH:mm:ss ZZZ`)
- `useLinks.ts`, `useStrings.ts`, `useBadges.ts` - Utility helpers

### Querying content

Use `queryCollection("content")` in pages/components. The collection supports `.select()`, `.order()`, `.limit()`, `.where()`, `.path()`, `.count()`, and `.all()`/`.first()`.

### Code style

ESLint + Prettier are configured with pre-commit hooks via Husky and lint-staged (runs `pnpm lint:fix` on staged `.js`, `.ts`, `.vue` files).

## Working with content files

Only frontmatter (header metadata) should be edited in `content/` files. Do not write or modify the post body unless explicitly asked to fix a markdown issue.

### Tagging posts

When helping tag a post, reusing existing tags from other posts is fine. Any new tag (not already used elsewhere) must be confirmed with the user before adding.

## TypeScript

- All changes must pass linting (`pnpm lint`) and type checking
- `any` is never acceptable — always use correct, specific types

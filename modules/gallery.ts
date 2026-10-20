import { relative } from "node:path"

import { defineNuxtModule } from "nuxt/kit"

import { resolveGalleryRefs } from "../shared/lycheeContent"

// Gallery photos (`image: lychee:<id>`, `:lychee{id}`) are resolved while the
// content is parsed, so the running site never calls the gallery's API.
//
// Nuxt Content drops a post whose parsing throws, with only a warning, so
// problems are collected instead. A build fails on them in build:before, which
// runs after content is parsed in modules:done; dev keeps the post and shows
// the problem in place.
export default defineNuxtModule({
  meta: { name: "gallery" },
  setup(_, nuxt) {
    const problems: string[] = []

    nuxt.hook(
      "content:file:afterParse",
      async ({ file, content, collection }) => {
        if (collection.name !== "content") {
          return
        }
        const where = relative(nuxt.options.rootDir, file.path)
        for (const problem of await resolveGalleryRefs(content)) {
          console.error(`[gallery] ${where}: ${problem}`)
          problems.push(`${where}: ${problem}`)
        }
      },
    )

    nuxt.hook("build:before", () => {
      if (!nuxt.options.dev && problems.length > 0) {
        throw new Error(
          `Gallery references that don't resolve:\n${problems.join("\n")}`,
        )
      }
    })
  },
})

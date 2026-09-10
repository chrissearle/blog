import slugify from "slugify"
// Explicit: the app-side auto-import of the same name (no event arg) shadows the Nitro one in typecheck
import { queryCollection } from "@nuxt/content/nitro"

// Must match safeString() in app/composables/useStrings.ts so feed URLs sit beside category pages
const safeString = (input: string): string => slugify(input, { lower: true })

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "category")

  // Frontmatter holds the display name ("Drones & RC"); the URL holds its slug ("drones-and-rc")
  const categories = await queryCollection(event, "content")
    .where("category", "IS NOT NULL")
    .select("category")
    .all()

  const category = categories
    .map((post) => post.category)
    .find((name) => name !== undefined && safeString(name) === slug)

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: "Unknown category" })
  }

  const posts = await queryCollection(event, "content")
    .where("category", "=", category)
    .order("date", "DESC")
    .limit(FEED_ITEM_COUNT)
    .all()

  return renderFeed(
    event,
    {
      title: `Chris Searle - ${category}`,
      description: `Posts in the ${category} category`,
      pagePath: `/categories/${slug}/`,
      feedPath: `/categories/${slug}/feed.xml`,
    },
    posts,
  )
})

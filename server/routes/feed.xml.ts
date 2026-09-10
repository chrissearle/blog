// Explicit: the app-side auto-import of the same name (no event arg) shadows the Nitro one in typecheck
import { queryCollection } from "@nuxt/content/nitro"

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, "content")
    .order("date", "DESC")
    .limit(FEED_ITEM_COUNT)
    .all()

  return renderFeed(
    event,
    {
      title: "Chris Searle",
      description: "Latest posts from chrissearle.org",
      pagePath: "/",
      feedPath: "/feed.xml",
    },
    posts,
  )
})

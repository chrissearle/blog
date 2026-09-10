// Explicit: the app-side auto-import of the same name (no event arg) shadows the Nitro one in typecheck
import { queryCollection } from "@nuxt/content/nitro"

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, "content")
    .where("targets", "IS NOT NULL")
    .order("date", "DESC")
    .limit(FEED_ITEM_COUNT)
    .all()

  return renderFeed(
    event,
    {
      title: "Chris Searle - Astrophotography",
      description: "Deep-sky objects I've photographed",
      pagePath: "/astrophotography/",
      feedPath: "/astrophotography/feed.xml",
    },
    posts,
  )
})

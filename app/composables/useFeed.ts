// Advertise an RSS feed for the current page and make sure it gets prerendered.
// Nitro's crawler ignores hrefs ending in .xml, so <link> alone would not pull the feed into the build -
// prerenderRoutes() adds it via the x-nitro-prerender header instead.
export const useFeed = (feedPath: string, title: string) => {
  useHead({
    link: [
      {
        rel: "alternate",
        type: "application/rss+xml",
        title,
        href: feedPath,
        key: `feed-${feedPath}`,
      },
    ],
  })

  prerenderRoutes(feedPath)
}

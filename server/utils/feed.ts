import type { H3Event } from "h3"
import type { ContentCollectionItem } from "@nuxt/content"
import { DateTime } from "luxon"
import { getSiteConfig } from "#site-config/server/composables/getSiteConfig"

export const FEED_ITEM_COUNT = 20

export interface FeedChannel {
  title: string
  description: string
  // Site-relative page the feed belongs to, e.g. "/categories/photography/"
  pagePath: string
  // Site-relative path of the feed itself, e.g. "/categories/photography/feed.xml"
  feedPath: string
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

// Same formats as app/composables/useDates.ts
const parseDate = (value: string): DateTime | undefined =>
  ["yyyy-MM-dd HH:mm ZZZ", "yyyy-MM-dd HH:mm:ss ZZZ"]
    .map((format) => DateTime.fromFormat(value, format))
    .find((dt) => dt.isValid)

const absolute = (base: string, path: string): string =>
  new URL(path, base).toString()

const itemXml = (base: string, post: ContentCollectionItem): string => {
  const link = absolute(
    base,
    post.path.endsWith("/") ? post.path : `${post.path}/`,
  )
  const pubDate = parseDate(post.date)?.toRFC2822()
  const summary = post.intro ?? firstParagraph(post.body)

  const html = [
    post.image
      ? `<p><img src="${absolute(base, post.image)}" alt="" /></p>`
      : "",
    summary ? `<p>${escapeXml(summary)}</p>` : "",
    `<p><a href="${link}">Read more…</a></p>`,
  ].join("")

  return [
    "<item>",
    `<title>${escapeXml(post.title)}</title>`,
    `<link>${link}</link>`,
    `<guid isPermaLink="true">${link}</guid>`,
    pubDate ? `<pubDate>${pubDate}</pubDate>` : "",
    post.category ? `<category>${escapeXml(post.category)}</category>` : "",
    `<description>${escapeXml(html)}</description>`,
    "</item>",
  ].join("")
}

export const renderFeed = (
  event: H3Event,
  channel: FeedChannel,
  posts: ContentCollectionItem[],
): string => {
  const base = getSiteConfig(event).url
  const lastBuildDate = posts[0]
    ? parseDate(posts[0].date)?.toRFC2822()
    : undefined

  setHeader(event, "Content-Type", "application/rss+xml; charset=utf-8")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `<title>${escapeXml(channel.title)}</title>`,
    `<link>${absolute(base, channel.pagePath)}</link>`,
    `<description>${escapeXml(channel.description)}</description>`,
    "<language>en</language>",
    `<atom:link href="${absolute(base, channel.feedPath)}" rel="self" type="application/rss+xml" />`,
    lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : "",
    ...posts.map((post) => itemXml(base, post)),
    "</channel>",
    "</rss>",
  ].join("\n")
}

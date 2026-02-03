import { defineCollection, defineContentConfig, z } from "@nuxt/content"

import { asSitemapCollection } from "@nuxtjs/sitemap/content"

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Date must be YYYY-MM-DD format"),
  tags: z.array(z.string()).default([]),
  image: z.string().url().optional(),
  category: z.string().optional(),
  intro: z
    .string()
    .min(10, "Intro should be at least 10 characters")
    .optional(),
  embedImage: z.string().url().optional(),
  series: z.string().optional(),
  sitemap: z.any().optional(),
})

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSitemapCollection({
        type: "page",
        source: "**/*.md",
        schema: contentSchema,
      }),
    ),
  },
})

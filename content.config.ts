import { defineCollection, defineContentConfig, z } from "@nuxt/content"

import { defineSitemapSchema } from "@nuxtjs/seo/content"

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: "page",
      source: "**/*.md",
      schema: z.object({
        title: z.string().min(1, "Title is required"),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}/, "Date must be YYYY-MM-DD format"),
        tags: z.array(z.string()).default([]),
        // A local /images/... path, any URL, or a gallery photo as lychee:<id> -
        // nuxt.config.ts resolves that to the gallery URL at build time
        image: z.string().url().optional(),
        // The gallery photo page, set at build time for lychee: images
        imageLink: z.string().url().optional(),
        // Lychee's size variants for cards and thumbnails, set with imageLink
        imageSrcset: z.string().optional(),
        category: z.string().optional(),
        intro: z
          .string()
          .min(10, "Intro should be at least 10 characters")
          .optional(),
        embedImage: z.string().url().optional(),
        series: z.string().optional(),
        // Astrophotography posts: one entry per object imaged - drives /astrophotography
        targets: z
          .array(
            z.object({
              name: z.string(),
              // Display form from scripts/astro/catalogs.ts: "Messier 81", "NGC 3031", "Sh2-142"
              ids: z.array(z.string()).default([]),
              type: z
                .enum(["galaxy", "nebula", "cluster", "planet", "moon", "star"])
                .optional(),
              constellation: z.string().optional(),
              // J2000, in degrees - places the target on the /astrophotography sky map.
              // Left out for the Sun, Moon and planets, which move
              ra: z.number().optional(),
              dec: z.number().optional(),
            }),
          )
          .optional(),
        sitemap: defineSitemapSchema({ z }),
      }),
    }),
  },
})

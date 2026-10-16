// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-12-03",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/seo",
    "@nuxt/ui",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
  ],

  css: ["~/assets/css/main.css"],

  site: {
    url: "https://www.chrissearle.org",
    name: "Chris Searle",
    trailingSlash: true,
  },

  content: {
    build: {
      markdown: {
        rehypePlugins: {
          "rehype-external-links": {
            options: {
              target: "_blank",
              rel: "noopener noreferer nofollow",
            },
          },
        },
      },
    },
  },

  mdc: {
    highlight: {
      theme: "github-dark",
      langs: [
        "diff",
        "ts",
        "js",
        "css",
        "java",
        "groovy",
        "sql",
        "xml",
        "json",
        "kotlin",
        "scala",
        "c",
        "cpp",
        "lua",
        "ruby",
        "perl",
        "swift",
        "shell",
        "yaml",
        "log",
        "ini",
      ],
    },
  },

  // Infrastructure only: app/plugins/umami.client.ts loads the tracker with
  // the deployment's settings. Without this entry the module bundles Umami
  // Cloud's script at build time and proxies its sends to Umami Cloud, which
  // overrides the self-hosted src
  scripts: {
    registry: {
      umamiAnalytics: { trigger: false, proxy: false, bundle: false },
    },
  },

  runtimeConfig: {
    // Umami, served to the client by server/api/analytics.get.ts. Set only by
    // the production deployment (NUXT_UMAMI_WEBSITE_ID, NUXT_UMAMI_DOMAINS as
    // a JSON array, NUXT_UMAMI_SRC). blog.home runs the same image without
    // them, so it loads no tracker. Not public runtime config: prerendered
    // pages carry that from build time, and a pod env var never reaches it
    umami: {
      websiteId: "",
      domains: [] as string[],
      src: "",
    },
    // Prometheus scrapes this port in-cluster; the ingress only routes 3000.
    // Override with NUXT_METRICS_PORT
    metricsPort: 9090,
    public: {
      imageTag: "",
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/"],
    },
  },

  sitemap: {
    exclude: ["/version", "/page/**"],
  },

  // og:image is set per post from its own image in posts/long.vue; nothing
  // uses generated OG images, and nuxt-og-image 7 needs a renderer for them
  ogImage: {
    enabled: false,
  },

  // Both arrive with @nuxtjs/seo 6. Skew protection's asset store lives in a
  // cache the Docker build discards, leaving only its client polling and
  // cookie; nothing here consumes llms.txt or the per-page markdown copies.
  skewProtection: {
    enabled: false,
  },

  aiReady: {
    enabled: false,
  },

  linkChecker: {
    excludeLinks: [
      "https://www.chrissearle.org",
      "https://www.chrissearle.org/",
      // site-config's isPathFile() extension list lacks these, so the
      // trailing-slash inspection treats download links as page routes
      /\.(?:stl|kml)$/,
    ],
  },

  colorMode: {
    preference: "system",
    fallback: "dark",
    storageKey: "nuxt-color-mode",
  },

  icon: {
    clientBundle: {
      icons: [
        "heroicons:arrow-right-20-solid",
        "heroicons:chevron-double-left",
        "heroicons:chevron-double-right",
        "heroicons:moon",
        "heroicons:sun",
        "heroicons:tag",
        "heroicons:user-group",
        "lucide:telescope",
      ],
    },
  },

  vite: {
    optimizeDeps: {
      include: ["@unhead/schema-org/vue", "luxon"],
    },
  },
})

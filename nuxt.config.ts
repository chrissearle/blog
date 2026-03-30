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
    "nuxt-gtag",
    "@artmizu/nuxt-prometheus",
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

  gtag: {
    id: "G-MFFN7PQDM8",
  },

  runtimeConfig: {
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

  // Images are generated at build time, so we can skip the runtime signing etc
  ogImage: {
    zeroRuntime: true,
  },

  linkChecker: {
    excludeLinks: [
      "https://www.chrissearle.org",
      "https://www.chrissearle.org/",
    ],
  },

  vite: {
    optimizeDeps: {
      include: ["luxon"],
    },
  },
})

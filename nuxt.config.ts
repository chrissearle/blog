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
    markdown: {
      rehypePlugins: [
        "rehype-external-links",
        {
          target: "_blank",
          rel: "noopener noreferer nofollow",
        },
      ],
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
})

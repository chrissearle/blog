// @ts-check
import prettierRecommended from "eslint-plugin-prettier/recommended"
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  {
    ignores: ["**/*.md"],
  },
  // Prettier owns formatting: differences are ESLint errors that lint:fix
  // rewrites, and eslint-config-prettier turns off the stylistic rules that
  // would disagree. Before the project rules so vue/html-self-closing stays on;
  // Prettier keeps self-closing tags as written, so the two agree
  prettierRecommended,
  {
    rules: {
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "never",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
)

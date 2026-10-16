// Umami's registry entry in nuxt.config.ts is infrastructure only (trigger:
// false). Loading it here, through useUmami, means an empty websiteId leaves
// the tracker off entirely, without the module warning on every build about
// the missing id
export default defineNuxtPlugin(() => {
  useUmami()
})

// Umami's registry entry in nuxt.config.ts is infrastructure only (trigger:
// false): useUmami decides whether this host should load the tracker at all
export default defineNuxtPlugin(() => {
  useUmami()
})

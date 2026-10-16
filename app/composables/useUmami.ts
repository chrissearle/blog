// Umami from the scripts registry (nuxt.config.ts), or undefined when this
// build has no websiteId, so nothing loads the tracker before Umami has a
// website for the site
export const useUmami = () => {
  const { websiteId } = useRuntimeConfig().public.scripts.umamiAnalytics
  if (!websiteId) return undefined

  return useScriptUmamiAnalytics({ scriptOptions: { trigger: "onNuxtReady" } })
}

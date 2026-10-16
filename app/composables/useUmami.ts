// Umami from the scripts registry (nuxt.config.ts), or undefined where it
// shouldn't load: on the server, in a build without a websiteId, and on any
// host not in domains (local dev and preview, blog.home). The tracker checks
// domains itself, but only after it has been fetched, so without this every
// page view on those hosts would still download script.js from Umami
export const useUmami = () => {
  if (import.meta.server) return undefined

  const { websiteId, domains } =
    useRuntimeConfig().public.scripts.umamiAnalytics
  if (!websiteId || !domains.includes(window.location.hostname))
    return undefined

  return useScriptUmamiAnalytics({ scriptOptions: { trigger: "onNuxtReady" } })
}

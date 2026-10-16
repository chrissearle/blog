<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps<{ error: NuxtError }>()

useHead({
  title: `${props.error.statusCode} ${props.error.statusMessage ?? ""}`,
})

// The tracker's own pageview can't say the page failed. A per-status event
// with the path and where the visitor came from does: an internal referer
// points at the post holding a broken link, an external one at an old or
// mistyped link elsewhere
const umami = useUmami()

// After client-side navigation document.referrer still names whatever referred
// the first page load; Vue Router keeps the previous in-site path in
// history.state.back
const referrer = (): string => {
  const state: unknown = window.history.state
  if (
    state &&
    typeof state === "object" &&
    "back" in state &&
    typeof state.back === "string"
  )
    return new URL(state.back, window.location.origin).href
  return document.referrer || "(none)"
}

onMounted(() => {
  umami?.proxy.track(`error-${props.error.statusCode}`, {
    path: window.location.pathname,
    referrer: referrer(),
  })
})
</script>

<template>
  <UApp>
    <NavBar />

    <main class="flex-1">
      <UContainer class="pb-12">
        <UError :error="error" redirect="/" />
      </UContainer>
    </main>

    <NavFooter />
  </UApp>
</template>

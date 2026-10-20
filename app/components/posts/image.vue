<script setup lang="ts">
// A post's header image on cards and thumbnails. A gallery image comes with
// its own srcset (Lychee's size variants, set at build time by
// shared/lycheeContent.ts) and loads straight from the gallery; anything else
// goes through NuxtImg.
const props = defineProps<{
  src: string
  srcset?: string
  alt: string
  width?: string | number
  height?: string | number
  // NuxtImg syntax: "100vw sm:50vw lg:400px". Defaults to the width
  sizes?: string
  fit?: string
}>()

// @nuxt/image's default screens
const SCREENS: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

// "100vw sm:50vw lg:400px" → "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
const mediaSizes = computed(() => {
  if (!props.sizes) {
    return props.width ? `${props.width}px` : undefined
  }
  return props.sizes
    .split(/\s+/)
    .filter(Boolean)
    .map((entry) => {
      const [screen, size] = entry.includes(":")
        ? entry.split(":")
        : ["", entry]
      return { min: SCREENS[screen ?? ""] ?? 0, size }
    })
    .sort((a, b) => b.min - a.min)
    .map(({ min, size }) => (min ? `(min-width: ${min}px) ${size}` : size))
    .join(", ")
})
</script>

<template>
  <img
    v-if="srcset"
    :src="src"
    :srcset="srcset"
    :sizes="mediaSizes"
    :width="width"
    :height="height"
    :alt="alt"
    loading="lazy"
  />
  <NuxtImg
    v-else
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    :fit="fit"
  />
</template>

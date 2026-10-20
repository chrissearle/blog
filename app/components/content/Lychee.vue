<script setup lang="ts">
// :lychee{id="..."} - a photo from gallery.chrissearle.org. Everything but the
// id (and an optional title) is filled in at build time by
// shared/lycheeContent.ts. Lychee already has the sizes, so the browser loads
// them straight from the gallery rather than through NuxtImg.
//
// Without src the id didn't resolve: a build fails on that, so only dev
// renders the notice below.
defineProps<{
  id: string
  src?: string
  srcset?: string
  width?: string | number
  height?: string | number
  title?: string
  href?: string
}>()

const captionId = useId()
</script>

<template>
  <UAlert
    v-if="!src"
    class="my-5"
    color="error"
    variant="subtle"
    :title="`Gallery photo ${id} is not public or does not exist`"
  />
  <figure v-else class="my-5">
    <a
      :href="href"
      target="_blank"
      rel="noopener"
      class="group block w-fit mx-auto rounded-lg focus:outline-none"
      :aria-labelledby="captionId"
    >
      <img
        :src="src"
        :srcset="srcset"
        sizes="(min-width: 640px) 700px, 100vw"
        :width="width"
        :height="height"
        :alt="title"
        loading="lazy"
        class="block mx-auto max-w-full h-auto max-h-[600px] object-contain rounded-lg transition-all group-hover:opacity-90 group-hover:shadow-lg group-hover:scale-[1.02]"
      />
      <span class="sr-only">Open in the gallery: {{ title }}</span>
    </a>

    <figcaption
      :id="captionId"
      class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      {{ title }}
    </figcaption>
  </figure>
</template>

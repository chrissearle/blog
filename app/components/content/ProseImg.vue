<script setup lang="ts">
import { withBase } from 'ufo'

const captionId = useId()
const isLightboxOpen = ref(false)

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  }
})

const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    return withBase(props.src, useRuntimeConfig().app.baseURL)
  }
  return props.src
})

const openLightbox = () => {
  isLightboxOpen.value = true
}

const closeLightbox = () => {
  isLightboxOpen.value = false
}
</script>

<template>
  <figure class="my-5">
    <button
      type="button"
      class="group block mx-auto cursor-zoom-in focus:outline-none rounded-lg"
      :aria-labelledby="captionId"
      @click="openLightbox"
    >
      <NuxtImg
        :src="refinedSrc"
        :alt="alt"
        width="1600"
        sizes="100vw sm:700px"
        class="block mx-auto max-w-full max-h-[600px] object-contain rounded-lg transition-all group-hover:opacity-90 group-hover:shadow-lg group-hover:scale-[1.02]"
      />
      <span class="sr-only">Click to view full size: {{ alt }}</span>
    </button>

    <figcaption
      :id="captionId"
      class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      {{ alt }}
    </figcaption>
  </figure>

  <ImageLightbox
    :src="refinedSrc"
    :alt="alt"
    :is-open="isLightboxOpen"
    @close="closeLightbox"
  />
</template>

<template>
  <figure class="my-5">
    <button
      type="button"
      class="w-full cursor-zoom-in focus:outline-none rounded-lg transition-all hover:shadow-lg hover:scale-[1.02]"
      :aria-labelledby="captionId"
      @click="openLightbox"
    >
      <NuxtImg
        :src="refinedSrc"
        :alt="alt"
        class="w-full max-h-[600px] object-contain rounded-lg hover:opacity-90 transition-opacity"
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

<script setup lang="ts">
import { withBase } from 'ufo'
import { computed, useRuntimeConfig } from '#imports'

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

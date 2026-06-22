<script setup lang="ts">
const props = defineProps<{
  id: string
  title: string
}>()

const baseUrl = 'https://360.chrissearle.org'

const thumbUrl = computed(() => `${baseUrl}/thumb/${props.id}`)
const embedUrl = computed(() => `${baseUrl}/embed/${props.id}`)
const panoUrl = computed(() => `${baseUrl}/pano/${props.id}`)
</script>

<template>
  <div class="my-5">
    <div class="relative w-full" style="padding-top: 56.25%">
      <a :href="panoUrl" target="_blank" class="absolute inset-0">
        <img
          :src="thumbUrl"
          :alt="title"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </a>
      <iframe
        :src="embedUrl"
        :title="title"
        class="absolute inset-0 w-full h-full"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

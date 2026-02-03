<script setup lang="ts">
const props = defineProps<{
  id: string
  title: string
  image: string
  width: string | number
  height: string | number
}>()

const widthAttr = computed(() => String(props.width))
const heightAttr = computed(() => String(props.height))

const flickrUrl = computed(
  () => `https://www.flickr.com/photos/chrissearle/${props.id}/`,
)

if (import.meta.client) {
  useHead({
    script: [
      {
        src: "https://embedr.flickr.com/assets/client-code.js",
        async: true,
        charset: "utf-8",
      },
    ],
  })
}
</script>

<template>
  <div class="my-5 text-center">
    <a
      data-flickr-embed="true"
      data-header="true"
      data-footer="true"
      :href="flickrUrl"
      :title="title"
    >
      <img
        :src="image"
        :width="widthAttr"
        :height="heightAttr"
        :alt="title"
        class="inline-block max-w-full h-auto"
      />
    </a>
  </div>
</template>

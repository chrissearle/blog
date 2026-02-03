<script setup lang="ts">
const props = defineProps<{
  id: string
  title: string
}>()
</script>

<template>
  <section class="mt-10">
    <h2 class="text-2xl font-semibold mb-4">Video: {{ props.title }}</h2>

    <div class="flex justify-center">
      <ScriptYouTubePlayer ref="video" :video-id="props.id" />
    </div>
  </section>
</template>

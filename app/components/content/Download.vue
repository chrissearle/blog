<script setup lang="ts">
const props = defineProps<{
  title: string
  path: string
}>()
</script>

<template>
  <a :href="props.path" :title="props.title">
    {{ props.title }}
  </a>
</template>

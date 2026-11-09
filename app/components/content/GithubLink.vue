<script setup lang="ts">
// Inline GitHub icon linking to a repository: :github-link{href="..."}
const props = defineProps<{
  href: string
}>()
</script>

<template>
  <a
    :href="props.href"
    target="_blank"
    rel="noopener"
    title="Source on GitHub"
    aria-label="Source on GitHub"
    class="inline-flex align-middle"
  >
    <UIcon name="i-lucide-github" class="size-4" />
  </a>
</template>

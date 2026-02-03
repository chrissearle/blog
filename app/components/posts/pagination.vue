<script setup lang="ts">
const { pageLink } = useLinks()

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const isActive = (page: number) => page === props.currentPage
</script>

<template>
  <div class="flex flex-wrap justify-center gap-3 my-6">
    <UButton
      to="/"
      :variant="isActive(1) ? 'solid' : 'soft'"
      size="sm"
      :aria-current="isActive(1) ? 'page' : undefined"
    >
      <UIcon name="i-heroicons-chevron-double-left" class="h-4 w-4" />
      <span class="ml-1">1</span>
    </UButton>

    <UButton
      v-for="p in props.totalPages - 2"
      :key="p"
      :to="pageLink(p + 1)"
      :variant="isActive(p + 1) ? 'solid' : 'soft'"
      size="sm"
      :aria-current="isActive(p + 1) ? 'page' : undefined"
    >
      {{ p + 1 }}
    </UButton>

    <UButton
      :to="pageLink(props.totalPages)"
      :variant="isActive(props.totalPages) ? 'solid' : 'soft'"
      size="sm"
      :aria-current="isActive(props.totalPages) ? 'page' : undefined"
    >
      <span class="mr-1">{{ props.totalPages }}</span>
      <UIcon name="i-heroicons-chevron-double-right" class="h-4 w-4" />
    </UButton>
  </div>
</template>

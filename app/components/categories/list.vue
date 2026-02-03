<script setup lang="ts">
const props = defineProps<{
  categories: string | string[]
}>()

const { badgesForCategories } = useBadges()
const badges = computed(() => badgesForCategories(props.categories))
</script>

<template>
  <BadgeList :badges="badges" />
</template>

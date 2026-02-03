<script setup lang="ts">
const props = defineProps<{
  tags?: string[]
}>()

const { badgesForTags } = useBadges()
const badges = computed(() => badgesForTags(props.tags))
</script>

<template>
  <BadgeList :badges="badges" />
</template>

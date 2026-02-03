<script setup lang="ts">
const props = defineProps<{
  series: string
}>()

const { badgesForSeries } = useBadges()
const badges = computed(() => badgesForSeries(props.series))
</script>

<template>
  <BadgeList :badges="badges" />
</template>

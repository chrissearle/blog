<script setup lang="ts">
import type { Badge } from "~/types/badge"

const props = defineProps<{
  badges: Badge[]
}>()
</script>

<template>
  <BadgeItem
    v-for="badge in props.badges"
    :key="badge.link ?? badge.title"
    v-bind="badge"
  />
</template>

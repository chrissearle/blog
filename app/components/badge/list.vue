<script setup lang="ts">
import type { Badge } from "~/types/badge"

const props = defineProps<{
  badges: Badge[]
}>()
</script>

<template>
  <div class="mt-2 flex flex-wrap gap-2">
    <BadgeItems :badges="props.badges" />
  </div>
</template>

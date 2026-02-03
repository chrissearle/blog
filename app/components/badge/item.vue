<script setup lang="ts">
import type { Badge } from "~/types/badge"

const { link, title, icon } = defineProps<Badge>()
</script>

<template>
  <UBadge variant="soft">
    <NuxtLink :to="link">
      <UIcon v-if="icon" :name="icon" class="h-4 w-4" />
      {{ title }}
    </NuxtLink>
  </UBadge>
</template>

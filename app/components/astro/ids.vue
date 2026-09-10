<script setup lang="ts">
import type { CatalogRef } from "~/composables/useTargets"

const props = defineProps<{
  ids: CatalogRef[]
  // In a column headed by the catalog name, "81" says enough
  numbersOnly?: boolean
}>()

const { shortLabel, idLink } = useTargets()
</script>

<template>
  <span class="inline-flex flex-wrap gap-x-2 gap-y-0.5">
    <NuxtLink
      v-for="id in props.ids"
      :key="id.id"
      :to="idLink(id)"
      :title="id.id"
      class="whitespace-nowrap hover:text-primary hover:underline underline-offset-2"
    >
      {{ props.numbersOnly ? id.number : shortLabel(id) }}
    </NuxtLink>
  </span>
</template>

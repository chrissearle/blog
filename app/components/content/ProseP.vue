<script setup lang="ts">
const slots = useSlots()

const isImage = computed(() => {
  const children = slots.default?.()
  const first = children?.[0]

  return typeof first?.type === "object" && "tag" in first.type
    ? first.type.tag === "img"
    : false
})
</script>

<template>
  <div v-if="isImage"><slot ></slot></div>
  <p v-else class="mt-2"><slot ></slot></p>
</template>

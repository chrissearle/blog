<script setup lang="ts">
const { data: countData } = await useAsyncData(
  "NavIndexCategoriesCountFooter",
  () => queryCollection("content").where("category", "IS NOT NULL").count(),
)

const hasCategories = computed(() => (countData.value ?? 0) > 0)
</script>

<template>
  <UFooter class="md:hidden">
    <UContainer class="py-4">
      <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
        <NuxtLink v-if="hasCategories" to="/categories" class="hover:underline">
          All Categories
        </NuxtLink>

        <NuxtLink to="/tags" class="hover:underline"> All Tags </NuxtLink>

        <NuxtLink to="/series" class="hover:underline"> All Series </NuxtLink>
      </div>
    </UContainer>
  </UFooter>
</template>

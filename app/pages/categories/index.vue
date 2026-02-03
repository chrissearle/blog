<script setup lang="ts">
const { categoryLink } = useLinks()
const { countSplitList } = useStrings()

const { data } = await useAsyncData("Categories", () =>
  queryCollection("content")
    .where("category", "IS NOT NULL")
    .select("category")
    .all(),
)

const countedCategories = countSplitList(
  (data.value ?? []).map((c) => c.category),
)

const categories = new Map(
  [...countedCategories].sort((a, b) => String(a[0]).localeCompare(b[0])),
)
</script>

<template>
  <UContainer>
    <Head>
      <Title>All Categories</Title>
    </Head>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="[category, count] in categories"
        :key="category"
        :to="categoryLink(category)"
        class="inline-block"
      >
        <UBadge icon="i-heroicons-tag" size="xl" variant="soft">
          {{ category }}
          <span class="ml-1 text-xs opacity-70">({{ count }})</span>
        </UBadge>
      </NuxtLink>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { maxPostCount, pageCount } = usePaging()

const { data: count } = await useAsyncData("IndexCount", () =>
  queryCollection("content").count(),
)

const { data: posts } = await useAsyncData("Index", () =>
  queryCollection("content")
    .select(
      "path",
      "title",
      "date",
      "tags",
      "category",
      "intro",
      "image",
      "embedImage",
      "series",
    )
    .order("date", "DESC")
    .limit(maxPostCount)
    .all(),
)

const totalPages = computed(() =>
  pageCount(count.value === undefined ? 0 : count.value),
)
</script>

<template>
  <UContainer>
    <UPageGrid>
      <PostsShort v-for="post in posts" :key="post.path" :post="post" />
    </UPageGrid>

    <PostsPagination
      v-if="totalPages > 1"
      :current-page="1"
      :total-pages="totalPages"
    />
  </UContainer>
</template>

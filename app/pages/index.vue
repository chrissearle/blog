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
    .limit(maxPostCount + 1)
    .all(),
)

const totalPages = computed(() =>
  pageCount(count.value === undefined ? 0 : count.value),
)

const featuredPost = computed(() => posts.value?.[0])
const remainingPosts = computed(() => posts.value?.slice(1) ?? [])
</script>

<template>
  <UContainer>
    <PostsFeatured v-if="featuredPost" :post="featuredPost" />

    <UPageGrid v-if="remainingPosts.length > 0">
      <PostsShort
        v-for="post in remainingPosts"
        :key="post.path"
        :post="post"
      />
    </UPageGrid>

    <PostsPagination
      v-if="totalPages > 1"
      :current-page="1"
      :total-pages="totalPages"
    />
  </UContainer>
</template>

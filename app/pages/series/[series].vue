<script setup lang="ts">
const route = useRoute()
const { safeString } = useStrings()

const slug = route.params.series

const { data: allPosts } = await useAsyncData(`Series-${slug}`, () =>
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
    .all(),
)

const posts = (allPosts.value || []).filter(
  (post: { series: string }) => post.series && safeString(post.series) === slug,
)

const originalSeries =
  posts.length > 0 && posts[0] !== undefined ? posts[0].series : slug
</script>

<template>
  <UContainer>
    <Head>
      <Title>Series: {{ originalSeries }}</Title>
    </Head>

    <h1 class="pageTitle">Series: {{ originalSeries }}</h1>
    <UPageGrid>
      <PostsShort v-for="post in posts" :key="post.path" :post="post" />
    </UPageGrid>
  </UContainer>
</template>

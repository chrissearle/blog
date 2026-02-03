<script setup lang="ts">
const route = useRoute()
const { safeString } = useStrings()

const slug = route.params.category

const { data: allPosts } = await useAsyncData(`Category-${slug}`, () =>
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
  (post: { category: string }) =>
    post.category && safeString(post.category) === slug,
)

const originalCategory =
  posts.length > 0 && posts[0] !== undefined ? posts[0].category : slug
</script>

<template>
  <UContainer>
    <Head>
      <Title>Category: {{ originalCategory }}</Title>
    </Head>

    <h1 class="pageTitle">Category: {{ originalCategory }}</h1>
    <UPageGrid>
      <PostsShort v-for="post in posts" :key="post.path" :post="post" />
    </UPageGrid>
  </UContainer>
</template>

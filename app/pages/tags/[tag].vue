<script setup lang="ts">
const route = useRoute()
const { safeString } = useStrings()

const slug = route.params.tag

const { data: allPosts } = await useAsyncData(`Tag-${slug}`, () =>
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

const posts = (allPosts.value || []).filter((post: { tags: string[] }) =>
  (post.tags || []).some((tag: string) => {
    return safeString(tag) === slug
  }),
)

const originalTag =
  posts.length > 0 && posts[0] !== undefined
    ? posts[0].tags.find((tag: string) => safeString(tag) === slug)
    : slug
</script>

<template>
  <UContainer>
    <Head>
      <Title>Tag: {{ originalTag }}</Title>
    </Head>

    <h1 class="pageTitle">Tag: {{ originalTag }}</h1>
    <UPageGrid>
      <PostsShort v-for="post in posts" :key="post.path" :post="post" />
    </UPageGrid>
  </UContainer>
</template>

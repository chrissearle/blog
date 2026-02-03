<script setup lang="ts">
const { maxPostCount, pageCount } = usePaging()
const route = useRoute()

const page = Number(route.params.number ?? "1")

const { data: count } = await useAsyncData(`PageCount-${page}`, () =>
  queryCollection("content").count(),
)

const { data: posts } = await useAsyncData(`Page-${page}`, () =>
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
    )
    .order("date", "DESC")
    .skip(maxPostCount * (page - 1))
    .limit(maxPostCount)
    .all(),
)

const totalPages = computed(() =>
  pageCount(count.value === undefined ? 0 : count.value),
)
</script>

<template>
  <UContainer>
    <Head>
      <Title>Page {{ page }}</Title>
    </Head>

    <UPageGrid>
      <PostsShort v-for="post in posts" :key="post.path" :post="post" />
    </UPageGrid>

    <PostsPagination
      v-if="totalPages > 1"
      :current-page="page"
      :total-pages="totalPages"
    />
  </UContainer>
</template>

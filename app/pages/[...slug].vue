<script setup lang="ts">
const route = useRoute()

const contentPath = route.path.replace(/\/$/, '') || '/'

const { data: page } = await useAsyncData(`content-${contentPath}`, () =>
  queryCollection("content").path(contentPath).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found" })
}
</script>

<template>
  <UContainer class="pb-12">
    <PostsLong v-if="page" :post="page" />
  </UContainer>
</template>

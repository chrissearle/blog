<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData(`content-${route.path}`, () =>
  queryCollection("content").path(route.path).first(),
)
</script>

<template>
  <UContainer class="pb-12">
    <PostsLong v-if="page" :post="page" />
  </UContainer>
</template>

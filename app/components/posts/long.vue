<script setup lang="ts">
import type { PostPreview } from "~/types/post"

const { splitList } = useStrings()

const props = defineProps<{
  post: PostPreview
}>()

const opts = {
  title: props.post.title,
  ogTitle: props.post.title,
  ogType: "article",
}

if (props.post.image) {
  opts.ogImage = useSiteConfig().url + props.post.image
}

if (props.post.intro) {
  opts.ogDescription = props.post.intro
}

useSeoMeta(opts)

const categories = splitList(props.post.category)
</script>
<template>
  <div>
    <h1 class="pageTitle">{{ props.post.title }}</h1>

    <div class="mt-2 flex flex-wrap gap-2">
      <SeriesBadge v-if="post.series" :series="post.series" />
      <CategoriesBadges :categories="categories" />
      <TagsBadges :tags="props.post.tags" />
    </div>

    <ContentRenderer :value="props.post" />
  </div>
</template>

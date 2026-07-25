<script setup lang="ts">
import type { UseSeoMetaInput } from "@unhead/vue"
import type { PostPreview } from "~/types/post"

const { dateFormat } = useDates()
const { splitList } = useStrings()
const img = useImage()

const props = defineProps<{
  post: PostPreview
}>()

const opts: UseSeoMetaInput = {
  title: props.post.title,
  ogTitle: props.post.title,
  ogType: "article",
}

if (props.post.image) {
  const resizedImage = img(
    props.post.image,
    { width: 1200 },
    { provider: "ipx" },
  )
  opts.ogImage = useSiteConfig().url + resizedImage
}

if (props.post.intro) {
  opts.ogDescription = props.post.intro
}

useSeoMeta(opts)

const categories = splitList(props.post.category)
</script>

<template>
  <div>
    <div class="border-l-4 border-violet-500 pl-4 mb-6">
      <h1 class="pageTitle !mb-1">{{ props.post.title }}</h1>
      <p class="font-mono text-xs text-secondary">
        {{ dateFormat(post.date) }}
      </p>
    </div>

    <div class="mb-8 flex flex-wrap gap-2">
      <SeriesBadge v-if="post.series" :series="post.series" />
      <CategoriesBadges :categories="categories" />
      <TagsBadges :tags="props.post.tags" />
    </div>

    <div class="post-content">
      <ContentRenderer :value="props.post" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PostPreview } from "~/types/post"

const { dateFormat } = useDates()
const { splitList } = useStrings()

const props = defineProps<{
  post: PostPreview
}>()

const categories = splitList(props.post.category)

const postPath = computed(() =>
  props.post.path.endsWith("/") ? props.post.path : `${props.post.path}/`,
)
</script>

<template>
  <div
    class="rounded-xl border-2 border-violet-500 dark:border-violet-400 overflow-hidden mb-8 bg-white dark:bg-zinc-900"
  >
    <NuxtLink
      v-if="post.image || post.embedImage"
      :to="postPath"
      :aria-label="`Read post: ${post.title}`"
      class="block"
    >
      <NuxtImg
        :src="post.image || post.embedImage"
        :alt="post.title"
        class="w-full max-h-[360px] object-cover transition-transform duration-300 hover:scale-[1.01]"
      />
    </NuxtLink>

    <div class="p-6">
      <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
        <h2 class="text-2xl font-bold tracking-tight leading-tight">
          <NuxtLink
            :to="postPath"
            class="hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
          >
            {{ post.title }}
          </NuxtLink>
        </h2>
        <p class="font-mono text-xs text-muted shrink-0">
          {{ dateFormat(post.date) }}
        </p>
      </div>

      <p v-if="post.intro" class="leading-7 text-muted mb-4">
        {{ post.intro }}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <SeriesList v-if="post.series" :series="post.series" />
          <CategoriesList :categories="categories" />
          <TagsList :tags="post.tags" />
        </div>

        <UButton
          :to="postPath"
          variant="solid"
          color="primary"
          size="sm"
          trailing-icon="i-heroicons-arrow-right-20-solid"
          class="shrink-0"
        >
          Read post
        </UButton>
      </div>
    </div>
  </div>
</template>

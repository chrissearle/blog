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
  <UPageCard>
    <template #header>
      <h3 class="text-base font-semibold">
        <NuxtLink :to="postPath">{{ post.title }}</NuxtLink>
      </h3>

      <p class="text-sm text-muted">
        {{ dateFormat(post.date) }}
      </p>
    </template>

    <template #body>
      <p class="mb-4">
        {{ post.intro }}
      </p>

      <NuxtLink
        v-if="post.image || post.embedImage"
        :to="postPath"
        :aria-label="`Read post: ${post.title}`"
        class="block w-full rounded-lg mb-4 transition-all hover:scale-[1.02]"
      >
        <NuxtImg
          :src="post.image || post.embedImage"
          :alt="post.title"
          class="w-full rounded-lg"
        />
      </NuxtLink>

      <div class="flex justify-end">
        <UButton
          :to="postPath"
          variant="soft"
          color="primary"
          size="sm"
          trailing-icon="i-heroicons-arrow-right-20-solid"
          class="my-2"
        >
          Read post
        </UButton>
      </div>
    </template>

    <template #footer>
      <SeriesList v-if="post.series" :series="post.series" />
      <CategoriesList :categories="categories" />
      <TagsList :tags="post.tags" />
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import type { PostPreview } from "~/types/post"

const { dateFormat } = useDates()
const { splitList } = useStrings()

const props = defineProps<{
  post: PostPreview
}>()

const categories = splitList(props.post.category)
</script>

<template>
  <UPageCard>
    <template #header>
      <h3 class="text-base font-semibold">
        <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
      </h3>

      <p class="text-sm text-muted">
        {{ dateFormat(post.date) }}
      </p>
    </template>

    <template #body>
      <p class="mb-4">
        {{ post.intro }}
      </p>

      <NuxtImg
        v-if="post.image || post.embedImage"
        :src="post.image || post.embedImage"
        :alt="post.title"
        class="w-full rounded-lg mb-4"
      />

      <div class="flex justify-end">
        <UButton
          :to="post.path"
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

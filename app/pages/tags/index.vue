<script setup lang="ts">
const { tagsLink } = useLinks()
const { countSplitList } = useStrings()

const { data } = await useAsyncData("Tags", () =>
  queryCollection("content").where("tags", "IS NOT NULL").select("tags").all(),
)
const tags = countSplitList((data.value ?? []).map((t) => t.tags).flat())

const sortedTags = new Map(
  [...tags].sort((a, b) => String(a[0]).localeCompare(b[0])),
)
</script>

<template>
  <UContainer>
    <Head>
      <Title>All Tags</Title>
    </Head>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="[tag, count] in sortedTags"
        :key="tag"
        :to="tagsLink(tag)"
        class="inline-block"
      >
        <UBadge size="xl" variant="soft">
          {{ tag }}
          <span class="ml-1 text-xs opacity-70">({{ count }})</span>
        </UBadge>
      </NuxtLink>
    </div>
  </UContainer>
</template>

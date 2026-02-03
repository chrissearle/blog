<script setup lang="ts">
const { seriesLink } = useLinks()
const { countSplitList } = useStrings()

const { data } = await useAsyncData("Series", () =>
  queryCollection("content")
    .where("series", "IS NOT NULL")
    .order("series", "ASC")
    .all(),
)

const countedSeries = countSplitList((data.value ?? []).map((s) => s.series))

const sortedSeries = new Map(
  [...countedSeries].sort((a, b) => String(a[0]).localeCompare(b[0])),
)
</script>

<template>
  <UContainer>
    <Head>
      <Title>All Series</Title>
    </Head>

    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="[series, count] in sortedSeries"
        :key="series"
        :to="seriesLink(series)"
        class="inline-block"
      >
        <UBadge icon="i-heroicons-user-group" size="xl" variant="soft">
          {{ series }}
          <span class="ml-1 text-xs opacity-70">({{ count }})</span>
        </UBadge>
      </NuxtLink>
    </div>
  </UContainer>
</template>

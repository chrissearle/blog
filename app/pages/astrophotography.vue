<script setup lang="ts">
import { MAIN_CATALOGS } from "~/composables/useTargets"

const { buildRows, idsIn, otherIds, progress, shortLabel, idLink } =
  useTargets()
const { dateFormat } = useDates()

const { data } = await useAsyncData("Astrophotography", () =>
  queryCollection("content")
    .where("targets", "IS NOT NULL")
    .select("path", "title", "date", "image", "embedImage", "targets")
    .order("date", "DESC")
    .all(),
)

const rows = computed(() => buildRows(data.value ?? []))
const stats = computed(() => progress(rows.value))

const description =
  "Every deep-sky object I've photographed so far, with catalog numbers."

useSeoMeta({
  title: "Astrophotography",
  ogTitle: "Astrophotography",
  description,
  ogDescription: description,
})
</script>

<template>
  <UContainer class="pb-12">
    <div class="border-l-4 border-primary pl-4 mb-6">
      <h1 class="pageTitle !mb-1">Astrophotography</h1>
      <p class="text-sm text-muted">{{ description }}</p>
    </div>

    <div class="mb-6 flex flex-wrap gap-2">
      <UBadge variant="soft" color="neutral" icon="i-lucide-telescope">
        {{ rows.length }} targets
      </UBadge>
      <UBadge v-for="s in stats" :key="s.catalog" variant="soft">
        {{ s.catalog }} {{ s.seen }} / {{ s.size }}
      </UBadge>
    </div>

    <!-- md and up: one table -->
    <div
      class="hidden md:block overflow-x-auto rounded-lg border border-default"
    >
      <table class="w-full text-sm">
        <thead
          class="bg-elevated text-left text-xs uppercase tracking-wide text-muted"
        >
          <tr>
            <th class="px-3 py-2 font-medium">Target</th>
            <th
              v-for="catalog in MAIN_CATALOGS"
              :key="catalog"
              class="px-3 py-2 font-medium"
            >
              {{ catalog }}
            </th>
            <th class="px-3 py-2 font-medium">Other</th>
            <th class="px-3 py-2 font-medium">Type</th>
            <th class="hidden lg:table-cell px-3 py-2 font-medium">
              Constellation
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="row in rows" :key="row.name" class="hover:bg-elevated/50">
            <td class="px-3 py-2">
              <div class="flex items-center gap-3">
                <NuxtLink
                  v-if="row.posts[0]?.image"
                  :to="row.posts[0].path"
                  tabindex="-1"
                  aria-hidden="true"
                  class="shrink-0"
                >
                  <NuxtImg
                    :src="row.posts[0].image"
                    width="80"
                    height="80"
                    fit="cover"
                    alt=""
                    class="size-10 rounded object-cover"
                  />
                </NuxtLink>
                <div>
                  <NuxtLink
                    :to="row.posts[0]?.path"
                    class="font-medium hover:text-primary"
                  >
                    {{ row.name }}
                  </NuxtLink>
                  <p
                    v-if="row.posts.length > 1"
                    class="font-mono text-xs text-muted"
                  >
                    also
                    <NuxtLink
                      v-for="post in row.posts.slice(1)"
                      :key="post.path"
                      :to="post.path"
                      class="hover:text-primary"
                    >
                      {{ dateFormat(post.date) }}
                    </NuxtLink>
                  </p>
                </div>
              </div>
            </td>
            <td
              v-for="catalog in MAIN_CATALOGS"
              :key="catalog"
              class="px-3 py-2 tabular-nums"
            >
              <AstroIds :ids="idsIn(row, catalog)" numbers-only />
            </td>
            <td class="px-3 py-2">
              <AstroIds :ids="otherIds(row)" />
            </td>
            <td class="px-3 py-2 capitalize text-muted">{{ row.type }}</td>
            <td class="hidden lg:table-cell px-3 py-2 text-muted">
              {{ row.constellation }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Below md: one card per target -->
    <ul class="md:hidden space-y-3">
      <li
        v-for="row in rows"
        :key="row.name"
        class="flex gap-3 rounded-lg border border-default p-3"
      >
        <NuxtLink
          v-if="row.posts[0]?.image"
          :to="row.posts[0].path"
          tabindex="-1"
          aria-hidden="true"
          class="shrink-0"
        >
          <NuxtImg
            :src="row.posts[0].image"
            width="96"
            height="96"
            fit="cover"
            alt=""
            class="size-12 rounded object-cover"
          />
        </NuxtLink>
        <div class="min-w-0">
          <NuxtLink
            :to="row.posts[0]?.path"
            class="font-medium hover:text-primary"
          >
            {{ row.name }}
          </NuxtLink>
          <div class="mt-1 flex flex-wrap gap-1">
            <NuxtLink v-for="id in row.ids" :key="id.id" :to="idLink(id)">
              <UBadge size="sm" variant="soft">{{ shortLabel(id) }}</UBadge>
            </NuxtLink>
          </div>
          <p class="mt-1 text-xs text-muted">
            <span class="capitalize">{{ row.type }}</span>
            <template v-if="row.type && row.constellation"> · </template>
            {{ row.constellation }}
          </p>
        </div>
      </li>
    </ul>
  </UContainer>
</template>

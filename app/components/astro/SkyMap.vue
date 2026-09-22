<script setup lang="ts">
import type { TargetPost, TargetRow } from "~/composables/useTargets"
import sky from "~/assets/sky.json"

const props = defineProps<{ rows: TargetRow[] }>()

const { shortLabel } = useTargets()
const { dateFormat } = useDates()

const NuxtLink = resolveComponent("NuxtLink")

// Polar map centred on the north celestial pole, as if looking up: RA runs
// anticlockwise from 0h at the top. The rim sits at RIM_DEC, so targets a little
// south of the celestial equator (Orion) still fit.
const RIM_DEC = -30
const R = 300
const SIZE = 2 * R + 80

type Point = [number, number]

// Shape written by scripts/astro/sky.ts. JSON imports widen tuples to number[], so
// restate it.
interface Sky {
  // RA, Dec, magnitude
  stars: [number, number, number][]
  lines: Point[][]
  labels: Record<string, Point>
}
const { stars: starData, lines: lineData, labels } = sky as unknown as Sky

// Azimuthal equidistant: distance from the centre is proportional to the angle from
// the pole, which keeps the circles of declination evenly spaced. Rounded because
// Node and the browser disagree on the last digit of Math.sin, which breaks hydration.
const project = (ra: number, dec: number): Point => {
  const r = ((90 - dec) / (90 - RIM_DEC)) * R
  const theta = (ra * Math.PI) / 180
  const round = (n: number): number => Math.round(n * 10) / 10
  return [round(-r * Math.sin(theta)), round(-r * Math.cos(theta))]
}

const onMap = (dec: number): boolean => dec >= RIM_DEC

const path = (points: Point[]): string =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("")

const lines = lineData.map((line) =>
  path(line.map(([ra, dec]) => project(ra, dec))),
)

// Brighter stars get bigger dots
const stars = starData
  .filter(([, dec]) => onMap(dec))
  .map(([ra, dec, mag]) => {
    const [x, y] = project(ra, dec)
    return { x, y, r: Math.max(0.6, 3.2 - mag * 0.55) }
  })

const decCircles = [0, 30, 60].map((dec) => ({
  dec,
  r: project(0, dec)[1] * -1,
}))

const hours = Array.from({ length: 12 }, (_, i) => {
  const ra = i * 30
  const [x, y] = project(ra, RIM_DEC - 4)
  const [x2, y2] = project(ra, RIM_DEC)
  return { label: `${i * 2}h`, x, y, x2, y2 }
})

// Only the constellations something has been photographed in
const constellations = computed(() => {
  const names = new Set(props.rows.map((r) => r.constellation))
  return [...names].flatMap((name) => {
    const at = name ? labels[name] : undefined
    if (!name || !at || !onMap(at[1])) return []
    const [x, y] = project(at[0], at[1])
    return [{ name, x, y }]
  })
})

// Everything at one spot on the map: targets too close to tell apart (Horsehead
// and Flame) share a dot, and each target already carries all of its posts
interface Marker {
  key: string
  x: number
  y: number
  rows: TargetRow[]
  // Every post showing any of these targets, once each, newest first
  posts: TargetPost[]
}

// Dots are drawn with r=5, so closer than this they overlap
const MERGE = 8

const markers = computed(() => {
  const spots: { x: number; y: number; rows: TargetRow[] }[] = []
  for (const row of props.rows) {
    if (row.ra === undefined || row.dec === undefined) continue
    if (!onMap(row.dec) || row.posts.length === 0) continue
    const [x, y] = project(row.ra, row.dec)
    const near = spots.find(
      (spot) => Math.hypot(spot.x - x, spot.y - y) < MERGE,
    )
    if (near) near.rows.push(row)
    else spots.push({ x, y, rows: [row] })
  }

  return spots.map(({ x, y, rows }): Marker => {
    const posts = new Map(
      rows.flatMap((r) => r.posts).map((post) => [post.path, post]),
    )
    return {
      key: rows.map((r) => r.name).join("+"),
      x,
      y,
      rows,
      posts: [...posts.values()].sort((p, q) => q.date.localeCompare(p.date)),
    }
  })
})

// Hover previews a card; click pins it. Only a pinned card has links, and while
// one is pinned hovering other dots does nothing - so moving the pointer towards
// the card can't be mistaken for moving to another dot.
const hovered = ref<Marker>()
const pinned = ref<Marker>()
const shown = computed(() => pinned.value ?? hovered.value)

const card = ref<HTMLElement>()

const pin = async (marker: Marker) => {
  pinned.value = pinned.value?.key === marker.key ? undefined : marker
  await nextTick()
  // Take keyboard users into the card; after a mouse click this shows no ring
  card.value?.querySelector<HTMLElement>("a")?.focus()
}

const unpin = () => {
  const key = pinned.value?.key
  pinned.value = undefined
  // Back to the dot the card came from
  if (key) {
    document
      .querySelector<SVGElement>(`[data-sky-dot="${CSS.escape(key)}"]`)
      ?.focus()
  }
}

const onDocumentClick = (event: MouseEvent) => {
  if (!pinned.value || !(event.target instanceof Element)) return
  if (event.target.closest("[data-sky-dot], [data-sky-card]")) return
  pinned.value = undefined
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && pinned.value) unpin()
}

onMounted(() => {
  document.addEventListener("click", onDocumentClick)
  document.addEventListener("keydown", onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick)
  document.removeEventListener("keydown", onKeydown)
})

// Map units to a percentage of the figure, for placing the HTML card over the SVG
const percent = (n: number): string => `${((n + SIZE / 2) / SIZE) * 100}%`

// From sm up the card floats beside its dot, opening towards the middle of the map
// so it never hangs off the edge. Below that there's no room, and it sits under the
// map instead - so these are variables the sm: classes pick up, not plain styles.
const cardStyle = computed(() => {
  const m = shown.value
  if (!m) return {}
  const gap = "0.75rem"
  return {
    "--card-left": percent(m.x),
    "--card-top": percent(m.y),
    "--card-shift": `translate(${m.x > 0 ? `calc(-100% - ${gap})` : gap}, ${m.y > 0 ? "calc(-100% + 1rem)" : "-1rem"})`,
  }
})
</script>
<template>
  <figure>
    <div class="relative mx-auto w-full max-w-4xl">
      <svg
        :viewBox="`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`"
        class="block w-full"
        role="group"
        aria-label="Map of the northern sky with each photographed target marked"
      >
        <defs>
          <clipPath id="sky-map-clip">
            <circle :r="R" />
          </clipPath>
        </defs>

        <circle :r="R" class="fill-[#0b1026]" />

        <g clip-path="url(#sky-map-clip)">
          <circle
            v-for="c in decCircles"
            :key="c.dec"
            :r="c.r"
            class="fill-none stroke-white/15"
            stroke-dasharray="3 4"
          />
          <line
            v-for="h in hours"
            :key="h.label"
            x1="0"
            y1="0"
            :x2="h.x2"
            :y2="h.y2"
            class="stroke-white/10"
          />
          <path
            v-for="(d, i) in lines"
            :key="i"
            :d="d"
            class="fill-none stroke-sky-200/35"
            stroke-width="1"
          />
          <circle
            v-for="(s, i) in stars"
            :key="i"
            :cx="s.x"
            :cy="s.y"
            :r="s.r"
            class="fill-white/80"
          />
          <text
            v-for="c in constellations"
            :key="c.name"
            :x="c.x"
            :y="c.y"
            text-anchor="middle"
            class="fill-sky-200/50 text-[11px] uppercase tracking-widest"
          >
            {{ c.name }}
          </text>
        </g>

        <circle :r="R" class="fill-none stroke-(--ui-border-accented)" />
        <text
          v-for="h in hours"
          :key="h.label"
          :x="h.x"
          :y="h.y"
          text-anchor="middle"
          dominant-baseline="middle"
          class="fill-(--ui-text-muted) text-[12px] tabular-nums"
        >
          {{ h.label }}
        </text>

        <g
          v-for="m in markers"
          :key="m.key"
          :data-sky-dot="m.key"
          role="button"
          tabindex="0"
          :aria-label="m.rows.map((r) => r.name).join(', ')"
          :aria-expanded="pinned?.key === m.key"
          class="group cursor-pointer outline-none"
          @mouseenter="hovered = m"
          @mouseleave="hovered = undefined"
          @click="pin(m)"
          @keydown.enter.prevent="pin(m)"
          @keydown.space.prevent="pin(m)"
        >
          <!-- Bigger invisible target so small dots are easy to hit -->
          <circle :cx="m.x" :cy="m.y" r="12" class="fill-transparent" />
          <!-- A ring marks a dot that stands for more than one target or post -->
          <circle
            v-if="m.rows.length > 1 || m.posts.length > 1"
            :cx="m.x"
            :cy="m.y"
            r="8.5"
            class="fill-none stroke-amber-300/70"
          />
          <circle
            :cx="m.x"
            :cy="m.y"
            r="5"
            class="stroke-[#0b1026] stroke-2 transition-all group-hover:fill-white group-hover:[r:7] group-focus-visible:fill-white group-focus-visible:[r:7]"
            :class="
              pinned?.key === m.key ? 'fill-white [r:7]' : 'fill-amber-300'
            "
          />
        </g>
      </svg>

      <div
        v-if="shown"
        ref="card"
        data-sky-card
        :style="cardStyle"
        :role="pinned ? 'dialog' : undefined"
        :aria-label="
          pinned ? shown.rows.map((r) => r.name).join(', ') : undefined
        "
        :aria-hidden="pinned ? undefined : 'true'"
        class="relative z-10 mt-3 w-full rounded-lg sm:absolute sm:left-(--card-left) sm:top-(--card-top) sm:mt-0 sm:w-72 sm:transform-(--card-shift) border border-default bg-default/95 p-3 shadow-lg backdrop-blur"
        :class="{ 'pointer-events-none': !pinned }"
      >
        <UButton
          v-if="pinned"
          icon="i-lucide-x"
          size="xs"
          color="neutral"
          variant="ghost"
          aria-label="Close"
          class="absolute right-1.5 top-1.5"
          @click="unpin"
        />

        <div
          v-for="row in shown.rows"
          :key="row.name"
          class="mb-2 pr-6 last:mb-0"
        >
          <p class="font-medium leading-snug">{{ row.name }}</p>
          <p v-if="row.ids.length" class="text-xs text-primary">
            {{ row.ids.map(shortLabel).join(" · ") }}
          </p>
          <p class="text-xs text-muted">
            <span class="capitalize">{{ row.type }}</span>
            <template v-if="row.type && row.constellation"> · </template>
            {{ row.constellation }}
          </p>
        </div>

        <ul class="mt-3 space-y-2 border-t border-default pt-3">
          <li v-for="post in shown.posts" :key="post.path">
            <component
              :is="pinned ? NuxtLink : 'div'"
              v-bind="pinned ? { to: post.path } : {}"
              class="flex items-center gap-3 rounded"
              :class="{ 'group/post hover:bg-elevated': pinned }"
            >
              <NuxtImg
                v-if="post.image"
                :src="post.image"
                width="96"
                height="96"
                fit="cover"
                alt=""
                class="size-12 shrink-0 rounded object-cover"
              />
              <div class="min-w-0">
                <p
                  class="truncate text-sm"
                  :class="{ 'group-hover/post:text-primary': pinned }"
                >
                  {{ post.title }}
                </p>
                <p class="font-mono text-xs text-muted">
                  {{ dateFormat(post.date) }}
                </p>
              </div>
            </component>
          </li>
        </ul>

        <p v-if="!pinned" class="mt-2 text-xs text-muted">Click for links</p>
      </div>
    </div>

    <figcaption class="mt-2 text-center text-xs text-muted">
      Northern sky down to declination {{ RIM_DEC }}°. Stars and constellation
      lines from
      <a
        href="https://github.com/ofrohn/d3-celestial"
        class="underline underline-offset-2 hover:text-primary"
        >d3-celestial</a
      >
      by Olaf Frohn (BSD-3-Clause).
    </figcaption>
  </figure>
</template>

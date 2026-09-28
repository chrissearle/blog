import { describe, type Setup, setupTags } from "./equipment.ts"
import {
  formatDec,
  formatDistance,
  formatDuration,
  formatMagnitude,
  formatRa,
  formatApparentSize,
  formatKm,
  formatSize,
  formatSolarDistance,
} from "./format.ts"
import type { Target } from "./lookup.ts"
import { type Ephemeris, moonPhaseName } from "./solar.ts"

export interface IntegrationLine {
  // Filter / mode, e.g. "UV/IR cut" or "LP (Hα/OIII)". May be empty.
  label: string
  minutes: number
}

export interface PhotoDetails {
  setup: Setup
  cameraSettings?: string
  dates: string[]
  // Replaces the plain dates in the table when capture times are known:
  // "2026-09-26 21:42 UTC"
  times?: string
  integration: IntegrationLine[]
  // Planetary video frames, e.g. "344" or "1,032 in 3 videos"
  frames?: string
  // Barlow/reducer appended to the telescope: "2× Barlow (3000 mm f/23.6)"
  magnifier?: string
  conditions?: string
  calibration?: string
  processing?: string
  notes?: string
}

type Row = [string, string | undefined]

const width = (text: string): number => [...text].length
const cell = (text: string): string => text.replace(/\|/g, "\\|")

// A two-column table padded like prettier would. Rows with no value are dropped.
export const table = (header: [string, string], rows: Row[]): string => {
  const kept = rows
    .filter(
      (row): row is [string, string] => row[1] !== undefined && row[1] !== "",
    )
    .map(([k, v]): [string, string] => [cell(k), cell(v)])
  const all = [header, ...kept]
  const w1 = Math.max(3, ...all.map(([k]) => width(k)))
  const w2 = Math.max(3, ...all.map(([, v]) => width(v)))
  const line = ([k, v]: [string, string]) =>
    `| ${k}${" ".repeat(w1 - width(k))} | ${v}${" ".repeat(w2 - width(v))} |`
  return [
    line(header),
    `|${"-".repeat(w1 + 2)}|${"-".repeat(w2 + 2)}|`,
    ...kept.map(line),
  ].join("\n")
}

export const displayNames = (target: Target): string[] => [
  ...target.commonNames.slice(0, 1),
  ...(target.aliases ?? []),
  ...target.names.map((n) => n.display),
]

// "Waxing gibbous, 68 % lit" for the Moon; "24 % lit" for a crescent Venus. Left
// out when the disc is (near enough) full.
const phaseRow = (ephemeris: Ephemeris): string | undefined => {
  const lit = `${Math.round(ephemeris.illuminated * 100)} % lit`
  if (ephemeris.moonPhase !== undefined) {
    return `${moonPhaseName(ephemeris.moonPhase)}, ${lit}`
  }
  return ephemeris.illuminated < 0.99 ? lit : undefined
}

// Sun, Moon and planets: fixed facts, then where it was on the capture date
const solarTable = (target: Target): string => {
  const e = target.ephemeris
  return table(
    ["Names", cell(displayNames(target).join(", "))],
    [
      ["Type", target.type],
      [
        "Diameter",
        target.solar ? formatKm(target.solar.diameterKm) : undefined,
      ],
      ["Constellation", e?.constellation],
      ["Distance", e ? formatSolarDistance(e.distanceAu) : undefined],
      ["Magnitude", e ? formatMagnitude(e.vmag) : undefined],
      ["Apparent size", e ? formatApparentSize(e.sizeArcsec) : undefined],
      ["Phase", e ? phaseRow(e) : undefined],
      [
        "Ring tilt",
        e?.ringTilt !== undefined
          ? `${Math.abs(e.ringTilt).toFixed(1)}°`
          : undefined,
      ],
    ],
  )
}

const deepSkyTable = (target: Target): string =>
  table(
    ["Names", cell(displayNames(target).join(", "))],
    [
      ["Type", target.type],
      ["Constellation", target.constellation],
      [
        "Distance",
        target.distanceLy ? formatDistance(target.distanceLy) : undefined,
      ],
      [
        "Magnitude",
        target.vmag !== undefined ? formatMagnitude(target.vmag) : undefined,
      ],
      [
        "Size",
        target.majorArcmin
          ? formatSize(target.majorArcmin, target.minorArcmin)
          : undefined,
      ],
      ["RA", target.ra !== undefined ? formatRa(target.ra) : undefined],
      ["Dec", target.dec !== undefined ? formatDec(target.dec) : undefined],
    ],
  )

export const targetTable = (target: Target): string =>
  target.solar ? solarTable(target) : deepSkyTable(target)

export const totalMinutes = (photo: PhotoDetails): number =>
  photo.integration.reduce((sum, line) => sum + line.minutes, 0)

const filtersRow = (photo: PhotoDetails): string | undefined => {
  const labelled = photo.integration.filter((line) => line.label !== "")
  if (labelled.length === 0) {
    return undefined
  }
  if (photo.integration.length === 1) {
    return labelled[0]?.label
  }
  return photo.integration
    .map(
      (line) =>
        `${line.label || "unfiltered"}: ${formatDuration(line.minutes)}`,
    )
    .join(", ")
}

export const photoTable = (photo: PhotoDetails): string => {
  const { optics, camera, mount, control } = photo.setup
  const total = totalMinutes(photo)
  const cameraCell = camera
    ? [describe(camera), photo.cameraSettings].filter(Boolean).join(" - ")
    : photo.cameraSettings

  return table(
    ["", ""],
    [
      [
        optics?.lens ? "Lens" : "Telescope",
        optics
          ? [describe(optics), photo.magnifier].filter(Boolean).join(" + ")
          : undefined,
      ],
      ["Camera", cameraCell],
      ["Mount", mount ? describe(mount) : undefined],
      ["Control", control ? describe(control) : undefined],
      ["Dates", photo.times ?? photo.dates.join(", ")],
      ["Integration time", total > 0 ? formatDuration(total) : undefined],
      ["Frames", photo.frames],
      ["Filters", filtersRow(photo)],
      ["Calibration", photo.calibration],
      ["Processing", photo.processing],
      ["Conditions", photo.conditions],
      ["Notes", photo.notes],
    ],
  )
}

export const footnote = (n: number, target: Target): string | undefined =>
  target.wiki
    ? `[^${n}]: [Wikipedia - ${target.wiki.title}](${target.wiki.url})`
    : undefined

const needsQuotes = (value: string): boolean =>
  /[:#[\]{}&*!|>%@`"]|^['\s-]|\s$/.test(value)

export const yamlValue = (value: string): string =>
  needsQuotes(value) ? JSON.stringify(value) : value

export const postTags = (targets: Target[], setup: Setup): string[] => [
  ...new Set([
    "astrophotography",
    ...targets.flatMap((t) => t.names.map((n) => n.tag)),
    // No catalog ids - the body itself is the tag: "jupiter", "moon"
    ...targets.flatMap((t) => (t.solar ? [t.solar.name.toLowerCase()] : [])),
    ...targets.flatMap((t) => (t.typeTag ? [t.typeTag] : [])),
    ...setupTags(setup),
  ]),
]

export interface Frontmatter {
  title: string
  date: string
  tags: string[]
  intro: string
  image: string
  // Written as the `targets:` block that drives the /astrophotography page
  targets?: Target[]
  // Extra raw YAML lines to keep (e.g. an existing sitemap block)
  extra?: string[]
}

// One `targets:` entry: the name shown on /astrophotography plus the catalog ids
export const targetYaml = (target: Target): string[] =>
  [
    `  - name: ${yamlValue(target.commonNames[0] ?? target.names[0]?.display ?? target.query)}`,
    target.names.length > 0
      ? `    ids: [ ${target.names.map((n) => n.display).join(", ")} ]`
      : undefined,
    target.typeTag ? `    type: ${target.typeTag}` : undefined,
    target.constellation
      ? `    constellation: ${yamlValue(target.constellation)}`
      : undefined,
    target.ra !== undefined ? `    ra: ${target.ra.toFixed(3)}` : undefined,
    target.dec !== undefined ? `    dec: ${target.dec.toFixed(3)}` : undefined,
  ].filter((line): line is string => line !== undefined)

export const frontmatter = (fm: Frontmatter): string =>
  [
    "---",
    `title: ${yamlValue(fm.title)}`,
    `date: ${fm.date}`,
    "category: Photography",
    `tags: [ ${fm.tags.join(", ")} ]`,
    `intro: ${yamlValue(fm.intro)}`,
    `image: ${fm.image}`,
    ...(fm.targets && fm.targets.length > 0
      ? ["targets:", ...fm.targets.flatMap(targetYaml)]
      : []),
    ...(fm.extra ?? []),
    "---",
  ].join("\n")

export interface PostContent extends Frontmatter {
  targets: Target[]
  // One description per target, without its footnote marker
  descriptions: string[]
  photo: PhotoDetails
}

export const renderPost = (post: PostContent): string => {
  let n = 0
  const footnotes: string[] = []

  const targetSections = post.targets.map((target, i) => {
    const description = post.descriptions[i] ?? ""
    const note = footnote(n + 1, target)
    if (note) {
      n += 1
      footnotes.push(note)
    }
    const marker = note ? `[^${n}]` : ""
    return [
      targetTable(target),
      description ? `${description}${marker}` : undefined,
    ]
      .filter(Boolean)
      .join("\n\n")
  })

  return `${[
    frontmatter(post),
    ...targetSections,
    `![${post.title}](${post.image})`,
    "## Photo Details",
    photoTable(post.photo),
    footnotes.join("\n"),
  ]
    .filter((section) => section !== "")
    .join("\n\n")}\n`
}

// "A", "A and B", "A, B and C"
const joinNames = (names: string[]): string =>
  names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`

// Common name if there is one, otherwise the first catalog id - names are already in
// catalog order (Messier, NGC, IC, Caldwell, ...)
export const pickTitle = (targets: Target[]): string =>
  joinNames(
    targets.map((t) => t.commonNames[0] ?? t.names[0]?.display ?? t.query),
  )

// "Spiral galaxy" → "spiral galaxy", but "H II region" stays as it is
const lowerFirst = (text: string): string =>
  /^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text

const withArticle = (phrase: string): string =>
  `${/^([aeiou]|H II)/i.test(phrase) ? "an" : "a"} ${phrase}`

// The intro sentence for the Sun, Moon or a planet. There are no catalog ids, and
// the constellation is only where it happened to be that night - but target.ephemeris
// (phase, constellation, ring tilt ...) is filled in by the time this runs.
// TODO: pick the wording - for now it matches the deep-sky form.
const describeSolar = (target: Target): string => {
  const name = target.solar?.name ?? target.query
  return target.type
    ? `${name}, ${withArticle(lowerFirst(target.type))}.`
    : `${name}.`
}

// "Messier 81 / NGC 3031, a spiral galaxy in Ursa Major."
const describeTarget = (target: Target): string => {
  if (target.solar) {
    return describeSolar(target)
  }
  const ids = target.names.map((n) => n.display)
  const name =
    ids.length > 0 ? ids.join(" / ") : (target.commonNames[0] ?? target.query)
  const type = target.type ?? target.typeTag
  const what = type ? withArticle(lowerFirst(type)) : undefined
  // "Barred spiral galaxy in the Local Group" already says where it is
  const where =
    target.constellation && !/ in /.test(type ?? "")
      ? `in ${target.constellation}`
      : undefined
  const description = [what, where].filter(Boolean).join(" ")
  return description ? `${name}, ${description}.` : `${name}.`
}

// The one-line summary on post cards and in link previews: catalog ids and what the
// object is, one sentence per target. The title already carries the common name.
export const buildIntro = (targets: Target[]): string =>
  targets.map(describeTarget).join(" ")

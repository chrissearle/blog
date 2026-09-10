import { describe, type Setup, setupTags } from "./equipment.ts"
import {
  formatDec,
  formatDistance,
  formatDuration,
  formatMagnitude,
  formatRa,
  formatSize,
} from "./format.ts"
import type { Target } from "./lookup.ts"

export interface IntegrationLine {
  // Filter / mode, e.g. "UV/IR cut" or "LP (Hα/OIII)". May be empty.
  label: string
  minutes: number
}

export interface PhotoDetails {
  setup: Setup
  cameraSettings?: string
  dates: string[]
  integration: IntegrationLine[]
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

export const targetTable = (target: Target): string =>
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
        optics ? describe(optics) : undefined,
      ],
      ["Camera", cameraCell],
      ["Mount", mount ? describe(mount) : undefined],
      ["Control", control ? describe(control) : undefined],
      ["Dates", photo.dates.join(", ")],
      ["Integration time", total > 0 ? formatDuration(total) : undefined],
      ["Filters", filtersRow(photo)],
      ["Calibration", photo.calibration],
      ["Processing", photo.processing],
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
  // Extra raw YAML lines to keep (e.g. an existing sitemap block)
  extra?: string[]
}

export const frontmatter = (fm: Frontmatter): string =>
  [
    "---",
    `title: ${yamlValue(fm.title)}`,
    `date: ${fm.date}`,
    "category: Photography",
    `tags: [ ${fm.tags.join(", ")} ]`,
    `intro: ${yamlValue(fm.intro)}`,
    `image: ${fm.image}`,
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

// "Messier 81 / NGC 3031, a spiral galaxy in Ursa Major."
const describeTarget = (target: Target): string => {
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

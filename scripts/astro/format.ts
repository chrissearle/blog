import slugify from "slugify"

export type TypeTag = "galaxy" | "nebula" | "cluster"

const pad = (n: number, width = 2): string => String(n).padStart(width, "0")

// 148.888° → "09h 55m 33.2s"
export const formatRa = (deg: number): string => {
  const tenthsOfSecond = Math.round((((deg % 360) + 360) % 360) * 240 * 10)
  const h = Math.floor(tenthsOfSecond / 36000) % 24
  const m = Math.floor((tenthsOfSecond % 36000) / 600)
  const s = (tenthsOfSecond % 600) / 10
  return `${pad(h)}h ${pad(m)}m ${s.toFixed(1).padStart(4, "0")}s`
}

// 69.065° → "+69° 03′ 55″"
export const formatDec = (deg: number): string => {
  const sign = deg < 0 ? "-" : "+"
  const arcsec = Math.round(Math.abs(deg) * 3600)
  const d = Math.floor(arcsec / 3600)
  const m = Math.floor((arcsec % 3600) / 60)
  const s = arcsec % 60
  return `${sign}${pad(d)}° ${pad(m)}′ ${pad(s)}″`
}

// Both axes share the major axis' precision: "21.4′ × 10.2′", "200′ × 71′"
export const formatSize = (major: number, minor?: number): string => {
  const digits = major < 100 ? 1 : 0
  const arcmin = (value: number): string => `${Number(value.toFixed(digits))}′`
  return minor === undefined || Math.abs(major - minor) < 0.05
    ? arcmin(major)
    : `${arcmin(major)} × ${arcmin(minor)}`
}

export const formatMagnitude = (vmag: number): string =>
  String(Number(vmag.toFixed(1)))

// 2_670_000 → "≈ 2.7 million ly", 1470 → "≈ 1,500 ly"
export const formatDistance = (ly: number): string => {
  const twoSig = (n: number): number => Number(n.toPrecision(2))
  if (ly >= 1_000_000) {
    return `≈ ${twoSig(ly / 1_000_000)} million ly`
  }
  return `≈ ${twoSig(ly).toLocaleString("en-GB")} ly`
}

// "3h55m", "3h 55m", "90m", "1.5h", "3h55m30s" → minutes
export const parseDuration = (text: string): number | undefined => {
  const parts = [...text.matchAll(/(\d+(?:\.\d+)?)\s*([hms])/gi)]
  if (
    parts.length === 0 ||
    text.replace(/(\d+(?:\.\d+)?)\s*([hms])/gi, "").trim() !== ""
  ) {
    return undefined
  }
  const factor: Record<string, number> = { h: 60, m: 1, s: 1 / 60 }
  return parts.reduce(
    (total, [, value, unit]) =>
      total + Number(value) * (factor[(unit ?? "m").toLowerCase()] ?? 1),
    0,
  )
}

// 501 → "8h 21m", 551.5 → "9h 11m 30s"
export const formatDuration = (minutes: number): string => {
  const seconds = Math.round(minutes * 60)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return (
    [h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(" ") || "0m"
  )
}

const OTYPE_TAGS: [RegExp, TypeTag][] = [
  [
    /^(G|GiG|GiC|GiP|IG|PaG|GrG|CGG|ClG|SBG|Sy\d?|SyG|AGN|LIN|bCG|EmG|H2G|rG|LSB|BiC|AG\?)$/,
    "galaxy",
  ],
  [
    /^(HII|SNR|PN|DNe|RNe|ISM|EmO|Cld|MoC|GNe|BNe|sh|bub|SFR|cor|glb)$/,
    "nebula",
  ],
  [/^(OpC|GlC|Cl\*|As\*|C\?\*)$/, "cluster"],
]

// Used when the Wikipedia article is about a neighbouring object
const OTYPE_LABELS: Record<string, string> = {
  HII: "Emission nebula (H II region)",
  SNR: "Supernova remnant",
  PN: "Planetary nebula",
  DNe: "Dark nebula",
  RNe: "Reflection nebula",
  OpC: "Open cluster",
  GlC: "Globular cluster",
  IG: "Interacting galaxies",
  GrG: "Group of galaxies",
}

const descriptionTag = (
  description: string | undefined,
): TypeTag | undefined => {
  const text = description?.toLowerCase() ?? ""
  if (/galax/.test(text)) {
    return "galaxy"
  }
  if (/cluster/.test(text)) {
    return "cluster"
  }
  if (/nebula|remnant|h ii|star.forming|dust|gas/.test(text)) {
    return "nebula"
  }
  return undefined
}

const otypeTag = (otype: string | undefined): TypeTag | undefined =>
  OTYPE_TAGS.find(([pattern]) => pattern.test(otype ?? ""))?.[1]

// When the Wikipedia article is about the object we asked for, its description is
// the better signal - SIMBAD files NGC 7000 under its "Bermuda Cluster". When the
// article is about a neighbour (Sh2-142 → the NGC 7380 cluster page), SIMBAD wins.
export const typeTag = (
  description: string | undefined,
  otype: string | undefined,
  articleIsTarget: boolean,
): TypeTag | undefined =>
  articleIsTarget
    ? (descriptionTag(description) ?? otypeTag(otype))
    : (otypeTag(otype) ?? descriptionTag(description))

const CONSTELLATION_PHRASE =
  /\s+in (?:the )?(?:constellation (?:of )?([A-Z][a-z]+(?: [A-Z][a-z]+)?)|([A-Z][a-z]+(?: [A-Z][a-z]+)?) constellation)\b.*$/

// "Emission nebula in Cassiopeia constellation" → "Cassiopeia"
export const constellationFrom = (
  description: string | undefined,
): string | undefined => {
  const match = description ? CONSTELLATION_PHRASE.exec(description) : null
  return match?.[1] ?? match?.[2]
}

// "Barred spiral galaxy in the constellation Ursa Major" → "Barred spiral galaxy"
export const typeLabel = (
  description: string | undefined,
  otype: string | undefined,
  articleIsTarget: boolean,
): string | undefined => {
  if (!articleIsTarget && otype && OTYPE_LABELS[otype]) {
    return OTYPE_LABELS[otype]
  }
  const label = description?.replace(CONSTELLATION_PHRASE, "").trim()
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : undefined
}

export const toSlug = (title: string): string =>
  slugify(title.replace(/['’]/g, ""), { lower: true, strict: true })

// Mirrors safeString() in app/composables/useStrings.ts, which builds /tags/<slug>/
export const safeTag = (tag: string): string => slugify(tag, { lower: true })

const two = (n: number): string => pad(n)

export interface PostDate {
  // 2026/09/10
  path: string
  // 2026-09-10 17:59 +0200
  frontmatter: string
}

export const postDate = (now = new Date()): PostDate => {
  const offset = -now.getTimezoneOffset()
  const tz = `${offset >= 0 ? "+" : "-"}${two(Math.floor(Math.abs(offset) / 60))}${two(Math.abs(offset) % 60)}`
  const y = now.getFullYear()
  const mo = two(now.getMonth() + 1)
  const d = two(now.getDate())
  return {
    path: `${y}/${mo}/${d}`,
    frontmatter: `${y}-${mo}-${d} ${two(now.getHours())}:${two(now.getMinutes())} ${tz}`,
  }
}

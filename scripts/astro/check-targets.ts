// Re-looks up the targets of existing astro posts and reports where the post
// differs. With --fix, rewrites position, magnitude and size, and drops cluster-only
// ids from nebulae that SIMBAD only knows as their embedded cluster.
//
//   node scripts/astro/check-targets.ts [--fix] [post.md ...]

import { readdir, readFile, writeFile } from "fs/promises"
import { dirname, join, relative } from "path"
import { fileURLToPath } from "url"
import { parseCatalogId } from "./catalogs.ts"
import { formatDec, formatMagnitude, formatRa, formatSize } from "./format.ts"
import { CLUSTER_CATALOGS, lookupTarget, type Target } from "./lookup.ts"
import { table } from "./render.ts"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")
const CONTENT = join(ROOT, "content")
const ROW_ORDER = [
  "Type",
  "Constellation",
  "Distance",
  "Magnitude",
  "Size",
  "RA",
  "Dec",
]

interface PostTarget {
  name: string
  ids: string[]
  ra?: number
  dec?: number
}

interface Row {
  key: string
  value: string
}

interface TargetTable {
  start: number
  end: number
  names: string[]
  rows: Row[]
}

const unquote = (value: string): string =>
  value.startsWith('"') ? (JSON.parse(value) as string) : value

const numberOf = (value: string | undefined): number | undefined =>
  value === undefined || value === "" ? undefined : Number(value)

const splitFrontmatter = (
  markdown: string,
): { frontmatter: string; body: string } | undefined => {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(markdown)
  return match
    ? { frontmatter: match[1] ?? "", body: markdown.slice(match[0].length) }
    : undefined
}

const targetEntries = (frontmatter: string): string[] => {
  const block = /^targets:\n((?: {2}.*(?:\n|$))*)/m.exec(frontmatter)?.[1] ?? ""
  return block
    .split(/^ {2}- /m)
    .slice(1)
    .map((entry) => entry.replace(/\n$/, ""))
}

const parseEntry = (entry: string): PostTarget => {
  const field = (key: string): string | undefined =>
    new RegExp(`(?:^|\\n)\\s*${key}:\\s*(.*)`).exec(entry)?.[1]?.trim()
  return {
    name: unquote(field("name") ?? ""),
    ids: (field("ids") ?? "")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
    ra: numberOf(field("ra")),
    dec: numberOf(field("dec")),
  }
}

const cellsOf = (line: string): string[] =>
  line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim())

const findTable = (lines: string[], name: string): TargetTable | undefined => {
  const start = lines.findIndex(
    (line) =>
      line.startsWith("| Names ") &&
      (cellsOf(line)[1] ?? "").split(", ").includes(name),
  )
  if (start < 0) {
    return undefined
  }
  let end = start
  while (lines[end + 1]?.startsWith("|")) end++
  return {
    start,
    end,
    names: (cellsOf(lines[start] ?? "")[1] ?? "").split(", "),
    rows: lines.slice(start + 2, end + 1).map((line) => {
      const [key = "", value = ""] = cellsOf(line)
      return { key, value }
    }),
  }
}

const arcminApart = (a: PostTarget, t: Target): number | undefined =>
  a.ra === undefined ||
  a.dec === undefined ||
  t.ra === undefined ||
  t.dec === undefined
    ? undefined
    : Math.hypot(
        (a.ra - t.ra) * Math.cos((t.dec * Math.PI) / 180),
        a.dec - t.dec,
      ) * 60

const freshValues = (t: Target): Record<string, string | undefined> => ({
  Magnitude: t.vmag !== undefined ? formatMagnitude(t.vmag) : undefined,
  Size: t.majorArcmin ? formatSize(t.majorArcmin, t.minorArcmin) : undefined,
  RA: t.ra !== undefined ? formatRa(t.ra) : undefined,
  Dec: t.dec !== undefined ? formatDec(t.dec) : undefined,
})

const droppedIds = (post: PostTarget, t: Target): string[] =>
  t.clusterStandIn
    ? post.ids.filter((id) =>
        CLUSTER_CATALOGS.has(parseCatalogId(id)?.catalog ?? ""),
      )
    : []

interface Check {
  post: PostTarget
  fresh: Target
  table?: TargetTable
  changes: string[]
  dropIds: string[]
}

const checkTarget = (
  post: PostTarget,
  fresh: Target,
  tbl?: TargetTable,
): Check => {
  const changes: string[] = []
  const apart = arcminApart(post, fresh)
  if (apart !== undefined && apart > 1) {
    changes.push(
      `position ${apart.toFixed(1)}′ off: ${formatRa(post.ra ?? 0)} ${formatDec(post.dec ?? 0)} → ${fresh.ra !== undefined ? formatRa(fresh.ra) : "?"} ${fresh.dec !== undefined ? formatDec(fresh.dec) : "?"}`,
    )
  }
  const values = freshValues(fresh)
  for (const key of ["Magnitude", "Size"]) {
    const old = tbl?.rows.find((r) => r.key === key)?.value
    if ((old ?? "") !== (values[key] ?? "")) {
      changes.push(`${key}: ${old ?? "-"} → ${values[key] ?? "-"}`)
    }
  }
  const dropIds = droppedIds(post, fresh)
  if (dropIds.length > 0) {
    changes.push(`drop cluster ids: ${dropIds.join(", ")}`)
  }
  const freshIds = fresh.names.map((n) => n.display)
  const missing = freshIds.filter((id) => !post.ids.includes(id))
  const extra = post.ids.filter(
    (id) => !freshIds.includes(id) && !dropIds.includes(id),
  )
  if (missing.length > 0 || extra.length > 0) {
    changes.push(
      `ids differ (not changed): post has [${post.ids.join(", ")}], lookup has [${freshIds.join(", ")}]`,
    )
  }
  return { post, fresh, table: tbl, changes, dropIds }
}

const fixEntry = (entry: string, check: Check): string =>
  entry
    .split("\n")
    .map((line) => {
      const { fresh, post, dropIds } = check
      if (/^\s*ids:/.test(line) && dropIds.length > 0) {
        return `    ids: [ ${post.ids.filter((id) => !dropIds.includes(id)).join(", ")} ]`
      }
      if (/^\s*ra:/.test(line) && fresh.ra !== undefined) {
        return `    ra: ${fresh.ra.toFixed(3)}`
      }
      if (/^\s*dec:/.test(line) && fresh.dec !== undefined) {
        return `    dec: ${fresh.dec.toFixed(3)}`
      }
      return line
    })
    .join("\n")

const fixTable = (tbl: TargetTable, check: Check): string => {
  const values = freshValues(check.fresh)
  const existing = new Map(tbl.rows.map((r) => [r.key, r.value]))
  const replaced = new Set(["Magnitude", "Size", "RA", "Dec"])
  const rows: [string, string | undefined][] = [
    ...ROW_ORDER.map((key): [string, string | undefined] => [
      key,
      replaced.has(key) ? values[key] : existing.get(key),
    ]),
    ...tbl.rows
      .filter((r) => !ROW_ORDER.includes(r.key))
      .map((r): [string, string] => [r.key, r.value]),
  ]
  const names = tbl.names.filter((n) => !check.dropIds.includes(n))
  return table(["Names", names.join(", ")], rows)
}

const fixPost = (markdown: string, checks: Check[]): string => {
  const parts = splitFrontmatter(markdown)
  if (!parts) {
    return markdown
  }
  let frontmatter = parts.frontmatter
  const entries = targetEntries(frontmatter)
  checks.forEach((check, i) => {
    const entry = entries[i]
    if (entry !== undefined) {
      frontmatter = frontmatter.replace(entry, fixEntry(entry, check))
    }
  })

  const dropped = checks.flatMap((c) => c.dropIds)
  const dropTags = new Set(dropped.map((id) => parseCatalogId(id)?.tag))
  frontmatter = frontmatter
    .replace(/^tags: \[(.*)\]$/m, (_, list: string) => {
      const tags = list
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t && !dropTags.has(t))
      return `tags: [ ${tags.join(", ")} ]`
    })
    .replace(/^intro: (.*)$/m, (line) =>
      dropped.reduce(
        (text, id) => text.replace(` / ${id}`, "").replace(`${id} / `, ""),
        line,
      ),
    )

  const lines = parts.body.split("\n")
  for (const check of [...checks].sort(
    (a, b) => (b.table?.start ?? 0) - (a.table?.start ?? 0),
  )) {
    if (check.table) {
      lines.splice(
        check.table.start,
        check.table.end - check.table.start + 1,
        ...fixTable(check.table, check).split("\n"),
      )
    }
  }
  return `---\n${frontmatter}\n---\n${lines.join("\n")}`
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isConnectFailure = (error: unknown): boolean =>
  error instanceof Error &&
  /fetch failed/.test(error.message) &&
  /Connect|ECONN|ENOTFOUND|EAI_AGAIN/.test(String(error.cause))

const markdownFiles = async (dir: string): Promise<string[]> =>
  (await readdir(dir, { withFileTypes: true, recursive: true }))
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => join(e.parentPath, e.name))
    .sort()

const main = async () => {
  const args = process.argv.slice(2)
  const fix = args.includes("--fix")
  const named = args.filter((a) => !a.startsWith("--"))
  const files = named.length > 0 ? named : await markdownFiles(CONTENT)
  let changed = 0

  for (const file of files) {
    const markdown = await readFile(file, "utf8")
    const parts = splitFrontmatter(markdown)
    const posts = parts ? targetEntries(parts.frontmatter).map(parseEntry) : []
    const deepSky = posts.filter((p) => p.ra !== undefined)
    if (!parts || deepSky.length === 0 || deepSky.length !== posts.length) {
      continue
    }

    const lines = parts.body.split("\n")
    const checks: Check[] = []
    for (const post of posts) {
      await sleep(1500)
      try {
        checks.push(
          checkTarget(
            post,
            await lookupTarget(post.name),
            findTable(lines, post.name),
          ),
        )
      } catch (error) {
        console.log(
          `${relative(ROOT, file)}: ${post.name}: lookup failed - ${String(error)}${error instanceof Error && error.cause ? ` (${String(error.cause)})` : ""}`,
        )
        if (isConnectFailure(error)) {
          console.log("Can't connect - stopping. Try again later.")
          process.exit(1)
        }
      }
    }
    if (checks.length !== posts.length) {
      continue
    }

    const report = checks.filter((c) => c.changes.length > 0)
    if (report.length === 0) {
      continue
    }
    console.log(`\n${relative(ROOT, file)}`)
    for (const c of report) {
      console.log(`  ${c.post.name}${c.table ? "" : " (table not found)"}`)
      c.changes.forEach((line) => console.log(`    ${line}`))
    }
    if (fix) {
      await writeFile(file, fixPost(markdown, checks))
      changed++
    }
  }
  if (fix) {
    console.log(`\n${changed} post(s) updated - review with git diff`)
  }
}

await main()

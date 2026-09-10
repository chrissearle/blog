import type { PostPreview, PostTarget } from "~/types/post"

// The catalogs that get their own column on /astrophotography; anything else goes
// in "Other"
export const MAIN_CATALOGS = ["Messier", "NGC", "IC", "Caldwell"] as const
export type MainCatalog = (typeof MAIN_CATALOGS)[number]

const CATALOG_SIZES: Partial<Record<MainCatalog, number>> = {
  Messier: 110,
  Caldwell: 109,
}

export interface CatalogRef {
  // "Messier 81" - also the post tag
  id: string
  catalog: string
  number: string
}

export interface TargetPost {
  path: string
  title: string
  date: string
  image?: string
}

export interface TargetRow {
  name: string
  type?: PostTarget["type"]
  constellation?: string
  ids: CatalogRef[]
  // Newest first
  posts: TargetPost[]
}

// "Messier 81" → Messier / 81, "Sh2-142" → Sh2 / 142
const parseId = (id: string): CatalogRef => {
  const match = /^(Sh2)-(\d+)$/.exec(id) ?? /^(.+?)\s+(\d+)$/.exec(id)
  return match?.[1] && match[2]
    ? { id, catalog: match[1], number: match[2] }
    : { id, catalog: id, number: "" }
}

const isMain = (catalog: string): catalog is MainCatalog =>
  MAIN_CATALOGS.some((c) => c === catalog)

export const useTargets = () => {
  const { tagsLink } = useLinks()

  // One row per target name; a target imaged in several posts gets one row listing
  // all of them. Expects posts newest first.
  const buildRows = (posts: PostPreview[]): TargetRow[] => {
    const rows = new Map<string, TargetRow>()

    for (const post of posts) {
      for (const target of post.targets ?? []) {
        const key = target.name.toLowerCase()
        const row = rows.get(key) ?? {
          name: target.name,
          type: target.type,
          constellation: target.constellation,
          ids: [],
          posts: [],
        }
        const known = new Set(row.ids.map((i) => i.id))
        row.ids.push(
          ...(target.ids ?? []).filter((id) => !known.has(id)).map(parseId),
        )
        row.posts.push({
          path: post.path.endsWith("/") ? post.path : `${post.path}/`,
          title: post.title ?? target.name,
          date: post.date ?? "",
          image: post.image ?? post.embedImage,
        })
        rows.set(key, row)
      }
    }

    return [...rows.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "en", { numeric: true }),
    )
  }

  const idsIn = (row: TargetRow, catalog: MainCatalog): CatalogRef[] =>
    row.ids.filter((i) => i.catalog === catalog)

  const otherIds = (row: TargetRow): CatalogRef[] =>
    row.ids.filter((i) => !isMain(i.catalog))

  // "M 81", "C 7" - the short forms people actually say; others as written
  const shortLabel = (ref: CatalogRef): string => {
    if (ref.catalog === "Messier") return `M ${ref.number}`
    if (ref.catalog === "Caldwell") return `C ${ref.number}`
    return ref.id
  }

  const idLink = (ref: CatalogRef): string => tagsLink(ref.id.toLowerCase())

  // e.g. { catalog: "Messier", seen: 8, size: 110 }
  const progress = (rows: TargetRow[]) =>
    MAIN_CATALOGS.flatMap((catalog) => {
      const size = CATALOG_SIZES[catalog]
      if (!size) return []
      const seen = new Set(
        rows.flatMap((r) => idsIn(r, catalog).map((i) => i.number)),
      ).size
      return [{ catalog, seen, size }]
    })

  return { buildRows, idsIn, otherIds, shortLabel, idLink, progress }
}

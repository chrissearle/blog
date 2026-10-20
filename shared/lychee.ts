// Public photos from the Lychee gallery at gallery.chrissearle.org.
//
// Used at build time by the content hook in nuxt.config.ts and by the post
// scripts - never by the running site. Standalone (no imports) so Node's type
// stripping can run it directly from scripts/.

export const GALLERY = "https://gallery.chrissearle.org"
const API = `${GALLERY}/api/v2`
const PAGE_SIZE = 500

export const VARIANTS = [
  "original",
  "medium2x",
  "medium",
  "small2x",
  "small",
  "thumb2x",
  "thumb",
] as const
export type VariantName = (typeof VARIANTS)[number]

export interface LycheeVariant {
  url: string
  width: number
  height: number
}

export interface LycheePhoto {
  id: string
  albumId: string
  albumTitle: string
  title: string
  description?: string
  takenAt?: string
  variants: Partial<Record<VariantName, LycheeVariant>>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined

const records = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : []

const variant = (value: unknown): LycheeVariant | undefined => {
  if (!isRecord(value)) {
    return undefined
  }
  const url = str(value.url)
  const { width, height } = value
  return url && typeof width === "number" && typeof height === "number"
    ? { url, width, height }
    : undefined
}

const toPhoto = (
  raw: Record<string, unknown>,
  album: { id: string; title: string },
): LycheePhoto | undefined => {
  const id = str(raw.id)
  const sizes = isRecord(raw.size_variants) ? raw.size_variants : {}
  if (!id || raw.is_video === true) {
    return undefined
  }
  const variants: Partial<Record<VariantName, LycheeVariant>> = {}
  for (const name of VARIANTS) {
    const v = variant(sizes[name])
    if (v) {
      variants[name] = v
    }
  }
  return {
    id,
    albumId: album.id,
    albumTitle: album.title,
    title: str(raw.title) ?? id,
    description: str(raw.description),
    takenAt: isRecord(raw.exif) ? str(raw.exif.taken_at) : undefined,
    variants,
  }
}

// The album listing needs a session: Lychee hands out an XSRF-TOKEN cookie on
// any page, and wants it echoed back in a header. The Embed endpoints don't.
const session = async (): Promise<HeadersInit> => {
  const res = await fetch(GALLERY, { signal: AbortSignal.timeout(20000) })
  const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0] ?? "")
  const xsrf = cookies.find((c) => c.startsWith("XSRF-TOKEN="))
  if (!xsrf) {
    throw new Error(`No XSRF-TOKEN cookie from ${GALLERY}`)
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Cookie: cookies.join("; "),
    "X-XSRF-TOKEN": decodeURIComponent(xsrf.slice("XSRF-TOKEN=".length)),
  }
}

const getJson = async (
  path: string,
  headers: HeadersInit,
): Promise<unknown> => {
  const res = await fetch(`${API}/${path}`, {
    headers,
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} from ${API}/${path}`)
  }
  return res.json()
}

interface Album {
  id: string
  title: string
}

// Public albums only: link-only and password-protected ones are left out, as
// are their children
const openAlbums = (list: unknown): (Album & { hasChildren: boolean })[] =>
  records(list).flatMap((a) => {
    const id = str(a.id)
    const open =
      a.is_public === true &&
      a.is_link_required !== true &&
      a.is_password_required !== true
    return id && open
      ? [
          {
            id,
            title: str(a.title) ?? id,
            hasChildren: a.has_subalbum === true,
          },
        ]
      : []
  })

const allAlbums = async (headers: HeadersInit): Promise<Album[]> => {
  const root = await getJson("Albums", headers)
  const queue = openAlbums(isRecord(root) ? root.albums : [])
  const found: Album[] = []
  for (let album = queue.shift(); album; album = queue.shift()) {
    found.push({ id: album.id, title: album.title })
    if (!album.hasChildren) {
      continue
    }
    for (let page = 1, last = 1; page <= last; page++) {
      const res = await getJson(
        `Album::albums?album_id=${album.id}&page=${page}`,
        headers,
      )
      if (!isRecord(res)) {
        break
      }
      last = typeof res.last_page === "number" ? res.last_page : 1
      queue.push(...openAlbums(res.data))
    }
  }
  return found
}

const albumPhotos = async (
  album: Album,
  headers: HeadersInit,
): Promise<LycheePhoto[]> => {
  const photos: LycheePhoto[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const res = await getJson(
      `Embed/${album.id}?limit=${PAGE_SIZE}&offset=${offset}`,
      headers,
    )
    const page = records(isRecord(res) ? res.photos : [])
    photos.push(
      ...page
        .map((p) => toPhoto(p, album))
        .filter((p): p is LycheePhoto => p !== undefined),
    )
    if (page.length < PAGE_SIZE) {
      return photos
    }
  }
}

let cached: Promise<Map<string, LycheePhoto>> | undefined

// Every public photo, by id. Fetched once per process.
export const fetchPublicPhotos = (): Promise<Map<string, LycheePhoto>> => {
  cached ??= (async () => {
    const headers = await session()
    const photos = new Map<string, LycheePhoto>()
    for (const album of await allAlbums(headers)) {
      for (const photo of await albumPhotos(album, headers)) {
        // A photo in several albums links to the first one found
        if (!photos.has(photo.id)) {
          photos.set(photo.id, photo)
        }
      }
    }
    return photos
  })()
  return cached
}

export const photoPageUrl = (photo: LycheePhoto): string =>
  `${GALLERY}/gallery/${photo.albumId}/${photo.id}`

// The size shown in posts: Lychee's medium is up to 1920x1080
export const displayVariant = (photo: LycheePhoto): LycheeVariant | undefined =>
  photo.variants.medium ?? photo.variants.original ?? photo.variants.small2x

// og:image and post cards - large enough for link previews, but never the
// original, which can be many megabytes
export const ogUrl = (photo: LycheePhoto): string | undefined =>
  (
    photo.variants.medium2x ??
    photo.variants.medium ??
    photo.variants.small2x ??
    photo.variants.original
  )?.url

export const srcset = (photo: LycheePhoto): string =>
  (["small", "small2x", "medium", "medium2x", "original"] as const)
    .flatMap((name) => {
      const v = photo.variants[name]
      return v ? [v] : []
    })
    // Lychee doesn't upscale, so small images have several equal-width sizes
    .filter((v, i, all) => all.findIndex((o) => o.width === v.width) === i)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ")

const ID = /^[A-Za-z0-9_-]{24}$/

// "/uploads/medium/aa/4b/733f.png" → "aa/4b/733f": variants of one photo share
// it, but not always the extension (square thumbs are jpeg)
const uploadStem = (url: string): string | undefined =>
  new URL(url).pathname.match(/^\/uploads\/[^/]+\/(.+)\.[^./]+$/)?.[1]

// Accepts `lychee:<id>`, a bare id, a photo page URL
// (/gallery/<album>/<photo>) or a "copy image URL" (/uploads/<size>/../<hash>.ext).
// Image URLs carry no id, so they are matched against the photos' variants.
export const parseGalleryRef = (
  ref: string,
  photos: Map<string, LycheePhoto>,
): LycheePhoto | undefined => {
  const value = ref.trim().replace(/^lychee:/, "")
  if (ID.test(value)) {
    return photos.get(value)
  }
  if (!value.startsWith(GALLERY)) {
    return undefined
  }
  const page = new URL(value).pathname.match(/^\/gallery\/[^/]+\/([^/]+)\/?$/)
  if (page?.[1]) {
    return photos.get(page[1])
  }
  const stem = uploadStem(value)
  return stem === undefined
    ? undefined
    : [...photos.values()].find((p) =>
        Object.values(p.variants).some((v) => uploadStem(v.url) === stem),
      )
}

// Does this frontmatter/attribute value point at the gallery?
export const isGalleryRef = (ref: string): boolean =>
  ref.startsWith("lychee:") || ref.startsWith(GALLERY)

// Case-insensitive match on title and description; every word must appear as
// a whole word, so "IC 342" doesn't match "music"
export const searchPhotos = (
  query: string,
  photos: Map<string, LycheePhoto>,
): LycheePhoto[] => {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (w) =>
        // \b only knows ASCII letters, so "Øyeren" would never match
        new RegExp(
          `(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`,
          "iu",
        ),
    )
  return [...photos.values()].filter((p) => {
    const text = `${p.title} ${p.description ?? ""}`
    return words.length > 0 && words.every((w) => w.test(text))
  })
}

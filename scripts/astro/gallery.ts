import {
  fetchPublicPhotos,
  type LycheePhoto,
  parseGalleryRef,
  searchPhotos,
} from "../../shared/lychee.ts"
import type { Target } from "./lookup.ts"
import { askValid, menu, say } from "./prompt.ts"

const label = (photo: LycheePhoto): string =>
  [
    photo.title,
    photo.description && photo.description !== photo.title
      ? `(${photo.description})`
      : undefined,
    `- ${photo.albumTitle}`,
    photo.takenAt ? photo.takenAt.slice(0, 10) : undefined,
  ]
    .filter(Boolean)
    .join(" ")

// Every catalog id and common name of every target, e.g. "IC 342", "Caldwell 5"
const searchTerms = (targets: Target[]): string[] => [
  ...new Set(
    targets.flatMap((t) => [
      ...t.names.map((n) => n.display),
      ...t.commonNames,
    ]),
  ),
]

const searchAll = (
  terms: string[],
  photos: Map<string, LycheePhoto>,
): LycheePhoto[] => [
  ...new Map(
    terms.flatMap((term) => searchPhotos(term, photos)).map((p) => [p.id, p]),
  ).values(),
]

// A photo id or gallery URL picks that photo; anything else is a search
const resolve = async (
  input: string,
  photos: Map<string, LycheePhoto>,
): Promise<LycheePhoto | undefined> => {
  const direct = parseGalleryRef(input, photos)
  if (direct) {
    return direct
  }
  const found = searchPhotos(input, photos)
  if (found.length === 0) {
    return undefined
  }
  return menu(
    `\n${found.length} gallery photo(s) for "${input}":`,
    found.map((p) => ({ label: label(p), value: p })),
    0,
  )
}

// The gallery photo for the post: `initial` is the --gallery flag (an id, URL
// or search), otherwise the targets' names are searched first
export const askGalleryPhoto = async (
  targets: Target[],
  initial?: string,
): Promise<LycheePhoto> => {
  say("\nLoading the gallery's public photos...")
  const photos = await fetchPublicPhotos()

  if (initial) {
    const picked = await resolve(initial, photos)
    if (picked) {
      return picked
    }
    say(`  Nothing in the gallery matches "${initial}"`)
  } else {
    const terms = searchTerms(targets)
    const found = searchAll(terms, photos)
    if (found.length > 0) {
      // null, not undefined: menu() reads undefined as "not a valid choice"
      const picked = await menu<LycheePhoto | null>(
        `\nGallery photos matching ${terms.join(", ")}:`,
        [
          ...found.map((p) => ({ label: label(p), value: p })),
          { label: "Something else - enter an id, URL or search", value: null },
        ],
        0,
      )
      if (picked) {
        return picked
      }
    } else {
      say(`  Nothing in the gallery matches ${terms.join(", ")}`)
    }
  }

  for (;;) {
    const input = await askValid(
      "Gallery photo id, URL or search",
      (answer) => answer || undefined,
      "",
      "Enter a photo id, a gallery URL or some words to search for",
    )
    const picked = await resolve(input, photos)
    if (picked) {
      return picked
    }
    say(`  Nothing in the gallery matches "${input}"`)
  }
}

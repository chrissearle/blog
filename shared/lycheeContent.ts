// Build-time resolution of gallery references in posts, run from the
// content:file:afterParse hook in nuxt.config.ts:
//
//   image: lychee:<id>        → image: <gallery URL>, imageLink: <photo page>
//   :lychee{id="<id>"}        → the same node with src, srcset, size, title and href
//
// Anything else (local /images/... paths, other URLs) is left alone.
//
// An unknown or non-public photo, or a gallery that can't be reached, is
// returned as a problem rather than thrown:
// Nuxt Content drops a post whose parsing throws, with only a warning. The
// caller fails the build on problems instead (dev shows them in the post).

import {
  displayVariant,
  fetchPublicPhotos,
  isGalleryRef,
  type LycheePhoto,
  ogUrl,
  parseGalleryRef,
  photoPageUrl,
  srcset,
} from "./lychee"

// Minimark: [tag, props, ...children], with text nodes as plain strings
type MinimarkNode =
  string | [string, Record<string, unknown>, ...MinimarkNode[]]

const isElement = (
  node: unknown,
): node is [string, Record<string, unknown>, ...MinimarkNode[]] =>
  Array.isArray(node) &&
  typeof node[0] === "string" &&
  typeof node[1] === "object" &&
  node[1] !== null

const lookup = (
  ref: string,
  photos: Map<string, LycheePhoto>,
  problems: string[],
): LycheePhoto | undefined => {
  const photo = parseGalleryRef(ref, photos)
  if (!photo) {
    problems.push(
      `"${ref}" is not a public photo on the gallery - check the id and that its album is public`,
    )
  }
  return photo
}

const lycheeProps = (
  props: Record<string, unknown>,
  photo: LycheePhoto,
): Record<string, unknown> => {
  const shown = displayVariant(photo)
  return {
    ...props,
    src: shown?.url,
    srcset: srcset(photo),
    width: shown?.width,
    height: shown?.height,
    // An explicit title="..." in the post wins over the gallery's
    title: typeof props.title === "string" ? props.title : photo.title,
    href: photoPageUrl(photo),
  }
}

const resolveNodes = (
  nodes: MinimarkNode[],
  photos: Map<string, LycheePhoto>,
  problems: string[],
): MinimarkNode[] =>
  nodes.map((node) => {
    if (!isElement(node)) {
      return node
    }
    const [tag, props, ...children] = node
    if (tag === "lychee") {
      const photo = lookup(String(props.id ?? ""), photos, problems)
      // Left unresolved, the component shows the problem in dev
      return photo ? [tag, lycheeProps(props, photo)] : node
    }
    const resolved = resolveNodes(children, photos, problems)
    // `:lychee{...}` on its own line arrives wrapped in a paragraph; its
    // <figure> can't sit inside a <p>
    const [only] = resolved
    if (
      tag === "p" &&
      resolved.length === 1 &&
      isElement(only) &&
      only[0] === "lychee"
    ) {
      return only
    }
    return [tag, props, ...resolved]
  })

const mentionsGallery = (content: Record<string, unknown>): boolean =>
  (typeof content.image === "string" && isGalleryRef(content.image)) ||
  JSON.stringify(content.body ?? "").includes('"lychee"')

// Returns the problems found; an empty list means every reference resolved
export const resolveGalleryRefs = async (
  content: Record<string, unknown>,
): Promise<string[]> => {
  const problems: string[] = []
  // Posts without gallery images never touch the network
  if (!mentionsGallery(content)) {
    return problems
  }
  let photos: Map<string, LycheePhoto>
  try {
    photos = await fetchPublicPhotos()
  } catch (e) {
    // Thrown, this would drop the post and let the build pass without it
    problems.push(
      `gallery unreachable: ${e instanceof Error ? e.message : String(e)}`,
    )
    if (typeof content.image === "string" && isGalleryRef(content.image)) {
      content.image = undefined
    }
    return problems
  }

  if (typeof content.image === "string" && isGalleryRef(content.image)) {
    const photo = lookup(content.image, photos, problems)
    // An unresolved image is dropped rather than left as an unloadable lychee: URL
    content.image = photo ? ogUrl(photo) : undefined
    content.imageLink = photo ? photoPageUrl(photo) : undefined
    content.imageSrcset = photo ? srcset(photo) : undefined
  }

  const body = content.body
  if (
    typeof body === "object" &&
    body !== null &&
    "value" in body &&
    Array.isArray(body.value)
  ) {
    body.value = resolveNodes(body.value, photos, problems)
  }
  return problems
}

import type { MinimarkNode, MinimarkTree } from "@nuxt/content"

// Plain text of a minimark node: strings are text, elements are [tag, props, ...children]
export const textOf = (node: MinimarkNode): string =>
  typeof node === "string"
    ? node
    : node
        .slice(2)
        .map((child) => textOf(child as MinimarkNode))
        .join("")

// Top-level <p> elements of a post body, in document order.
// Astro posts open with a data <table>, so "first node" is not the same as "first paragraph".
const paragraphs = (body: MinimarkTree): MinimarkNode[] =>
  body.value.filter((node) => Array.isArray(node) && node[0] === "p")

// Feed summary for posts without an `intro` in frontmatter.
// Returns undefined when nothing suitable is found - the item then shows image + link only.
export const firstParagraph = (
  body: MinimarkTree | undefined,
): string | undefined => {
  if (!body) return undefined

  const candidates = paragraphs(body)

  // TODO: choose the summary text from `candidates` (use textOf() to get each one's text)
  return candidates.length > 0 ? undefined : undefined
}

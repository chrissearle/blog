import { glob, readFile } from "node:fs/promises"
import { join } from "node:path"

import { safeTag } from "./format.ts"

const frontmatterOf = (markdown: string): string =>
  /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1] ?? ""

// Handles both `tags: [ a, b ]` and a YAML block list
const tagsOf = (markdown: string): string[] => {
  const fm = frontmatterOf(markdown)
  const flow = /^tags:\s*\[(.*)\]\s*$/m.exec(fm)
  if (flow?.[1] !== undefined) {
    return flow[1].split(",").map((t) => t.trim())
  }
  const block = /^tags:\s*\n((?:\s+-\s+.*\n?)+)/m.exec(fm)
  return (
    block?.[1]?.split("\n").map((l) => l.replace(/^\s+-\s+/, "").trim()) ?? []
  )
}

// Slugs of every tag already used on the blog - two tags with the same slug share a
// tag page, so that's what "already exists" means
export const existingTagSlugs = async (
  contentDir: string,
): Promise<Set<string>> => {
  const slugs = new Set<string>()
  for await (const file of glob("**/*.md", { cwd: contentDir })) {
    for (const tag of tagsOf(await readFile(join(contentDir, file), "utf8"))) {
      if (tag !== "") {
        slugs.add(safeTag(tag))
      }
    }
  }
  return slugs
}

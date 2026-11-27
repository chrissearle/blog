import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { isRecord, str } from "./http.ts"

const here = dirname(fileURLToPath(import.meta.url))
const REGISTRY = join(here, "equipment.json")
// Per-machine convenience - gitignored
const LAST_SETUP = join(here, ".last-setup.json")

// The kinds that make up a Setup - one of each per post
export const KINDS = ["optics", "camera", "mount", "control"] as const
export type Kind = (typeof KINDS)[number]

// Filters are not part of the Setup: a post can have several, one per
// integration line
export const COMPONENT_KINDS = [...KINDS, "filter"] as const
export type ComponentKind = (typeof COMPONENT_KINDS)[number]

export interface Component {
  id: string
  kind: ComponentKind
  name: string
  maker: string
  // e.g. "250 mm f/5" - shown after the name in the Photo Details table
  details?: string
  // Project or product page - the name links to it in the Photo Details table
  link?: string
  // Source repository - a GitHub icon after the description links to it
  github?: string
  tags: string[]
  // Smart scopes: optics, camera, mount and control in one unit
  integrated?: boolean
  // Camera lens rather than a telescope - labels the Photo Details row "Lens"
  lens?: boolean
  // Filters only: ids of the optics this filter fits (a smart scope's built-in
  // filters, or the main rig). Absent means any optics.
  optics?: string[]
}

export type Setup = Partial<Record<Kind, Component>>

const isKind = (value: unknown): value is ComponentKind =>
  COMPONENT_KINDS.some((kind) => kind === value)

const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : undefined

const parseComponent = (value: unknown): Component | undefined => {
  if (!isRecord(value) || !isKind(value.kind)) {
    return undefined
  }
  const id = str(value.id)
  const name = str(value.name)
  if (!id || !name) {
    return undefined
  }
  return {
    id,
    kind: value.kind,
    name,
    maker: str(value.maker) ?? "",
    details: str(value.details),
    link: str(value.link),
    github: str(value.github),
    tags: strings(value.tags) ?? [],
    integrated: value.integrated === true ? true : undefined,
    lens: value.lens === true ? true : undefined,
    optics: strings(value.optics),
  }
}

export const loadEquipment = async (): Promise<Component[]> => {
  const json: unknown = JSON.parse(await readFile(REGISTRY, "utf8"))
  const list =
    isRecord(json) && Array.isArray(json.components) ? json.components : []
  return list.map(parseComponent).filter((c): c is Component => c !== undefined)
}

export const saveEquipment = async (components: Component[]): Promise<void> => {
  await writeFile(REGISTRY, `${JSON.stringify({ components }, null, 2)}\n`)
}

export const loadLastSetup = async (): Promise<
  Partial<Record<Kind, string>>
> => {
  if (!existsSync(LAST_SETUP)) {
    return {}
  }
  try {
    const json: unknown = JSON.parse(await readFile(LAST_SETUP, "utf8"))
    return isRecord(json)
      ? Object.fromEntries(
          KINDS.flatMap((kind) => {
            const id = str(json[kind])
            return id ? [[kind, id]] : []
          }),
        )
      : {}
  } catch {
    return {}
  }
}

export const saveLastSetup = async (setup: Setup): Promise<void> => {
  const ids = Object.fromEntries(
    KINDS.flatMap((kind) => {
      const component = setup[kind]
      return component ? [[kind, component.id]] : []
    }),
  )
  await writeFile(LAST_SETUP, `${JSON.stringify(ids, null, 2)}\n`)
}

export const describe = (component: Component): string =>
  component.details
    ? `${component.name} (${component.details})`
    : component.name

// Markdown for the Photo Details table: as describe(), with the name linked
// when the component has a link, and a GitHub icon (app/components/content/
// GithubLink.vue) when it has a repository
export const describeLinked = (component: Component): string => {
  const name = component.link
    ? `[${component.name}](${component.link})`
    : component.name
  return [
    component.details ? `${name} (${component.details})` : name,
    component.github ? `:github-link{href="${component.github}"}` : undefined,
  ]
    .filter(Boolean)
    .join(" ")
}

export const setupTags = (setup: Setup): string[] => [
  ...new Set(KINDS.flatMap((kind) => setup[kind]?.tags ?? [])),
]

// The filters that can be used with these optics
export const filtersFor = (
  optics: Component | undefined,
  components: Component[],
): Component[] =>
  components.filter(
    (c) =>
      c.kind === "filter" &&
      (!optics || !c.optics || c.optics.includes(optics.id)),
  )

import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { isRecord, str } from "./http.ts"

const here = dirname(fileURLToPath(import.meta.url))
const REGISTRY = join(here, "equipment.json")
// Per-machine convenience - gitignored
const LAST_SETUP = join(here, ".last-setup.json")

export const KINDS = ["optics", "camera", "mount", "control"] as const
export type Kind = (typeof KINDS)[number]

export interface Component {
  id: string
  kind: Kind
  name: string
  maker: string
  // e.g. "250 mm f/5" - shown after the name in the Photo Details table
  details?: string
  tags: string[]
  // Smart scopes: optics, camera, mount and control in one unit
  integrated?: boolean
  // Camera lens rather than a telescope - labels the Photo Details row "Lens"
  lens?: boolean
}

export type Setup = Partial<Record<Kind, Component>>

const isKind = (value: unknown): value is Kind =>
  KINDS.some((kind) => kind === value)

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
    tags: Array.isArray(value.tags)
      ? value.tags.filter((t): t is string => typeof t === "string")
      : [],
    integrated: value.integrated === true ? true : undefined,
    lens: value.lens === true ? true : undefined,
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

export const setupTags = (setup: Setup): string[] => [
  ...new Set(KINDS.flatMap((kind) => setup[kind]?.tags ?? [])),
]

import { getJson, isRecord, num, str } from "./http.ts"

// Stellarium's Remote Control plugin (Configuration → Plugins → Remote Control,
// "load at startup" + "enable server"). Only used to fill gaps - silently skipped
// when Stellarium isn't running.
const INFO_URL = "http://localhost:8090/api/objects/info"

export interface StellariumInfo {
  // "Bode's Galaxy" - empty for objects without a proper name
  name?: string
  // "M 81 - NGC 3031 - PGC 28630" split up. The first is the record's primary id.
  designations: string[]
  vmag?: number
  majorArcmin?: number
  minorArcmin?: number
}

const degToArcmin = (value: unknown): number | undefined => {
  const deg = num(value)
  return deg !== undefined && deg > 0 ? deg * 60 : undefined
}

// Stellarium only resolves short forms: "M 81", "B 33", "C 7" - not "Messier 81"
export const lookupStellarium = async (
  name: string,
): Promise<StellariumInfo | undefined> => {
  try {
    const params = new URLSearchParams({ name, format: "json" })
    const json = await getJson(`${INFO_URL}?${params}`, {}, 1000)
    if (!isRecord(json) || json.found !== true) {
      return undefined
    }
    const vmag = num(json.vmag)
    return {
      name: str(json.name)?.replace(/^The /, ""),
      designations: (str(json.designations) ?? "")
        .split(" - ")
        .map((d) => d.trim())
        .filter(Boolean),
      // Stellarium reports 99 for objects without a known magnitude
      vmag: vmag !== undefined && vmag < 30 ? vmag : undefined,
      majorArcmin: degToArcmin(json["axis-major-dd"] ?? json["size-dd"]),
      minorArcmin: degToArcmin(json["axis-minor-dd"]),
    }
  } catch {
    return undefined
  }
}

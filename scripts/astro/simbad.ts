import { getJson, isRecord, num, str } from "./http.ts"

// SIMBAD's TAP service takes ADQL (SQL for astronomy). The ident table matches
// loosely, so "M81", "M 81", "Sh2-142" and "Whirlpool Galaxy" all resolve.
// Strasbourg is the primary; Harvard runs an official mirror of the same
// database. A mirror that fails is skipped for the rest of the run, so an
// outage costs one timeout rather than one per query.
//
// Any failure counts, not just an unreachable host: during maintenance
// Strasbourg answers 404 with an HTML page, which getJson turns into undefined.
// The queries are fixed templates with escaped input, so a failure is the
// server's, and the next mirror is worth trying.
const TAP_URLS = [
  "https://simbad.cds.unistra.fr/simbad/sim-tap/sync",
  "https://simbad.harvard.edu/simbad/sim-tap/sync",
]
const unavailable = new Set<string>()

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export interface SimbadObject {
  mainId: string
  // SIMBAD object type code, e.g. "Sy2", "HII", "OpC"
  otype?: string
  ra: number
  dec: number
  vmag?: number
  majorArcmin?: number
  minorArcmin?: number
  identifiers: string[]
}

const adqlString = (value: string): string => `'${value.replace(/'/g, "''")}'`

const tap = async (query: string): Promise<unknown[][]> => {
  const body = new URLSearchParams({
    request: "doQuery",
    lang: "adql",
    format: "json",
    query,
  })
  let lastError: unknown = new Error("No SIMBAD mirror reachable")
  for (const url of TAP_URLS.filter((u) => !unavailable.has(u))) {
    const host = new URL(url).host
    try {
      const json = await getJson(url, { method: "POST", body }, 10000)
      if (!isRecord(json) || !Array.isArray(json.data)) {
        throw new Error(
          json === undefined ? "404 from SIMBAD" : "Unexpected SIMBAD response",
        )
      }
      return json.data.filter((row): row is unknown[] => Array.isArray(row))
    } catch (error) {
      unavailable.add(url)
      lastError = error
      console.warn(`SIMBAD at ${host} failed (${describe(error)})`)
    }
  }
  throw lastError
}

export const lookupSimbad = async (
  name: string,
): Promise<SimbadObject | undefined> => {
  const [row] = await tap(`
    SELECT b.oid, b.main_id, b.otype, b.ra, b.dec, b.galdim_majaxis, b.galdim_minaxis, f.flux
    FROM basic b
    JOIN ident i ON i.oidref = b.oid
    LEFT JOIN flux f ON f.oidref = b.oid AND f.filter = 'V'
    WHERE i.id = ${adqlString(name)}
  `)

  if (!row) {
    return undefined
  }

  const [oid, mainId, otype, ra, dec, major, minor, vmag] = row
  const raDeg = num(ra)
  const decDeg = num(dec)
  const main = str(mainId)

  if (main === undefined || raDeg === undefined || decDeg === undefined) {
    return undefined
  }

  const idRows = await tap(`SELECT id FROM ident WHERE oidref = ${num(oid)}`)

  return {
    mainId: main.replace(/\s+/g, " "),
    otype: str(otype),
    ra: raDeg,
    dec: decDeg,
    vmag: num(vmag),
    majorArcmin: num(major),
    minorArcmin: num(minor),
    identifiers: idRows
      .map(([id]) => str(id))
      .filter((id): id is string => id !== undefined)
      .map((id) => id.replace(/\s+/g, " ")),
  }
}

// "NAME Whirlpool Galaxy" entries are SIMBAD's common names. Skip the all-caps
// abbreviations such as "NAME CRAB NEB".
export const simbadCommonNames = (object: SimbadObject): string[] =>
  object.identifiers
    .filter((id) => id.startsWith("NAME "))
    .map((id) => id.slice(5))
    .filter((id) => id !== id.toUpperCase())

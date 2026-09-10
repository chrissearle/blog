import { getJson, isRecord, num, str } from "./http.ts"

const ENTITY = "https://www.wikidata.org/wiki/Special:EntityData/"
const API = "https://www.wikidata.org/w/api.php"

const P_CONSTELLATION = "P59"
const P_DISTANCE = "P2583"
const P_MAGNITUDE = "P1215"
const P_BAND = "P1227"
const P_CATALOG_CODE = "P528"
const P_CATALOG = "P972"
const P_RA = "P6257"
const P_DEC = "P6258"

const V_BAND = "Q4892529"
const CALDWELL_CATALOG = "Q857461"

const LIGHT_YEARS_PER_UNIT: Record<string, number> = {
  Q531: 1, // light-year
  Q12129: 3.26156, // parsec
  Q11929860: 3261.56, // kiloparsec
  Q3773454: 3261560, // megaparsec
}

export interface WikidataInfo {
  constellation?: string
  distanceLy?: number
  vmag?: number
  ra?: number
  dec?: number
  // Raw catalog codes, with Caldwell entries marked so they can be trusted
  catalogCodes: { code: string; caldwell: boolean }[]
}

interface Statement {
  rank: string
  value: unknown
  qualifiers: Record<string, unknown[]>
}

const statements = (
  claims: Record<string, unknown>,
  property: string,
): Statement[] => {
  const list = claims[property]
  if (!Array.isArray(list)) {
    return []
  }
  return list
    .filter(isRecord)
    .filter((claim) => claim.rank !== "deprecated")
    .map((claim) => {
      const snak = isRecord(claim.mainsnak) ? claim.mainsnak : {}
      const datavalue = isRecord(snak.datavalue) ? snak.datavalue : {}
      const qualifiers = isRecord(claim.qualifiers) ? claim.qualifiers : {}
      return {
        rank: str(claim.rank) ?? "normal",
        value: datavalue.value,
        qualifiers: Object.fromEntries(
          Object.entries(qualifiers).map(([k, v]) => [
            k,
            Array.isArray(v) ? v : [],
          ]),
        ),
      }
    })
    .sort(
      (a, b) => Number(b.rank === "preferred") - Number(a.rank === "preferred"),
    )
}

const itemId = (value: unknown): string | undefined =>
  isRecord(value) ? str(value.id) : undefined

const qualifierItems = (statement: Statement, property: string): string[] =>
  (statement.qualifiers[property] ?? [])
    .map((q) =>
      isRecord(q) && isRecord(q.datavalue)
        ? itemId(q.datavalue.value)
        : undefined,
    )
    .filter((id): id is string => id !== undefined)

const quantity = (
  value: unknown,
): { amount: number; unit: string } | undefined => {
  if (!isRecord(value)) {
    return undefined
  }
  const amount = num(value.amount)
  const unit = str(value.unit)?.split("/").pop()
  return amount === undefined || unit === undefined
    ? undefined
    : { amount, unit }
}

const label = async (qid: string): Promise<string | undefined> => {
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: qid,
    props: "labels",
    languages: "en",
    format: "json",
  })
  const json = await getJson(`${API}?${params}`)
  const entity =
    isRecord(json) && isRecord(json.entities) ? json.entities[qid] : undefined
  const labels =
    isRecord(entity) && isRecord(entity.labels) ? entity.labels : {}
  const en = isRecord(labels.en) ? labels.en : {}
  return str(en.value)
}

export const lookupWikidata = async (
  qid: string,
): Promise<WikidataInfo | undefined> => {
  const json = await getJson(`${ENTITY}${qid}.json`)
  const entities =
    isRecord(json) && isRecord(json.entities) ? json.entities : {}
  // Redirected items come back under their new id, so take the first entity
  const entity = Object.values(entities).find(isRecord)
  if (!entity || !isRecord(entity.claims)) {
    return undefined
  }
  const claims = entity.claims

  const constellationId = itemId(statements(claims, P_CONSTELLATION)[0]?.value)

  const distance = statements(claims, P_DISTANCE)
    .map((s) => quantity(s.value))
    .find((q) => q !== undefined && q.unit in LIGHT_YEARS_PER_UNIT)

  const vmag = statements(claims, P_MAGNITUDE)
    .filter((s) => qualifierItems(s, P_BAND).includes(V_BAND))
    .map((s) => quantity(s.value)?.amount)
    .find((m) => m !== undefined)

  return {
    constellation: constellationId ? await label(constellationId) : undefined,
    distanceLy: distance
      ? distance.amount * (LIGHT_YEARS_PER_UNIT[distance.unit] ?? 1)
      : undefined,
    vmag,
    ra: quantity(statements(claims, P_RA)[0]?.value)?.amount,
    dec: quantity(statements(claims, P_DEC)[0]?.value)?.amount,
    catalogCodes: statements(claims, P_CATALOG_CODE)
      .map((s) => ({
        code: str(s.value),
        caldwell: qualifierItems(s, P_CATALOG).includes(CALDWELL_CATALOG),
      }))
      .filter(
        (c): c is { code: string; caldwell: boolean } => c.code !== undefined,
      ),
  }
}

// True if the item looks like a sky object rather than, say, a band or a road
export const isAstronomical = (info: WikidataInfo): boolean =>
  info.constellation !== undefined || info.ra !== undefined

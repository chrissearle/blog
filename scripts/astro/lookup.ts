import {
  type CatalogId,
  isCatalogId,
  mergeCatalogIds,
  parseCatalogId,
} from "./catalogs.ts"
import {
  constellationFrom,
  type TypeTag,
  typeLabel,
  typeTag,
} from "./format.ts"
import { lookupSimbad, simbadCommonNames, type SimbadObject } from "./simbad.ts"
import { lookupStellarium } from "./stellarium.ts"
import {
  isAstronomical,
  lookupWikidata,
  type WikidataInfo,
} from "./wikidata.ts"
import {
  nameFromExtract,
  wikipediaInfobox,
  wikipediaSearch,
  wikipediaSummary,
  type WikipediaPage,
} from "./wikipedia.ts"

export interface Target {
  query: string
  // Candidate common names, best first. Empty when the object only has catalog ids.
  commonNames: string[]
  // Extra common names to show in the Names row (e.g. "M66 Group") - only set when
  // the names are edited by hand, since SIMBAD's alternatives are often odd
  aliases?: string[]
  names: CatalogId[]
  type?: string
  typeTag?: TypeTag
  constellation?: string
  distanceLy?: number
  vmag?: number
  majorArcmin?: number
  minorArcmin?: number
  ra?: number
  dec?: number
  wiki?: WikipediaPage
  warnings: string[]
}

const unique = (values: (string | undefined)[]): string[] => [
  ...new Set(values.filter((v): v is string => v !== undefined && v !== "")),
]

const catalogIdsFrom = (
  simbad: SimbadObject | undefined,
  wikidata: WikidataInfo | undefined,
  query: string,
): CatalogId[] =>
  mergeCatalogIds(
    [
      parseCatalogId(query),
      ...(simbad?.identifiers ?? []).map((id) =>
        parseCatalogId(id, { allowShortForms: false }),
      ),
      ...(wikidata?.catalogCodes ?? []).map(({ code, caldwell }) =>
        parseCatalogId(code, { allowShortForms: caldwell }),
      ),
    ].filter((id): id is CatalogId => id !== undefined),
  )

// Try likely article titles first; fall back to a search. A page only counts if its
// Wikidata item has a constellation or coordinates.
const findWikipedia = async (
  candidates: string[],
  searchFor: string,
): Promise<{ page: WikipediaPage; wikidata: WikidataInfo } | undefined> => {
  const tryTitle = async (title: string) => {
    const page = await wikipediaSummary(title)
    const wikidata = page?.qid ? await lookupWikidata(page.qid) : undefined
    return page && wikidata && isAstronomical(wikidata)
      ? { page, wikidata }
      : undefined
  }

  for (const title of candidates) {
    const found = await tryTitle(title)
    if (found) {
      return found
    }
  }

  const searched = await wikipediaSearch(searchFor)
  return searched ? tryTitle(searched) : undefined
}

export const lookupTarget = async (query: string): Promise<Target> => {
  const warnings: string[] = []

  let simbad = await lookupSimbad(query)

  // "Messier 81" and "Caldwell 7" redirect to the right article, so a catalog id
  // is a safer first guess than SIMBAD's names ("Whirlpool" is a disambiguation page)
  const catalogQuery = parseCatalogId(query)
  const wikiCandidates = unique([
    catalogQuery ? catalogQuery.display : query,
    ...(simbad ? simbadCommonNames(simbad) : []),
  ])
  const found = await findWikipedia(wikiCandidates, query)
  const wiki = found?.page
  const wikidata = found?.wikidata

  // SIMBAD doesn't know Caldwell numbers or some common names - retry with an
  // id Wikidata gave us
  if (!simbad) {
    const retry = catalogIdsFrom(undefined, wikidata, query).find(
      (id) => id.catalog !== "Caldwell",
    )
    simbad = retry ? await lookupSimbad(retry.display) : undefined
  }

  const knownIds = catalogIdsFrom(simbad, wikidata, query)

  // Is the Wikipedia article about this object, or a neighbour? (Sh2-142's article
  // is the NGC 7380 cluster.) Compare the catalog ids each source gives.
  const simbadIds = new Set(
    catalogIdsFrom(simbad, undefined, query).map((id) => id.display),
  )
  const articleIsTarget =
    !simbad ||
    catalogIdsFrom(undefined, wikidata, "").some((id) =>
      simbadIds.has(id.display),
    ) ||
    (wiki !== undefined && simbadCommonNames(simbad).includes(wiki.title))

  const infobox =
    wiki && articleIsTarget ? await wikipediaInfobox(wiki.title) : {}

  // Only trust a Stellarium record whose primary designation is one of ours -
  // "Leo Triplet" resolves to M 65's record, for example
  const stellariumRecord = await lookupStellarium(knownIds[0]?.short ?? query)
  const primary = stellariumRecord?.designations[0]
  const primaryId = primary ? parseCatalogId(primary) : undefined
  const stellarium =
    primaryId && knownIds.some((id) => id.display === primaryId.display)
      ? stellariumRecord
      : undefined

  const names = mergeCatalogIds([
    ...knownIds,
    ...(stellarium?.designations ?? [])
      .map((d) => parseCatalogId(d))
      .filter((id): id is CatalogId => id !== undefined),
  ])

  // Keep major/minor from the same source
  const size = [
    { major: simbad?.majorArcmin, minor: simbad?.minorArcmin },
    { major: infobox.majorArcmin, minor: infobox.minorArcmin },
    { major: stellarium?.majorArcmin, minor: stellarium?.minorArcmin },
  ].find((s) => s.major !== undefined)

  // A neighbour's article title or lead doesn't name this object
  const articleNames =
    wiki && articleIsTarget
      ? [
          isCatalogId(wiki.title) ? undefined : wiki.title,
          nameFromExtract(wiki.extract),
        ]
      : []
  const commonNames = unique([
    isCatalogId(query) ? undefined : query,
    ...articleNames,
    stellarium?.name && !isCatalogId(stellarium.name)
      ? stellarium.name
      : undefined,
    ...(simbad ? simbadCommonNames(simbad) : []),
  ])

  const target: Target = {
    query,
    commonNames,
    names,
    type: typeLabel(wiki?.description, simbad?.otype, articleIsTarget),
    typeTag: typeTag(wiki?.description, simbad?.otype, articleIsTarget),
    constellation:
      wikidata?.constellation ?? constellationFrom(wiki?.description),
    distanceLy: articleIsTarget ? wikidata?.distanceLy : undefined,
    vmag:
      simbad?.vmag ??
      (articleIsTarget ? wikidata?.vmag : undefined) ??
      infobox.vmag ??
      stellarium?.vmag,
    majorArcmin: size?.major,
    minorArcmin: size?.minor,
    ra: simbad?.ra ?? wikidata?.ra,
    dec: simbad?.dec ?? wikidata?.dec,
    wiki,
    warnings,
  }

  if (!articleIsTarget) {
    warnings.push(
      `Wikipedia article "${wiki?.title}" may be about a neighbouring object`,
    )
  }
  if (!simbad) warnings.push("not found in SIMBAD")
  if (!wiki) warnings.push("no Wikipedia article found")
  if (target.vmag === undefined) warnings.push("magnitude not found")
  if (target.majorArcmin === undefined)
    warnings.push("size not found - check Stellarium")
  if (target.distanceLy === undefined) warnings.push("distance not found")
  if (target.ra === undefined) warnings.push("coordinates not found")

  return target
}

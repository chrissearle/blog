// The catalogs worth showing on the blog. SIMBAD and Wikidata return dozens of survey
// designations per object (2MASX, LEDA, IRAS ...) - anything not matched here is dropped.
//
// Order matters: it is the order names appear in the Names row and the tag list.

export interface CatalogId {
  catalog: string
  // "Messier 81" - used in the Names row
  display: string
  // "M 81" - used for the image file name
  short: string
  // "messier 81" - used as the post tag
  tag: string
}

interface CatalogDef {
  catalog: string
  pattern: RegExp
  max?: number
  display: (n: string) => string
  short: (n: string) => string
}

const CATALOGS: CatalogDef[] = [
  {
    catalog: "Messier",
    pattern: /^(?:M|Messier)\s*(\d{1,3})$/i,
    max: 110,
    display: (n) => `Messier ${n}`,
    short: (n) => `M ${n}`,
  },
  {
    catalog: "NGC",
    pattern: /^NGC\s*(\d{1,4})$/i,
    display: (n) => `NGC ${n}`,
    short: (n) => `NGC ${n}`,
  },
  {
    catalog: "IC",
    pattern: /^IC\s*(\d{1,4})$/i,
    display: (n) => `IC ${n}`,
    short: (n) => `IC ${n}`,
  },
  {
    catalog: "Caldwell",
    pattern: /^(?:C|Caldwell)\s*(\d{1,3})$/i,
    max: 109,
    display: (n) => `Caldwell ${n}`,
    short: (n) => `C ${n}`,
  },
  {
    catalog: "Sharpless",
    pattern: /^(?:Sh\s*2\s*-?\s*|Sharpless\s+(?:2\s*-\s*)?)(\d{1,3})$/i,
    display: (n) => `Sh2-${n}`,
    short: (n) => `Sh2-${n}`,
  },
  {
    catalog: "Barnard",
    pattern: /^(?:B|Barnard)\s*(\d{1,3})$/i,
    display: (n) => `Barnard ${n}`,
    short: (n) => `B ${n}`,
  },
  {
    catalog: "Melotte",
    pattern: /^(?:Cl\s+)?(?:Mel|Melotte)\s*(\d{1,3})$/i,
    display: (n) => `Melotte ${n}`,
    short: (n) => `Mel ${n}`,
  },
  {
    catalog: "Collinder",
    pattern: /^(?:Cl\s+)?(?:Cr|Collinder)\s*(\d{1,3})$/i,
    display: (n) => `Collinder ${n}`,
    short: (n) => `Cr ${n}`,
  },
  {
    catalog: "Arp",
    pattern: /^(?:Arp|APG)\s*(\d{1,3})$/i,
    display: (n) => `Arp ${n}`,
    short: (n) => `Arp ${n}`,
  },
  {
    catalog: "van den Bergh",
    pattern: /^(?:vdB|van den Bergh)\s*(\d{1,3})$/i,
    display: (n) => `vdB ${n}`,
    short: (n) => `vdB ${n}`,
  },
]

export interface ParseOptions {
  // SIMBAD has no Caldwell catalog, and its bare "C"/"B" prefixes belong to other
  // catalogs - only trust those short forms from Wikidata or from user input.
  allowShortForms?: boolean
}

export const parseCatalogId = (
  raw: string,
  { allowShortForms = true }: ParseOptions = {},
): CatalogId | undefined => {
  const value = raw.trim().replace(/\s+/g, " ")

  for (const def of CATALOGS) {
    const match = def.pattern.exec(value)
    if (!match?.[1]) {
      continue
    }
    if (!allowShortForms && /^[CB]\s*\d/i.test(value)) {
      return undefined
    }
    const n = String(Number(match[1]))
    if (def.max !== undefined && Number(n) > def.max) {
      return undefined
    }
    const display = def.display(n)
    return {
      catalog: def.catalog,
      display,
      short: def.short(n),
      tag: display.toLowerCase(),
    }
  }

  return undefined
}

export const isCatalogId = (value: string): boolean =>
  parseCatalogId(value) !== undefined

const catalogRank = (id: CatalogId): number =>
  CATALOGS.findIndex((def) => def.catalog === id.catalog)

// De-duplicates by display name and sorts into catalog order.
export const mergeCatalogIds = (ids: CatalogId[]): CatalogId[] =>
  [...new Map(ids.map((id) => [id.display, id])).values()].sort(
    (a, b) =>
      catalogRank(a) - catalogRank(b) ||
      a.display.localeCompare(b.display, "en", { numeric: true }),
  )

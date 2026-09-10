import { getJson, isRecord, str } from "./http.ts"

const REST = "https://en.wikipedia.org/api/rest_v1/page/summary/"
const ACTION = "https://en.wikipedia.org/w/api.php"

export interface WikipediaPage {
  title: string
  // Wikidata short description, e.g. "Barred spiral galaxy in the constellation Ursa Major"
  description?: string
  // The lead paragraph as plain text
  extract: string
  url: string
  qid?: string
}

export const wikipediaSummary = async (
  title: string,
): Promise<WikipediaPage | undefined> => {
  const json = await getJson(
    `${REST}${encodeURIComponent(title.replace(/ /g, "_"))}?redirect=true`,
  )

  if (!isRecord(json) || json.type === "disambiguation") {
    return undefined
  }

  const pageTitle = str(json.title)
  const extract = str(json.extract)
  const urls = isRecord(json.content_urls) ? json.content_urls : {}
  const desktop = isRecord(urls.desktop) ? urls.desktop : {}
  const url = str(desktop.page)

  if (!pageTitle || !extract || !url) {
    return undefined
  }

  return {
    title: pageTitle,
    description: str(json.description),
    extract,
    url,
    qid: str(json.wikibase_item),
  }
}

export const wikipediaSearch = async (
  query: string,
): Promise<string | undefined> => {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: "1",
    format: "json",
  })
  const json = await getJson(`${ACTION}?${params}`)
  const search =
    isRecord(json) && isRecord(json.query) && Array.isArray(json.query.search)
      ? json.query.search
      : []
  const [first] = search
  return isRecord(first) ? str(first.title) : undefined
}

export interface InfoboxData {
  majorArcmin?: number
  minorArcmin?: number
  vmag?: number
}

// Reduces infobox wikitext to plain text:
// "{{Val|35|×|30|ul=arcminute}}<ref .../>" → "35 × 30 arcminute"
const plainWikitext = (raw: string): string =>
  raw
    .replace(/<ref[^>]*\/>/g, "")
    .replace(/<ref[\s\S]*?(<\/ref>|$)/g, "")
    .replace(/\{\{prime\}\}/gi, "′")
    .replace(/\{\{val\|([^}]*)\}\}/gi, (_, params: string) =>
      params
        .split("|")
        .map((p) => p.replace(/^u[l]?=/, ""))
        .filter((p) => !p.includes("="))
        .join(" "),
    )
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g, "$1")
    .trim()

// "120 × 100 arcmin", "25′", "60' x 50'", "3 degrees (diameter)"
export const parseInfoboxSize = (
  raw: string,
): { major: number; minor?: number } | undefined => {
  const text = plainWikitext(raw)
  const numbers = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
  const [major, minor] = numbers
  if (major === undefined) {
    return undefined
  }
  let factor: number | undefined
  if (/arc\s*min|arcminute|′|'/i.test(text)) factor = 1
  else if (/degree|°/i.test(text)) factor = 60
  else if (/arc\s*sec|″|"/i.test(text)) factor = 1 / 60
  if (factor === undefined) {
    return undefined
  }
  return {
    major: major * factor,
    minor: minor === undefined ? undefined : minor * factor,
  }
}

// Size and magnitude from the article's infobox - nebulae often have them there but
// not in SIMBAD
export const wikipediaInfobox = async (title: string): Promise<InfoboxData> => {
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    prop: "wikitext",
    section: "0",
    redirects: "1",
    format: "json",
  })
  const json = await getJson(`${ACTION}?${params}`)
  const parse = isRecord(json) && isRecord(json.parse) ? json.parse : {}
  const wikitext = isRecord(parse.wikitext)
    ? str(parse.wikitext["*"])
    : undefined
  if (!wikitext) {
    return {}
  }

  const field = (name: string): string | undefined =>
    new RegExp(`^\\s*\\|\\s*${name}\\s*=(.*)$`, "m").exec(wikitext)?.[1]?.trim()

  const sizeRaw = field("size_v")
  const size = sizeRaw ? parseInfoboxSize(sizeRaw) : undefined

  // Skip values tagged {{citation needed}}
  const magRaw = field("appmag_v")
  const magText =
    magRaw && !/\{\{(cn|citation needed)/i.test(magRaw)
      ? plainWikitext(magRaw)
      : ""
  const vmag = /^-?\d+(?:\.\d+)?$/.test(magText) ? Number(magText) : undefined

  return { majorArcmin: size?.major, minorArcmin: size?.minor, vmag }
}

// Pulls a common name out of a lead such as
// "NGC 7822, also known as the Question Mark Nebula, is ..."
export const nameFromExtract = (extract: string): string | undefined => {
  const match =
    /(?:also known as|known as|commonly called|nicknamed)\s+(?:the\s+)?((?:[A-Z][\w'’-]*\s+)*?(?:Nebula|Galaxy|Cluster|Triplet|Loop|Nebulae))\b/.exec(
      extract,
    )
  return match?.[1]
}

// The first `count` sentences of the lead paragraph.
export const leadSentences = (extract: string, count = 2): string => {
  const segmenter = new Intl.Segmenter("en", { granularity: "sentence" })
  return [...segmenter.segment(extract)]
    .slice(0, count)
    .map((s) => s.segment)
    .join("")
    .trim()
}

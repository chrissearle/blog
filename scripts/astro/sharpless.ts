import { getText, num } from "./http.ts"

// Sharpless' catalogue of HII regions (1959) via VizieR. SIMBAD and Stellarium
// merge some of these with an embedded cluster; this gives the nebula's own
// position and diameter.
const ASU_URL = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv"

export interface SharplessInfo {
  ra: number
  dec: number
  diameterArcmin?: number
}

export const lookupSharpless = async (
  number: number,
): Promise<SharplessInfo | undefined> => {
  const params = new URLSearchParams({
    "-source": "VII/20",
    Sh2: String(number),
    "-out.all": "",
    "-out.add": "_RAJ,_DEJ",
    "-oc.form": "dec",
  })
  try {
    const text = await getText(`${ASU_URL}?${params}`)
    const lines = (text ?? "")
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.startsWith("#"))
    const headerAt = lines.findIndex((line) =>
      line.split("\t").some((c) => c.trim() === "_RAJ2000"),
    )
    if (headerAt < 0) {
      return undefined
    }
    const columns = (lines[headerAt] ?? "").split("\t").map((c) => c.trim())
    // After the header come a units line and a dashes line
    const row = lines
      .slice(headerAt + 1)
      .find((line) => /^\s*[+-]?\d/.test(line))
      ?.split("\t")
    const value = (name: string): number | undefined => {
      const at = columns.indexOf(name)
      return at < 0 ? undefined : num(row?.[at]?.trim())
    }
    const ra = value("_RAJ2000")
    const dec = value("_DEJ2000")
    return ra === undefined || dec === undefined
      ? undefined
      : { ra, dec, diameterArcmin: value("Diam") }
  } catch {
    return undefined
  }
}

export const sharplessNumber = (display: string): number | undefined => {
  const match = /^Sh2-(\d+)$/.exec(display)
  return match ? Number(match[1]) : undefined
}

// Builds app/assets/sky.json - the stars and constellation lines drawn behind the
// /astrophotography sky map. Run by hand (`node scripts/astro/sky.ts`); the output is
// checked in.
//
// Data: d3-celestial by Olaf Frohn, BSD-3-Clause - https://github.com/ofrohn/d3-celestial
import { writeFile } from "fs/promises"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { getJson, isRecord, num, str } from "./http.ts"

const BASE = "https://cdn.jsdelivr.net/gh/ofrohn/d3-celestial@master/data"
const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../app/assets/sky.json",
)

// A little past the map's rim so lines run off the edge instead of stopping short
const MIN_DEC = -40
const MAX_MAG = 4.5

type Point = [number, number]

// d3-celestial stores RA as longitude in -180..180; the map wants 0..360
const toPoint = (value: unknown): Point | undefined => {
  if (!Array.isArray(value)) return undefined
  const ra = num(value[0])
  const dec = num(value[1])
  if (ra === undefined || dec === undefined) return undefined
  const round = (n: number): number => Math.round(n * 10) / 10
  return [round((ra + 360) % 360), round(dec)]
}

const features = async (file: string): Promise<Record<string, unknown>[]> => {
  const json = await getJson(`${BASE}/${file}`)
  if (!isRecord(json) || !Array.isArray(json.features)) {
    throw new Error(`Unexpected shape in ${file}`)
  }
  return json.features.filter(isRecord)
}

const geometry = (feature: Record<string, unknown>): unknown =>
  isRecord(feature.geometry) ? feature.geometry.coordinates : undefined

const props = (feature: Record<string, unknown>): Record<string, unknown> =>
  isRecord(feature.properties) ? feature.properties : {}

const stars = (await features("stars.6.json")).flatMap((feature) => {
  const mag = num(props(feature).mag)
  const point = toPoint(geometry(feature))
  return mag !== undefined && mag <= MAX_MAG && point && point[1] >= MIN_DEC
    ? [[...point, mag]]
    : []
})

// Each constellation is a list of polylines; keep one if any of it is on the map
const lines = (await features("constellations.lines.json")).flatMap(
  (feature) => {
    const coords = geometry(feature)
    return Array.isArray(coords)
      ? coords
          .map((line: unknown) =>
            Array.isArray(line)
              ? line.map(toPoint).filter((p) => p !== undefined)
              : [],
          )
          .filter((line) => line.some(([, dec]) => dec >= MIN_DEC))
      : []
  },
)

// Label position per constellation, keyed by the English name used in `targets:`
const labels = Object.fromEntries(
  (await features("constellations.json")).flatMap((feature) => {
    const name = str(props(feature).name)
    const point = toPoint(geometry(feature))
    return name && point && point[1] >= MIN_DEC ? [[name, point]] : []
  }),
)

await writeFile(OUT, `${JSON.stringify({ stars, lines, labels })}\n`)
process.stdout.write(
  `Wrote ${stars.length} stars, ${lines.length} lines, ${Object.keys(labels).length} labels to ${OUT}\n`,
)

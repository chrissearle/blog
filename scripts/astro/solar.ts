import {
  Body,
  Constellation,
  EquatorFromVector,
  GeoVector,
  Illumination,
  MoonPhase,
} from "astronomy-engine"

import type { TypeTag } from "./format.ts"

// Sun, Moon and planets. They move, so there is nothing for SIMBAD to look up - the
// fixed facts live here and the rest is computed for the capture date by
// astronomy-engine (offline, accurate to well under an arcminute).

export interface SolarBody {
  body: Body
  name: string
  type: string
  typeTag: TypeTag
  // Equatorial - the width you see in the eyepiece
  diameterKm: number
  // Article title, where the plain name is a disambiguation page
  wikipedia: string
}

const BODIES: SolarBody[] = [
  {
    body: Body.Sun,
    name: "Sun",
    type: "G-type main-sequence star",
    typeTag: "star",
    diameterKm: 1_392_700,
    wikipedia: "Sun",
  },
  {
    body: Body.Moon,
    name: "Moon",
    type: "Natural satellite",
    typeTag: "moon",
    diameterKm: 3_474.8,
    wikipedia: "Moon",
  },
  {
    body: Body.Mercury,
    name: "Mercury",
    type: "Terrestrial planet",
    typeTag: "planet",
    diameterKm: 4_880.5,
    wikipedia: "Mercury (planet)",
  },
  {
    body: Body.Venus,
    name: "Venus",
    type: "Terrestrial planet",
    typeTag: "planet",
    diameterKm: 12_103.6,
    wikipedia: "Venus",
  },
  {
    body: Body.Mars,
    name: "Mars",
    type: "Terrestrial planet",
    typeTag: "planet",
    diameterKm: 6_792.4,
    wikipedia: "Mars",
  },
  {
    body: Body.Jupiter,
    name: "Jupiter",
    type: "Gas giant",
    typeTag: "planet",
    diameterKm: 142_984,
    wikipedia: "Jupiter",
  },
  {
    body: Body.Saturn,
    name: "Saturn",
    type: "Gas giant",
    typeTag: "planet",
    diameterKm: 120_536,
    wikipedia: "Saturn",
  },
  {
    body: Body.Uranus,
    name: "Uranus",
    type: "Ice giant",
    typeTag: "planet",
    diameterKm: 51_118,
    wikipedia: "Uranus",
  },
  {
    body: Body.Neptune,
    name: "Neptune",
    type: "Ice giant",
    typeTag: "planet",
    diameterKm: 49_528,
    wikipedia: "Neptune",
  },
]

// "jupiter", "The Moon", "Sol" → the body
export const solarBody = (query: string): SolarBody | undefined => {
  const name = query
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
  const wanted = name === "sol" ? "sun" : name === "luna" ? "moon" : name
  return BODIES.find((b) => b.name.toLowerCase() === wanted)
}

// Where the body was on the night - everything in the table that changes over time
export interface Ephemeris {
  date: Date
  constellation: string
  distanceAu: number
  vmag: number
  // Apparent diameter
  sizeArcsec: number
  // 0 - 1, share of the disc that is lit
  illuminated: number
  // Moon only, 0 - 360: 0 new, 90 first quarter, 180 full, 270 last quarter
  moonPhase?: number
  // Saturn only, degrees
  ringTilt?: number
}

const KM_PER_AU = 149_597_870.7
const ARCSEC_PER_RADIAN = 206_264.806

export const ephemeris = (body: SolarBody, date: Date): Ephemeris => {
  const illumination = Illumination(body.body, date)
  const equator = EquatorFromVector(GeoVector(body.body, date, true))
  const distanceKm = illumination.geo_dist * KM_PER_AU
  return {
    date,
    constellation: Constellation(equator.ra, equator.dec).name,
    distanceAu: illumination.geo_dist,
    vmag: illumination.mag,
    sizeArcsec:
      2 * Math.atan(body.diameterKm / 2 / distanceKm) * ARCSEC_PER_RADIAN,
    illuminated: illumination.phase_fraction,
    moonPhase: body.body === Body.Moon ? MoonPhase(date) : undefined,
    ringTilt: illumination.ring_tilt,
  }
}

const PRINCIPAL = ["New Moon", "First quarter", "Full Moon", "Last quarter"]
const BETWEEN = [
  "Waxing crescent",
  "Waxing gibbous",
  "Waning gibbous",
  "Waning crescent",
]

// The principal phases are instants, so only give them ±10° (under a day); the
// rest of the cycle is crescent or gibbous
export const moonPhaseName = (degrees: number): string => {
  const angle = ((degrees % 360) + 360) % 360
  const nearest = Math.round(angle / 90) % 4
  const offset = Math.abs(angle - Math.round(angle / 90) * 90)
  return (
    (offset <= 10 ? PRINCIPAL[nearest] : BETWEEN[Math.floor(angle / 90)]) ??
    "New Moon"
  )
}

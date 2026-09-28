import { readFile } from "node:fs/promises"

import type { Component } from "./equipment.ts"
import { isRecord, num, str } from "./http.ts"

// The JSON sidecar Laminar (the planetary capture app) writes next to each .ser
// video. Only what is worth showing in a post is kept - file names, ids, the
// observer and the site's coordinates stay out.

export interface LaminarCapture {
  target?: string
  firstFrame: Date
  lastFrame: Date
  // Middle of the video - when the planet table is computed for
  midpoint: Date
  frames: number
  cameraModel?: string
  exposureMs?: number
  gain?: number
  format?: string
  // Only set when the ROI is smaller than the sensor
  roi?: { width: number; height: number }
  nativeFocalLengthMm?: number
  effectiveFocalLengthMm?: number
  focalRatio?: number
  // Barlow or reducer in the optical path
  magnifier?: { kind: string; factor: number }
  weather?: {
    temperatureC?: number
    humidityPercent?: number
    cloudPercent?: number
    windKph?: number
  }
}

const record = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {}

const date = (value: unknown): Date | undefined => {
  const text = str(value)
  const parsed = text ? new Date(text) : undefined
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined
}

const size = (
  value: unknown,
  w: string,
  h: string,
): { width: number; height: number } | undefined => {
  const width = num(record(value)[w])
  const height = num(record(value)[h])
  return width !== undefined && height !== undefined
    ? { width, height }
    : undefined
}

export const parseLaminar = (json: unknown): LaminarCapture | undefined => {
  const root = record(json)
  const capture = record(root.capture)
  const camera = record(root.camera)
  const settings = record(root.capture_settings)
  const equipment = record(root.equipment)
  const telescope = record(equipment.telescope)
  const magnifier = record(equipment.magnifier)
  const weather = isRecord(root.weather) ? root.weather : undefined
  const cloud = record(weather?.cloud_cover_percent)

  const firstFrame = date(capture.first_frame_at) ?? date(capture.started_at)
  const lastFrame = date(capture.last_frame_at) ?? date(capture.ended_at)
  if (!firstFrame || !lastFrame) {
    return undefined
  }

  const roi = size(settings.roi, "width", "height")
  const sensor = size(camera, "sensor_width_px", "sensor_height_px")
  const factor = num(magnifier.factor)

  return {
    target: str(capture.target),
    firstFrame,
    lastFrame,
    midpoint:
      date(capture.midpoint_at) ??
      new Date((firstFrame.getTime() + lastFrame.getTime()) / 2),
    frames: num(capture.frames_written) ?? 0,
    cameraModel: str(camera.model),
    exposureMs: num(settings.exposure_ms),
    gain: num(settings.gain),
    format: str(settings.format),
    roi:
      roi && sensor && (roi.width < sensor.width || roi.height < sensor.height)
        ? roi
        : undefined,
    nativeFocalLengthMm: num(telescope.native_focal_length_mm),
    effectiveFocalLengthMm: num(equipment.effective_focal_length_mm),
    focalRatio: num(equipment.focal_ratio),
    magnifier:
      factor !== undefined && factor !== 1
        ? { kind: str(magnifier.kind) ?? "", factor }
        : undefined,
    weather: weather && {
      temperatureC: num(weather.temperature_c),
      humidityPercent: num(weather.humidity_percent),
      cloudPercent: num(cloud.total),
      windKph: num(weather.wind_kph),
    },
  }
}

export const loadLaminar = async (path: string): Promise<LaminarCapture> => {
  const capture = parseLaminar(JSON.parse(await readFile(path, "utf8")))
  if (!capture) {
    throw new Error(`${path} doesn't look like a Laminar capture file`)
  }
  return capture
}

// Laminar's own name for the telescope ("Svbony mk127") rarely matches the registry
// ("SVBONY MAK127"), but the focal length in the details does. Tries the effective
// focal length first, so a reducer entry ("975 mm f/7.7") wins when one is used.
export const matchOptics = (
  capture: LaminarCapture,
  components: Component[],
): Component | undefined => {
  const focal = (c: Component): number | undefined =>
    num(/(\d+(?:\.\d+)?)\s*mm/.exec(c.details ?? "")?.[1])
  const optics = components.filter((c) => c.kind === "optics")
  return [capture.effectiveFocalLengthMm, capture.nativeFocalLengthMm]
    .filter((mm): mm is number => mm !== undefined)
    .map((mm) => optics.find((c) => focal(c) === Math.round(mm)))
    .find((c) => c !== undefined)
}

// Matches the model against names, ids and tags: "G3M662C" → touptek-g3m662c
export const matchCamera = (
  capture: LaminarCapture,
  components: Component[],
): Component | undefined => {
  const model = capture.cameraModel?.toLowerCase()
  return model
    ? components.find(
        (c) =>
          c.kind === "camera" &&
          [c.id, c.name, ...c.tags].some((s) =>
            s.toLowerCase().includes(model),
          ),
      )
    : undefined
}

const round = (n: number, digits = 1): string =>
  String(Number(n.toFixed(digits)))

// 87.139 → "87.1 ms", 1500 → "1.5 s"
const exposure = (ms: number): string =>
  ms >= 1000 ? `${round(ms / 1000)} s` : `${round(ms)} ms`

// "gain 100, 87.1 ms, RAW8, ROI 640×480"
const settingsOf = (capture: LaminarCapture): string =>
  [
    capture.gain !== undefined ? `gain ${capture.gain}` : undefined,
    capture.exposureMs !== undefined ? exposure(capture.exposureMs) : undefined,
    capture.format?.toUpperCase(),
    capture.roi ? `ROI ${capture.roi.width}×${capture.roi.height}` : undefined,
  ]
    .filter(Boolean)
    .join(", ")

// One entry per distinct combination - usually just one
export const cameraSettings = (captures: LaminarCapture[]): string =>
  [...new Set(captures.map(settingsOf))].filter(Boolean).join("; ")

// "+ 2× Barlow (3000 mm f/23.6)" - appended to the telescope. Left out when a
// registry entry already describes the reduced/extended system.
export const magnifierNote = (
  captures: LaminarCapture[],
  optics: Component | undefined,
): string | undefined => {
  const withMagnifier = captures.find((c) => c.magnifier)
  const m = withMagnifier?.magnifier
  if (!withMagnifier || !m) {
    return undefined
  }
  const efl = withMagnifier.effectiveFocalLengthMm
  if (efl !== undefined && optics?.details?.includes(`${Math.round(efl)} mm`)) {
    return undefined
  }
  const kind = m.kind.replace(/_/g, " ")
  const label = kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : ""
  const system =
    efl !== undefined
      ? ` (${Math.round(efl)} mm${withMagnifier.focalRatio ? ` f/${round(withMagnifier.focalRatio)}` : ""})`
      : ""
  return `${round(m.factor, 2)}× ${label}`.trim() + system
}

const iso = (d: Date): string => d.toISOString()
const utcDay = (d: Date): string => iso(d).slice(0, 10)
const utcTime = (d: Date): string => iso(d).slice(11, 16)

// Planetary images are timed in UTC (WinJUPOS etc.):
// "2026-09-26 21:42 UTC", "2026-09-26 21:42–22:10 UTC"
export const sessionTimes = (captures: LaminarCapture[]): string => {
  const days = new Map<string, LaminarCapture[]>()
  for (const c of [...captures].sort(
    (a, b) => a.firstFrame.getTime() - b.firstFrame.getTime(),
  )) {
    const day = utcDay(c.firstFrame)
    days.set(day, [...(days.get(day) ?? []), c])
  }
  return [...days.entries()]
    .map(([day, list]) => {
      const start = utcTime(list[0]?.firstFrame ?? new Date(0))
      const end = utcTime(list.at(-1)?.lastFrame ?? new Date(0))
      return `${day} ${start === end ? start : `${start}–${end}`} UTC`
    })
    .join(", ")
}

// Local calendar dates, like the ones typed in by hand
export const captureDates = (captures: LaminarCapture[]): string[] => {
  const local = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  return [...new Set(captures.map((c) => local(c.firstFrame)))].sort()
}

export const captureMinutes = (captures: LaminarCapture[]): number =>
  captures.reduce(
    (sum, c) => sum + (c.lastFrame.getTime() - c.firstFrame.getTime()) / 60000,
    0,
  )

// "344", "1,032 in 3 videos"
export const framesSummary = (captures: LaminarCapture[]): string => {
  const total = captures
    .reduce((sum, c) => sum + c.frames, 0)
    .toLocaleString("en-GB")
  return captures.length > 1 ? `${total} in ${captures.length} videos` : total
}

// "10 °C, 77 % humidity, 58 % cloud, wind 5 km/h" - from the first capture that
// has weather. Offered as a default, since a forecast's cloud cover can be wrong
// for the patch of sky actually imaged.
export const conditions = (captures: LaminarCapture[]): string => {
  const w = captures.find((c) => c.weather)?.weather
  if (!w) {
    return ""
  }
  return [
    w.temperatureC !== undefined
      ? `${Math.round(w.temperatureC)} °C`
      : undefined,
    w.humidityPercent !== undefined
      ? `${Math.round(w.humidityPercent)} % humidity`
      : undefined,
    w.cloudPercent !== undefined
      ? `${Math.round(w.cloudPercent)} % cloud`
      : undefined,
    w.windKph !== undefined ? `wind ${Math.round(w.windKph)} km/h` : undefined,
  ]
    .filter(Boolean)
    .join(", ")
}

// The capture closest to the target: one named after it, else the first
export const captureFor = (
  name: string,
  captures: LaminarCapture[],
): LaminarCapture | undefined =>
  captures.find((c) => c.target?.toLowerCase() === name.toLowerCase()) ??
  captures[0]

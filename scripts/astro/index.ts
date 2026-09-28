import { existsSync } from "node:fs"
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises"
import { dirname, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { parseCatalogId, type CatalogId } from "./catalogs.ts"
import {
  type Component,
  describe,
  type Kind,
  loadEquipment,
  loadLastSetup,
  saveEquipment,
  saveLastSetup,
  type Setup,
} from "./equipment.ts"
import {
  formatDuration,
  parseDuration,
  postDate,
  safeTag,
  toSlug,
} from "./format.ts"
import {
  cameraSettings,
  captureDates,
  captureFor,
  captureMinutes,
  conditions,
  framesSummary,
  type LaminarCapture,
  loadLaminar,
  magnifierNote,
  matchCamera,
  matchOptics,
  sessionTimes,
} from "./laminar.ts"
import { lookupTarget, type Target } from "./lookup.ts"
import {
  ask,
  askValid,
  cleanPath,
  close,
  confirm,
  menu,
  type MenuItem,
  say,
} from "./prompt.ts"
import {
  buildIntro,
  displayNames,
  pickTitle,
  type IntegrationLine,
  type PhotoDetails,
  postTags,
  renderPost,
  targetTable,
} from "./render.ts"
import { ephemeris } from "./solar.ts"
import { existingTagSlugs } from "./tags.ts"
import { leadSentences } from "./wikipedia.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const CONTENT_DIR = join(root, "content")
const IMAGE_DIR = join(root, "public", "images", "posts")
const LARGE_IMAGE_BYTES = 10 * 1024 * 1024

interface Flags {
  target?: string
  image?: string
  // Laminar capture sidecars - repeat the flag for several videos
  laminar: string[]
  dryRun: boolean
}

const parseFlags = (argv: string[]): Flags => {
  const flags: Flags = { dryRun: false, laminar: [] }
  const words: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? ""
    const [name, inline] = arg.split(/=(.*)/s)
    const value = () => inline ?? argv[++i]
    if (name === "--target" || name === "-t") flags.target = value()
    else if (name === "--image") flags.image = value()
    else if (name === "--laminar") flags.laminar.push(value() ?? "")
    else if (name === "--dry-run" || name === "-n") flags.dryRun = true
    else if (!arg.startsWith("-")) words.push(arg)
  }
  // `post --astro "M 81"` - bare words are the target
  flags.target ??= words.length > 0 ? words.join(" ") : undefined
  return flags
}

const showTarget = (target: Target): void => {
  say()
  say(targetTable(target))
  if (target.wiki) {
    say(`Wikipedia: ${target.wiki.title} - ${target.wiki.url}`)
  }
  target.warnings.forEach((w) => say(`  ! ${w}`))
  say()
}

// Lets the Names row be corrected: catalog ids become tags, anything else is
// treated as a common name
const editNames = async (target: Target): Promise<Target> => {
  const current = displayNames(target).join(", ")
  const answer = await ask("Names (edit, or Enter to accept)", current)
  if (answer === current) {
    return target
  }
  const entries = answer
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const names = entries
    .map((e) => parseCatalogId(e))
    .filter((id): id is CatalogId => id !== undefined)
  const commonNames = entries.filter((e) => parseCatalogId(e) === undefined)
  return { ...target, names, commonNames, aliases: commonNames.slice(1) }
}

const chooseTarget = async (initial: string): Promise<Target> => {
  let query = initial
  for (;;) {
    say(`Looking up ${query} ...`)
    const target = await lookupTarget(query)
    showTarget(target)
    if (await confirm("Is this the right object?")) {
      return editNames(target)
    }
    query = await ask("Try another name or catalog id")
  }
}

const chooseDescription = async (target: Target): Promise<string> => {
  if (!target.wiki) {
    return ask("Description (no Wikipedia article found)")
  }
  say(`Wikipedia lead:\n\n${target.wiki.extract}\n`)
  const count = await askValid(
    "Sentences to use (0 for none)",
    (a) => (/^\d+$/.test(a) ? Number(a) : undefined),
    "2",
  )
  return count > 0 ? leadSentences(target.wiki.extract, count) : ""
}

// Equipment added during this run
const added: Component[] = []

const addComponent = async (
  kind: Kind,
  components: Component[],
): Promise<Component> => {
  const name = await askValid("Name", (a) => a || undefined)
  const maker = await ask("Manufacturer")
  const details = await ask(
    kind === "optics"
      ? "Focal length / ratio (e.g. 250 mm f/5)"
      : "Details (optional)",
  )
  const suggested =
    kind === "optics"
      ? [toSlug(name).replace(/-/g, " "), maker.toLowerCase()]
      : []
  const tags = (
    await ask("Tags (comma-separated)", suggested.filter(Boolean).join(", "))
  )
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  const integrated =
    kind === "optics" &&
    (await confirm("Smart scope (camera and mount built in)?", false))

  const component: Component = {
    id: toSlug(name),
    kind,
    name,
    maker,
    details: details || undefined,
    tags,
    integrated: integrated || undefined,
  }
  // Saved with the post, so a dry run leaves the registry untouched
  components.push(component)
  added.push(component)
  return component
}

type Choice = Component | "none" | "new"

const chooseComponent = async (
  kind: Kind,
  components: Component[],
  lastId: string | undefined,
): Promise<Component | undefined> => {
  const options = components.filter((c) => c.kind === kind)
  const items: MenuItem<Choice>[] = [
    ...options.map((c) => ({ label: describe(c), value: c })),
    ...(kind === "optics" ? [] : [{ label: "none", value: "none" as const }]),
    { label: "add new ...", value: "new" },
  ]
  const lastIndex = options.findIndex((c) => c.id === lastId)
  const fallback =
    lastIndex >= 0 ? lastIndex : kind === "optics" ? 0 : options.length
  const choice = await menu(
    `\n${kind[0]?.toUpperCase()}${kind.slice(1)}:`,
    items,
    fallback,
  )

  if (choice === "none") {
    return undefined
  }
  return choice === "new" ? addComponent(kind, components) : choice
}

// A Laminar capture names the camera exactly, so a registry match skips the
// question. The telescope is only matched by focal length, so it is preselected
// but still asked.
const chooseSetup = async (captures: LaminarCapture[]): Promise<Setup> => {
  const components = await loadEquipment()
  const last = await loadLastSetup()
  const [capture] = captures
  const knownOptics = capture ? matchOptics(capture, components) : undefined
  const knownCamera = capture ? matchCamera(capture, components) : undefined

  const optics = await chooseComponent(
    "optics",
    components,
    knownOptics?.id ?? last.optics,
  )
  if (!optics || optics.integrated) {
    return { optics }
  }
  if (knownCamera) {
    say(`\nCamera: ${describe(knownCamera)} (from Laminar)`)
  }
  return {
    optics,
    camera:
      knownCamera ?? (await chooseComponent("camera", components, last.camera)),
    mount: await chooseComponent("mount", components, last.mount),
    control: await chooseComponent("control", components, last.control),
  }
}

const parseDates = (answer: string): string[] | undefined => {
  const dates = answer.split(/[\s,]+/).filter(Boolean)
  const valid = dates.every(
    (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)),
  )
  return valid ? [...new Set(dates)].sort() : undefined
}

const parseIntegration = (answer: string): IntegrationLine | undefined => {
  const match = /^(.*?)\s*((?:\d+(?:\.\d+)?\s*[hms]\s*)+)$/i.exec(answer)
  const minutes = match?.[2] ? parseDuration(match[2]) : undefined
  return match && minutes
    ? { label: (match[1] ?? "").trim(), minutes }
    : undefined
}

const askIntegration = async (): Promise<IntegrationLine[]> => {
  say(
    "\nIntegration - one line per filter/mode, e.g. 'UV/IR cut 3h55m' or 'LP (Hα/OIII) 4h26m'.",
  )
  say("Just a duration is fine for a single filter. Blank line to finish.")
  const lines: IntegrationLine[] = []
  for (;;) {
    const answer = await ask(`  Integration ${lines.length + 1}`)
    if (answer === "") {
      return lines
    }
    const line = parseIntegration(answer)
    if (line) {
      lines.push(line)
      const total = lines.reduce((sum, l) => sum + l.minutes, 0)
      say(`    total so far: ${formatDuration(total)}`)
    } else {
      say("    Couldn't find a duration at the end - try e.g. '3h55m' or '90m'")
    }
  }
}

// Dates, duration, frames and camera settings from Laminar - nothing to ask
const laminarDetails = (captures: LaminarCapture[]) => {
  const details = {
    cameraSettings: cameraSettings(captures) || undefined,
    dates: captureDates(captures),
    times: sessionTimes(captures),
    integration: [{ label: "", minutes: captureMinutes(captures) }],
    frames: framesSummary(captures),
  }
  say(`\nFrom Laminar: ${details.times}, ${details.frames} frames`)
  if (details.cameraSettings) {
    say(`  camera settings: ${details.cameraSettings}`)
  }
  return details
}

const askCaptureDetails = async (hasCamera: boolean) => {
  const settings = hasCamera
    ? await ask("Camera settings (e.g. ISO 400, gain 100 -10 °C)")
    : undefined
  const dates = await askValid(
    "\nCapture dates (YYYY-MM-DD, comma-separated)",
    parseDates,
    "",
    "Use YYYY-MM-DD, separated by commas",
  )
  return {
    cameraSettings: settings || undefined,
    dates,
    integration: await askIntegration(),
  }
}

const askPhotoDetails = async (
  captures: LaminarCapture[],
): Promise<PhotoDetails> => {
  const setup = await chooseSetup(captures)
  const capture =
    captures.length > 0
      ? laminarDetails(captures)
      : await askCaptureDetails(setup.camera !== undefined)
  const weather = conditions(captures)
  return {
    setup,
    ...capture,
    magnifier: magnifierNote(captures, setup.optics),
    conditions:
      captures.length > 0
        ? (await ask("Conditions (optional)", weather)) || undefined
        : undefined,
    calibration: (await ask("Calibration frames (optional)")) || undefined,
    processing:
      (await ask("Processing (optional, e.g. PixInsight, HOO palette)")) ||
      undefined,
    notes: (await ask("Notes (optional)")) || undefined,
  }
}

// Sun, Moon and planets move: fill in where they were on the first capture date.
// The Moon moves its own width every hour, so the time is worth asking for.
// Without a Laminar file, the time has to be asked for
const askCaptureTime = async (
  targets: Target[],
  day: string,
): Promise<Date> => {
  const daytime = targets.every((t) => t.solar?.name === "Sun")
  const time = await askValid(
    `\nCapture time on ${day} (HH:mm, local)`,
    (a) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(a) ? a : undefined),
    daytime ? "12:00" : "22:00",
    "Use HH:mm, e.g. 22:30",
  )
  return new Date(`${day}T${time}`)
}

const addEphemerides = async (
  targets: Target[],
  photo: PhotoDetails,
  captures: LaminarCapture[],
): Promise<Target[]> => {
  const [day] = photo.dates
  if (!day || !targets.some((t) => t.solar)) {
    return targets
  }
  // Each target at the middle of its own video, when there is one
  const asked =
    captures.length > 0 ? undefined : await askCaptureTime(targets, day)
  return targets.map((target) => {
    const when =
      asked ??
      (target.solar && captureFor(target.solar.name, captures)?.midpoint)
    if (!target.solar || !when) {
      return target
    }
    const withEphemeris = {
      ...target,
      ephemeris: ephemeris(target.solar, when),
    }
    say(`\n${targetTable(withEphemeris)}`)
    return withEphemeris
  })
}

const imageFileName = (
  target: Target,
  slug: string,
  source: string,
): string => {
  const base = target.names[0]?.short ?? slug
  return `${base.replace(/[^A-Za-z0-9]+/g, "_")}${extname(source).toLowerCase()}`
}

const askImage = async (initial?: string): Promise<string> =>
  askValid(
    "\nImage file (drag it in from Finder)",
    (answer) => {
      const path = cleanPath(answer)
      return path !== "" && existsSync(path) ? path : undefined
    },
    initial ? cleanPath(initial) : "",
    "File not found",
  )

const confirmTags = async (tags: string[]): Promise<string[]> => {
  const existing = await existingTagSlugs(CONTENT_DIR)
  const fresh = tags.filter((t) => !existing.has(safeTag(t)))
  if (fresh.length > 0) {
    say(`\nNew tags not used on any other post: ${fresh.join(", ")}`)
  }
  const answer = await ask("Tags", tags.join(", "))
  return answer
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

// Finder drops several files as one line: "/a/Saturn\\ 1.json '/b/Jupiter 2.json'"
const splitPaths = (line: string): string[] =>
  (line.match(/(?:\\.|'[^']*'|"[^"]*"|[^\s'"\\])+/g) ?? []).map(cleanPath)

const loadCaptures = async (paths: string[]): Promise<LaminarCapture[]> => {
  const captures: LaminarCapture[] = []
  for (const path of paths) {
    captures.push(await loadLaminar(cleanPath(path)))
  }
  return captures
}

const askCaptures = async (): Promise<LaminarCapture[]> =>
  askValid(
    "\nLaminar capture file(s) (optional - drag in, Enter to skip)",
    (answer) => {
      const paths = splitPaths(answer)
      return paths.every((p) => existsSync(p)) ? paths : undefined
    },
    "",
    "File not found",
  ).then(loadCaptures)

const run = async (flags: Flags): Promise<void> => {
  let captures = await loadCaptures(flags.laminar)
  const captured = [
    ...new Set(captures.map((c) => c.target).filter((t) => t !== undefined)),
  ].join(", ")

  const queries = (
    flags.target ??
    (await ask("Target(s) - comma-separated for a multi-target post", captured))
  )
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean)

  const targets: Target[] = []
  for (const query of queries) {
    targets.push(await chooseTarget(query))
  }
  const [primary] = targets
  if (!primary) {
    throw new Error("No target given")
  }
  if (captures.length === 0 && targets.some((t) => t.solar)) {
    captures = await askCaptures()
  }

  const descriptions: string[] = []
  for (const target of targets) {
    descriptions.push(await chooseDescription(target))
  }

  const title = await ask("\nTitle", pickTitle(targets))
  const slug = await ask("Slug", toSlug(title))

  const source = await askImage(flags.image)
  const { size } = await stat(source)
  if (size > LARGE_IMAGE_BYTES) {
    say(
      `  ! ${(size / 1024 / 1024).toFixed(1)} MB - consider exporting a smaller copy`,
    )
  }

  const photo = await askPhotoDetails(captures)
  const located = await addEphemerides(targets, photo, captures)

  const tags = await confirmTags(postTags(located, photo.setup))
  const intro = await ask("\nIntro", buildIntro(located))

  const date = postDate()
  const imageName = imageFileName(primary, slug, source)
  const imageUrl = `/images/posts/${date.path}/${imageName}`

  const markdown = renderPost({
    title,
    date: date.frontmatter,
    tags,
    intro,
    image: imageUrl,
    targets: located,
    descriptions,
    photo,
  })

  const postFile = join(CONTENT_DIR, date.path, `${slug}.md`)
  const imageFile = join(IMAGE_DIR, date.path, imageName)

  if (flags.dryRun) {
    say(`\n--- ${postFile} (dry run) ---\n`)
    say(markdown)
    say(`--- would copy ${source} → ${imageFile}`)
    return
  }

  for (const file of [postFile, imageFile]) {
    if (
      existsSync(file) &&
      !(await confirm(`${file} exists - overwrite?`, false))
    ) {
      say("Stopped - nothing written")
      return
    }
  }

  await mkdir(dirname(postFile), { recursive: true })
  await mkdir(dirname(imageFile), { recursive: true })
  await copyFile(source, imageFile)
  await writeFile(postFile, markdown)
  await saveLastSetup(photo.setup)
  if (added.length > 0) {
    await saveEquipment([...(await loadEquipment()), ...added])
    say(
      `Added to scripts/astro/equipment.json: ${added.map((c) => c.name).join(", ")}`,
    )
  }

  say(`\nCreated: ${postFile}`)
  say(`Copied:  ${imageFile}`)
}

export const main = async (argv: string[]): Promise<void> => {
  try {
    await run(parseFlags(argv))
  } finally {
    close()
  }
}

import { type Component, describe } from "./equipment.ts"
import { parseDuration } from "./format.ts"
import type { IntegrationLine } from "./render.ts"

// Separators typed between filter, note and duration: "1 - 25 × 300s - 2h5m"
const SEPARATORS = /^[\s:,-]+|[\s:,-]+$/g

// "2 × 300s" is a sub count, not filter 2
const isCount = (text: string): boolean => /^\d+\s*[×x]/i.test(text)

// The start of an integration answer, before the duration: "2 25 × 300s",
// "sv220" or "Broadband". Picks out the filter it names, if any, and returns
// the rest as free text.
//   filters - the numbered list shown at the prompt (1-based), already narrowed
//             to the chosen optics
export const matchFilter = (
  text: string,
  filters: Component[],
): { filter?: Component; rest: string } => {
  const lower = text.toLowerCase()
  const after = (prefix: string) =>
    text.slice(prefix.length).replace(SEPARATORS, "")

  // The whole name typed out, as shown or plain: "LP (Hα/OIII) ...", "UV/IR cut ..."
  const spelled = filters
    .flatMap((f) => [describe(f), f.name].map((label) => ({ f, label })))
    .filter(({ label }) => {
      const l = label.toLowerCase()
      return lower === l || lower.startsWith(`${l} `)
    })
    .sort((a, b) => b.label.length - a.label.length)[0]
  if (spelled) {
    return { filter: spelled.f, rest: after(spelled.label) }
  }

  // Otherwise the first word: its number in the list, or the start of exactly
  // one filter's name or id
  const [word = ""] = lower.split(/\s+/)
  const numbered = /^\d+$/.test(word)
  const byNumber =
    numbered && !isCount(text) ? filters[Number(word) - 1] : undefined
  const byName = numbered
    ? []
    : filters.filter((f) =>
        [f.name, f.id].some(
          (n) => word !== "" && n.toLowerCase().startsWith(word),
        ),
      )
  const filter = byNumber ?? (byName.length === 1 ? byName[0] : undefined)
  return filter
    ? { filter, rest: after(word) }
    : { rest: text.replace(SEPARATORS, "") }
}

// "<filter> <note> <duration>". The duration is the run of h/m/s values at the
// end, except one written straight after a × - "20 × 10s 3m20s" is twenty 10s
// subs taking 3m20s.
export const parseIntegration = (
  answer: string,
  filters: Component[],
): IntegrationLine | undefined => {
  const match =
    /^(.*?(?:\s*[×x]\s*\d+(?:\.\d+)?\s*[hms])?)\s*((?:\d+(?:\.\d+)?\s*[hms]\s*)+)$/i.exec(
      answer.trim(),
    )
  const minutes = match?.[2] ? parseDuration(match[2]) : undefined
  if (!match || !minutes) {
    return undefined
  }
  const { filter, rest } = matchFilter(match[1] ?? "", filters)
  return { filter, label: rest, minutes }
}

import { createInterface } from "node:readline"

// Reads lines through one async iterator rather than rl.question(), so answers piped
// in on stdin (e.g. for testing) aren't dropped before the question is asked.
const rl = createInterface({ input: process.stdin, terminal: false })
const lines = rl[Symbol.asyncIterator]()

export const say = (text = ""): void => {
  process.stdout.write(`${text}\n`)
}

export const close = (): void => {
  rl.close()
}

export const ask = async (question: string, fallback = ""): Promise<string> => {
  const hint = fallback ? ` [${fallback}]` : ""
  process.stdout.write(`${question}${hint}: `)
  const next = await lines.next()
  if (next.done) {
    throw new Error("Input closed")
  }
  const answer = next.value.trim()
  if (!process.stdin.isTTY) {
    // Echo piped answers so the transcript reads like an interactive run
    process.stdout.write(`${answer}\n`)
  }
  return answer || fallback
}

export const confirm = async (
  question: string,
  fallback = true,
): Promise<boolean> => {
  const answer = await ask(`${question} (y/n)`, fallback ? "y" : "n")
  return /^y/i.test(answer)
}

// Keeps asking until `parse` accepts the answer
export const askValid = async <T>(
  question: string,
  parse: (answer: string) => T | undefined,
  fallback = "",
  error = "Not recognised - try again",
): Promise<T> => {
  for (;;) {
    const value = parse(await ask(question, fallback))
    if (value !== undefined) {
      return value
    }
    say(`  ${error}`)
  }
}

export interface MenuItem<T> {
  label: string
  value: T
}

export const menu = async <T>(
  question: string,
  items: MenuItem<T>[],
  defaultIndex?: number,
): Promise<T> => {
  say(question)
  items.forEach((item, i) => say(`  ${i + 1}) ${item.label}`))
  const fallback = defaultIndex === undefined ? "" : String(defaultIndex + 1)
  return askValid(
    "Choose",
    (answer) => {
      const n = Number(answer)
      return Number.isInteger(n) ? items[n - 1]?.value : undefined
    },
    fallback,
  )
}

// Finder drag-and-drop gives "/path/My\ Image.png" or '/path/My Image.png'
export const cleanPath = (input: string): string => {
  const unquoted = input.trim().replace(/^(['"])(.*)\1$/, "$2")
  const unescaped = unquoted.replace(/\\(.)/g, "$1")
  return unescaped.startsWith("~/")
    ? `${process.env.HOME ?? ""}${unescaped.slice(1)}`
    : unescaped
}

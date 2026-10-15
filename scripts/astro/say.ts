// Kept apart from prompt.ts, which opens stdin on import: a script that only
// prints (check-targets) would otherwise never exit.
export const say = (text = ""): void => {
  process.stdout.write(`${text}\n`)
}

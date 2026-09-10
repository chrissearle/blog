// Wikimedia asks API clients to identify themselves: https://meta.wikimedia.org/wiki/User-Agent_policy
const USER_AGENT =
  "chrissearle-blog-post-script/1.0 (https://www.chrissearle.org)"

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const getJson = async (
  url: string,
  init: RequestInit = {},
  timeoutMs = 20000,
): Promise<unknown> => {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (res.status === 404) {
    return undefined
  }

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} from ${url}`)
  }

  return res.json()
}

export const str = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined

export const num = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

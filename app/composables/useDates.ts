import { DateTime } from "luxon"

export const useDates = () => {
  const fromFormat = (dateStr: string): DateTime | undefined => {
    if (!dateStr) {
      return undefined
    }

    const formats = ["yyyy-MM-dd HH:mm ZZZ", "yyyy-MM-dd HH:mm:ss ZZZ"]

    for (const format of formats) {
      const dt = DateTime.fromFormat(dateStr, format)
      if (dt.isValid) {
        return dt
      }
    }

    // Log in development for debugging
    if (import.meta.dev) {
      console.warn(`Invalid date format: ${dateStr}`)
    }

    return undefined
  }

  const dateFormat = (dateStr: string | undefined) => {
    if (!dateStr) return "No date"
    return fromFormat(dateStr)?.toFormat("yyyy-MM-dd") ?? "Invalid date"
  }

  return {
    dateFormat,
  }
}

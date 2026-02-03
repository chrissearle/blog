import slugify from "slugify"

export const useStrings = () => {
  const splitList = (items: string | string[] | undefined | null): string[] => {
    let list: string[] = []

    if (Array.isArray(items)) {
      list = items
    } else if (items !== undefined && items !== null) {
      list = items.split(",")
    }

    return list.sort()
  }

  const countSplitList = (
    items: (string | string[] | undefined | null)[],
  ): Map<string, number> =>
    items
      .filter(
        (tags): tags is string | string[] =>
          tags !== undefined && tags !== null,
      )
      .map((tags) => {
        if (Array.isArray(tags)) {
          return tags
        }
        return splitList(tags)
      })
      .flat()
      .reduce(
        (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
        new Map<string, number>(),
      )

  const safeString = (input: string): string => {
    return slugify("" + input, { lower: true })
  }

  return {
    splitList,
    countSplitList,
    safeString,
  }
}

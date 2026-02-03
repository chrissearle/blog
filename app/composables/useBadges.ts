import type { Badge } from "~/types/badge"

export const useBadges = () => {
  const { categoryLink, seriesLink, tagsLink } = useLinks()

  const toArray = (value: string | string[] | undefined): string[] => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }

  const badgesForCategories = (
    categories: string | string[] | undefined,
  ): Badge[] => {
    return toArray(categories).map((category) => ({
      link: categoryLink(category),
      title: category,
      icon: "i-heroicons-tag",
    }))
  }

  const badgesForSeries = (series: string | string[] | undefined): Badge[] => {
    return toArray(series).map((s) => ({
      link: seriesLink(s),
      title: s,
      icon: "i-heroicons-user-group",
    }))
  }

  const badgesForTags = (tags: string | string[] | undefined): Badge[] => {
    return toArray(tags).map((tag) => ({
      link: tagsLink(tag),
      title: tag,
    }))
  }

  return {
    badgesForCategories,
    badgesForSeries,
    badgesForTags,
  }
}

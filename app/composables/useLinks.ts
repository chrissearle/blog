const { safeString } = useStrings()

export const useLinks = () => {
  const pageLink = (pageNo: number) => `/page/${pageNo}/`

  const tagsLink = (tag: string): string => `/tags/${safeString(tag)}/`

  const categoryLink = (category: string): string =>
    `/categories/${safeString(category)}/`

  const seriesLink = (series: string): string =>
    `/series/${safeString(series)}/`

  return {
    pageLink,
    tagsLink,
    categoryLink,
    seriesLink,
  }
}

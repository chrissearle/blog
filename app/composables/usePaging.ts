export const usePaging = () => {
  const maxPostCount = 12

  const pageCount = (count: number) => Math.ceil(count / maxPostCount)

  return {
    maxPostCount,
    pageCount,
  }
}

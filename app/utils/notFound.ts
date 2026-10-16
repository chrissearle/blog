// The 404 for a page that has nothing to show. fatal, because a non-fatal
// createError thrown during client-side navigation is only logged and leaves a
// blank page instead of error.vue. Throwing one (rather than rendering an empty
// list) also keeps unknown URLs from being served as 200s: Google reports
// those as soft 404s, and they'd never reach the [404] log or Umami
export const notFound = () =>
  createError({ statusCode: 404, statusMessage: "Page not found", fatal: true })

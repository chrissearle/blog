// One object imaged in an astrophotography post (frontmatter `targets:`)
export interface PostTarget {
  name: string
  // "Messier 81", "NGC 3031", "Sh2-142", ...
  ids?: string[]
  type?: "galaxy" | "nebula" | "cluster"
  constellation?: string
  // J2000, in degrees
  ra?: number
  dec?: number
}

export interface PostPreview {
  path: string
  title?: string
  date?: string
  tags?: string[]
  category?: string
  intro?: string
  image?: string
  embedImage?: string
  series?: string
  targets?: PostTarget[]
}

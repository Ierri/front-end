export type TechnologyKey =
  | "web"
  | "typescript"
  | "database"
  | "mobile"
  | "react"
  | "design"
  | "interface-design"
  | "cloud"

export type FeedUserData = {
  name: string
  avatar: string
}

export type FeedPostData = {
  id: string
  author: FeedUserData
  content: string
  technologies: TechnologyKey[]
  media: {
    src: string
    alt: string
  }
  score: number
}

export type RecommendedUserData = {
  name: string
  technologies: TechnologyKey[]
}

export type FeedNotificationData = {
  id: string
  title: string
  time: string
  unread: boolean
}

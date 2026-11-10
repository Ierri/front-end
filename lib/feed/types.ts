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
  fictitious?: boolean
}

export type FeedMediaData = {
  id: string
  type: "image" | "video"
  src: string
  alt: string
  poster?: string
}

export type FeedCommentData = {
  id: string
  author: FeedUserData
  technologies: TechnologyKey[]
  content: string
  time: string
  replies: FeedCommentData[]
}

export type FeedPostData = {
  id: string
  author: FeedUserData
  content: string
  technologies: TechnologyKey[]
  media: FeedMediaData[]
  score: number
  comments: FeedCommentData[]
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

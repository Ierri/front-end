import type { ProfileStack } from "@/services/profiles"

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
  id?: string
  username?: string
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
  sizeBytes?: number
}

export type FeedCommentStatus = "publicado" | "excluido" | "oculto"
export type FeedVisibility = "publico" | "seguidores"

export type FeedCommentData = {
  id: string
  author: FeedUserData
  technologies: TechnologyKey[]
  content: string
  time: string
  replies: FeedCommentData[]
  hasReplies?: boolean
  depth?: 0 | 1 | 2
  parentId?: string | null
  rootId?: string | null
  status?: FeedCommentStatus
  editedAt?: string | null
  createdAt?: string
}

export type FeedPostData = {
  stacks?: ProfileStack[]
  id: string
  source?: "demo" | "api"
  author: FeedUserData
  content: string
  visibility?: FeedVisibility
  editedAt?: string | null
  technologies: TechnologyKey[]
  media: FeedMediaData[]
  score: number
  comments: FeedCommentData[]
  commentCount?: number
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

import { cache } from "react"

import { getFeedPostById } from "@/lib/feed/mock-data"
import type { FeedPostData } from "@/lib/feed/types"
import { ApiError } from "@/services/api"
import { publicationsService } from "@/services/publications"

const objectIdPattern = /^[a-f\d]{24}$/i

export const getFeedPost = cache(
  async (postId: string): Promise<FeedPostData | null> => {
    const demoPost = getFeedPostById(postId)
    if (demoPost) return { ...demoPost, source: "demo" }
    if (!objectIdPattern.test(postId)) return null
    try {
      return await publicationsService.findById(postId)
    } catch (error) {
      if (error instanceof ApiError && error.code === "PUBLICACAO_NOT_FOUND") {
        return null
      }
      throw error
    }
  }
)

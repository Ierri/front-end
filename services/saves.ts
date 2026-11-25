import { z } from "zod"

import type { FeedPostData } from "@/lib/feed/types"
import { apiRequest, assertLimit, assertObjectId } from "@/services/api"
import { publicationSchema, toFeedPost } from "@/services/publications"

const saveStateSchema = z.object({
  salvo: z.boolean(),
})

const savedPublicationSchema = publicationSchema.extend({
  salvaEm: z.string(),
})

const savedPublicationsPageSchema = z.object({
  items: z.array(savedPublicationSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type SavedPostData = FeedPostData & {
  savedAt: string
}

export type SavedPostsPageData = {
  items: SavedPostData[]
  nextCursor: string | null
  hasMore: boolean
}

export const savesService = {
  async get(publicationId: string, signal?: AbortSignal): Promise<boolean> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(
      `/publicacoes/${id}/salvar`,
      saveStateSchema,
      { signal }
    )
    return result.data.salvo
  },

  async put(publicationId: string, signal?: AbortSignal): Promise<boolean> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(
      `/publicacoes/${id}/salvar`,
      saveStateSchema,
      {
        method: "PUT",
        signal,
      }
    )
    return result.data.salvo
  },

  async remove(publicationId: string, signal?: AbortSignal): Promise<boolean> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(
      `/publicacoes/${id}/salvar`,
      saveStateSchema,
      {
        method: "DELETE",
        signal,
      }
    )
    return result.data.salvo
  },

  async listSaved({
    limit = 20,
    cursor,
    signal,
  }: {
    limit?: number
    cursor?: string | null
    signal?: AbortSignal
  } = {}): Promise<SavedPostsPageData> {
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (cursor) query.set("cursor", cursor)
    const result = await apiRequest(
      `/usuarios/me/publicacoes-salvas?${query}`,
      savedPublicationsPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map((item) => ({
        ...toFeedPost(item),
        savedAt: item.salvaEm,
      })),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },
}

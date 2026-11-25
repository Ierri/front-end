import { z } from "zod"

import { apiRequest, assertLimit, safeAvatarUrl } from "@/services/api"

const rankedCreatorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  score: z.number(),
})

const rankingPageSchema = z.object({
  items: z.array(rankedCreatorSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type RankedCreatorData = {
  id: string
  name: string
  username: string
  avatar: string
  score: number
}

export type CreatorRankingPageData = {
  items: RankedCreatorData[]
  nextCursor: string | null
  hasMore: boolean
}

export const creatorsService = {
  async ranking({
    limit = 5,
    cursor,
    signal,
  }: {
    limit?: number
    cursor?: string | null
    signal?: AbortSignal
  } = {}): Promise<CreatorRankingPageData> {
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (cursor) query.set("cursor", cursor)
    const result = await apiRequest(
      `/usuarios/ranking?${query}`,
      rankingPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map((creator) => ({
        id: creator.id,
        name: creator.nome,
        username: creator.username,
        avatar: safeAvatarUrl(creator.avatarUrl),
        score: creator.score,
      })),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },
}

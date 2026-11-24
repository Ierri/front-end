import { z } from "zod"

import { apiRequest, assertObjectId } from "@/services/api"

const voteValueSchema = z.union([z.literal(1), z.literal(-1)])

const voteCountersSchema = z.object({
  upvotes: z.number().int().min(0),
  downvotes: z.number().int().min(0),
  score: z.number().int(),
})

const getVoteSchema = z.object({
  valor: voteValueSchema.nullable(),
})

const putVoteSchema = z.object({
  valor: voteValueSchema,
  contadores: voteCountersSchema,
})

const deleteVoteSchema = z.object({
  valor: z.null(),
  contadores: voteCountersSchema,
})

export type VoteValue = 1 | -1
export type UserVote = VoteValue | null
export type VoteCounters = z.infer<typeof voteCountersSchema>

export const votesService = {
  async get(publicationId: string, signal?: AbortSignal): Promise<UserVote> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(`/publicacoes/${id}/voto`, getVoteSchema, {
      signal,
    })
    return result.data.valor
  },

  async put(
    publicationId: string,
    valor: VoteValue,
    signal?: AbortSignal
  ): Promise<{ valor: VoteValue; contadores: VoteCounters }> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(`/publicacoes/${id}/voto`, putVoteSchema, {
      method: "PUT",
      body: { valor },
      signal,
    })
    return result.data
  },

  async remove(
    publicationId: string,
    signal?: AbortSignal
  ): Promise<{ valor: null; contadores: VoteCounters }> {
    const id = assertObjectId(publicationId)
    const result = await apiRequest(
      `/publicacoes/${id}/voto`,
      deleteVoteSchema,
      {
        method: "DELETE",
        signal,
      }
    )
    return result.data
  },
}

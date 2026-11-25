import { stackSchema } from "@/services/profiles"
import { z } from "zod"

import type { FeedPostData, FeedVisibility } from "@/lib/feed/types"
import {
  ApiError,
  apiRequest,
  assertLimit,
  assertObjectId,
  safeAvatarUrl,
} from "@/services/api"

const authorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  biografia: z.string().nullable(),
  avatarUrl: z.string().nullable(),
})

const mediaSchema = z.object({
  id: z.string(),
  tipo: z.enum(["imagem", "video"]),
  url: z.string().url(),
  mimeType: z.string(),
  tamanhoBytes: z.number(),
  largura: z.number().nullable(),
  altura: z.number().nullable(),
  duracaoSegundos: z.number().nullable(),
  textoAlternativo: z.string().nullable(),
  ordem: z.number(),
})

export const publicationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  autor: authorSchema,
  conteudo: z.string(),
  stacks: z.array(stackSchema).optional(),
  midias: z.array(mediaSchema),
  visibilidade: z.enum(["publico", "seguidores"]),
  status: z.string(),
  contadores: z.object({
    upvotes: z.number(),
    downvotes: z.number(),
    score: z.number(),
    comentarios: z.number(),
    salvamentos: z.number(),
  }),
  publicadaEm: z.string().nullable(),
  editadaEm: z.string().nullable(),
  criadaEm: z.string(),
  atualizadaEm: z.string(),
})

const publicationPageSchema = z.object({
  items: z.array(publicationSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

const uploadSchema = z.object({
  referencia: z.string(),
  tipo: z.enum(["imagem", "video"]),
  mimeType: z.string(),
  tamanhoBytes: z.number(),
  largura: z.number().nullable(),
  altura: z.number().nullable(),
  duracaoSegundos: z.number().nullable(),
  expiraEm: z.string(),
})

export type FeedPageData = {
  items: FeedPostData[]
  nextCursor: string | null
  hasMore: boolean
}

export type FeedScope = "seguindo"
export type FeedOrder = "score"

export function toFeedPost(
  publication: z.infer<typeof publicationSchema>
): FeedPostData {
  return {
    id: publication.id,
    source: "api",
    author: {
      id: publication.autor.id,
      username: publication.autor.username,
      name: publication.autor.nome,
      avatar: safeAvatarUrl(publication.autor.avatarUrl),
      fictitious: false,
    },
    content: publication.conteudo,
    visibility: publication.visibilidade,
    editedAt: publication.editadaEm,
    technologies: [],
    stacks: publication.stacks,
    media: [...publication.midias]
      .sort((a, b) => a.ordem - b.ordem)
      .map((media, index) => ({
        id: media.id,
        type: media.tipo === "imagem" ? "image" : "video",
        src: media.url,
        alt:
          media.textoAlternativo ??
          `Mídia ${index + 1} da publicação de ${publication.autor.nome}`,
      })),
    score: publication.contadores.score,
    comments: [],
    commentCount: publication.contadores.comentarios,
  }
}

export const publicationsService = {
  async list({
    limit = 20,
    cursor,
    authorId,
    scope,
    order,
    signal,
  }: {
    limit?: number
    cursor?: string | null
    authorId?: string
    scope?: FeedScope
    order?: FeedOrder
    signal?: AbortSignal
  } = {}): Promise<FeedPageData> {
    if (scope === "seguindo" && authorId) {
      throw new ApiError(
        "autorId não pode ser combinado com escopo=seguindo.",
        "VALIDATION_ERROR"
      )
    }
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (cursor) query.set("cursor", cursor)
    if (authorId) query.set("autorId", assertObjectId(authorId))
    if (scope) query.set("escopo", scope)
    if (order) query.set("ordem", order)
    const result = await apiRequest(
      `/publicacoes?${query}`,
      publicationPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map(toFeedPost),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },

  async findById(id: string): Promise<FeedPostData> {
    const publicationId = assertObjectId(id)
    const result = await apiRequest(
      `/publicacoes/${publicationId}`,
      publicationSchema
    )
    return toFeedPost(result.data)
  },

  async upload(file: File, signal?: AbortSignal) {
    const body = new FormData()
    body.set("arquivo", file)
    return (
      await apiRequest("/publicacoes/midias", uploadSchema, {
        method: "POST",
        body,
        signal,
        timeoutMs: 60_000,
      })
    ).data
  },

  async create({
    content,
    mediaReferences,
    stackIds,
    signal,
  }: {
    content: string
    mediaReferences: string[]
    stackIds?: string[]
    signal?: AbortSignal
  }): Promise<FeedPostData> {
    const result = await apiRequest("/publicacoes", publicationSchema, {
      method: "POST",
      body: {
        conteudo: content,
        visibilidade: "publico",
        midias: mediaReferences,
        ...(stackIds?.length ? { stackIds } : {}),
      },
      timeoutMs: 30_000,
      signal,
    })
    return toFeedPost(result.data)
  },

  async update(
    id: string,
    {
      content,
      visibility,
      signal,
    }: {
      content?: string
      visibility?: FeedVisibility
      signal?: AbortSignal
    }
  ): Promise<FeedPostData> {
    const publicationId = assertObjectId(id)
    const body: { conteudo?: string; visibilidade?: FeedVisibility } = {}
    if (content !== undefined) {
      const trimmed = content.trim()
      if (!trimmed) {
        throw new ApiError(
          "O conteúdo da publicação não pode ficar vazio.",
          "VALIDATION_ERROR"
        )
      }
      body.conteudo = trimmed
    }
    if (visibility !== undefined) {
      body.visibilidade = visibility
    }
    if (!Object.keys(body).length) {
      throw new ApiError("Nenhuma alteração informada.", "VALIDATION_ERROR")
    }
    const result = await apiRequest(
      `/publicacoes/${publicationId}`,
      publicationSchema,
      {
        method: "PATCH",
        body,
        signal,
      }
    )
    return toFeedPost(result.data)
  },

  async remove(id: string, signal?: AbortSignal): Promise<void> {
    const publicationId = assertObjectId(id)
    await apiRequest(`/publicacoes/${publicationId}`, z.null(), {
      method: "DELETE",
      signal,
    })
  },
}

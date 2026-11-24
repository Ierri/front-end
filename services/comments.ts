import { z } from "zod"

import { formatRelativeTime } from "@/lib/feed/format-time"
import type { FeedCommentData } from "@/lib/feed/types"
import {
  ApiError,
  apiRequest,
  assertLimit,
  assertObjectId,
  isAuthApiError,
  safeAvatarUrl,
} from "@/services/api"

export { isAuthApiError }
export const COMMENT_MAX_LENGTH = 2000

const idempotencyKeyPattern = /^[A-Za-z0-9_-]{16,128}$/

const commentAuthorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
})

const commentSchema = z.object({
  id: z.string(),
  publicacaoId: z.string(),
  autor: commentAuthorSchema,
  conteudo: z.string(),
  profundidade: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  comentarioPaiId: z.string().nullable(),
  comentarioRaizId: z.string().nullable(),
  status: z.enum(["publicado", "excluido", "oculto"]),
  editadoEm: z.string().nullable(),
  criadoEm: z.string(),
})

const commentPageSchema = z.object({
  items: z.array(commentSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export type CommentPageData = {
  items: FeedCommentData[]
  nextCursor: string | null
  hasMore: boolean
}

function assertContent(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) {
    throw new ApiError(
      "Escreva um comentário antes de enviar.",
      "VALIDATION_ERROR"
    )
  }
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    throw new ApiError(
      `O comentário deve ter no máximo ${COMMENT_MAX_LENGTH} caracteres.`,
      "VALIDATION_ERROR"
    )
  }
  return trimmed
}

function toFeedComment(
  comment: z.infer<typeof commentSchema>
): FeedCommentData {
  return {
    id: comment.id,
    author: {
      id: comment.autor.id,
      username: comment.autor.username,
      name: comment.autor.nome,
      avatar: safeAvatarUrl(comment.autor.avatarUrl),
      fictitious: false,
    },
    technologies: [],
    content: comment.conteudo,
    time: formatRelativeTime(comment.criadoEm),
    replies: [],
    depth: comment.profundidade,
    parentId: comment.comentarioPaiId,
    rootId: comment.comentarioRaizId,
    status: comment.status,
    editedAt: comment.editadoEm,
    createdAt: comment.criadoEm,
  }
}

export const commentsService = {
  async list(
    publicationId: string,
    {
      limit = 20,
      cursor,
      signal,
    }: {
      limit?: number
      cursor?: string | null
      signal?: AbortSignal
    } = {}
  ): Promise<CommentPageData> {
    const id = assertObjectId(publicationId)
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (cursor) query.set("cursor", cursor)
    const result = await apiRequest(
      `/publicacoes/${id}/comentarios?${query}`,
      commentPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map(toFeedComment),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },

  async replies(
    commentId: string,
    {
      limit = 20,
      cursor,
      signal,
    }: {
      limit?: number
      cursor?: string | null
      signal?: AbortSignal
    } = {}
  ): Promise<CommentPageData> {
    const id = assertObjectId(commentId)
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (cursor) query.set("cursor", cursor)
    const result = await apiRequest(
      `/comentarios/${id}/respostas?${query}`,
      commentPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map(toFeedComment),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },

  async create(
    publicationId: string,
    {
      content,
      parentId,
      idempotencyKey,
      signal,
    }: {
      content: string
      parentId?: string | null
      idempotencyKey?: string
      signal?: AbortSignal
    }
  ): Promise<FeedCommentData> {
    const id = assertObjectId(publicationId)
    const conteudo = assertContent(content)
    const body: { conteudo: string; comentarioPaiId?: string } = { conteudo }
    if (parentId) {
      body.comentarioPaiId = assertObjectId(parentId)
    }
    let headers: Record<string, string> | undefined
    if (idempotencyKey !== undefined) {
      if (!idempotencyKeyPattern.test(idempotencyKey)) {
        throw new ApiError(
          "Chave de idempotência inválida.",
          "VALIDATION_ERROR"
        )
      }
      headers = { "Idempotency-Key": idempotencyKey }
    }
    const result = await apiRequest(
      `/publicacoes/${id}/comentarios`,
      commentSchema,
      {
        method: "POST",
        body,
        headers,
        signal,
      }
    )
    return toFeedComment(result.data)
  },

  async update(
    commentId: string,
    {
      content,
      signal,
    }: {
      content: string
      signal?: AbortSignal
    }
  ): Promise<FeedCommentData> {
    const id = assertObjectId(commentId)
    const conteudo = assertContent(content)
    const result = await apiRequest(`/comentarios/${id}`, commentSchema, {
      method: "PATCH",
      body: { conteudo },
      signal,
    })
    return toFeedComment(result.data)
  },

  async remove(commentId: string, signal?: AbortSignal): Promise<void> {
    const id = assertObjectId(commentId)
    await apiRequest(`/comentarios/${id}`, z.null(), {
      method: "DELETE",
      signal,
    })
  },
}

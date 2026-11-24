import { z } from "zod"

import { formatRelativeTime } from "@/lib/feed/format-time"
import {
  apiRequest,
  assertLimit,
  assertObjectId,
  safeAvatarUrl,
} from "@/services/api"

const notificationTypeSchema = z.enum([
  "follow_requested",
  "user_followed",
  "follow_accepted",
  "post_commented",
  "comment_replied",
  "post_upvoted",
])

const notificationActorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
})

const notificationSchema = z.object({
  id: z.string(),
  tipo: notificationTypeSchema,
  ator: notificationActorSchema,
  publicacaoId: z.string().nullable(),
  comentarioId: z.string().nullable(),
  relacionamentoId: z.string().nullable(),
  criadaEm: z.string(),
  lidaEm: z.string().nullable(),
})

const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

const unreadCountSchema = z.object({
  total: z.number().int().min(0),
})

const markReadSchema = z.object({
  lida: z.boolean(),
})

const markAllReadSchema = z.object({
  lidas: z.boolean(),
})

export type NotificationType = z.infer<typeof notificationTypeSchema>

export type NotificationItemData = {
  id: string
  type: NotificationType
  title: string
  actor: {
    id: string
    name: string
    username: string
    avatar: string
  }
  publicationId: string | null
  commentId: string | null
  createdAt: string
  time: string
  unread: boolean
}

export type NotificationsPageData = {
  items: NotificationItemData[]
  nextCursor: string | null
  hasMore: boolean
}

function formatNotificationTitle(
  type: NotificationType,
  actorName: string
): string {
  switch (type) {
    case "follow_requested":
      return `${actorName} pediu para seguir você.`
    case "user_followed":
      return `${actorName} começou a seguir você.`
    case "follow_accepted":
      return `${actorName} aceitou sua solicitação para seguir.`
    case "post_commented":
      return `${actorName} comentou na sua publicação.`
    case "comment_replied":
      return `${actorName} respondeu ao seu comentário.`
    case "post_upvoted":
      return `${actorName} deu upvote na sua publicação.`
  }
}

function toNotificationItem(
  item: z.infer<typeof notificationSchema>
): NotificationItemData {
  return {
    id: item.id,
    type: item.tipo,
    title: formatNotificationTitle(item.tipo, item.ator.nome),
    actor: {
      id: item.ator.id,
      name: item.ator.nome,
      username: item.ator.username,
      avatar: safeAvatarUrl(item.ator.avatarUrl),
    },
    publicationId: item.publicacaoId,
    commentId: item.comentarioId,
    createdAt: item.criadaEm,
    time: formatRelativeTime(item.criadaEm),
    unread: item.lidaEm === null,
  }
}

export const notificationsService = {
  async list({
    limit = 20,
    unreadOnly = false,
    cursor,
    signal,
  }: {
    limit?: number
    unreadOnly?: boolean
    cursor?: string | null
    signal?: AbortSignal
  } = {}): Promise<NotificationsPageData> {
    const query = new URLSearchParams({ limite: String(assertLimit(limit)) })
    if (unreadOnly) query.set("naoLidas", "true")
    if (cursor) query.set("cursor", cursor)
    const result = await apiRequest(
      `/notificacoes?${query}`,
      notificationPageSchema,
      { signal }
    )
    return {
      items: result.data.items.map(toNotificationItem),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore,
    }
  },

  async unreadCount(signal?: AbortSignal): Promise<number> {
    const result = await apiRequest(
      "/notificacoes/nao-lidas",
      unreadCountSchema,
      { signal }
    )
    return result.data.total
  },

  async markRead(id: string, signal?: AbortSignal): Promise<void> {
    const notificationId = assertObjectId(id)
    await apiRequest(`/notificacoes/${notificationId}/lida`, markReadSchema, {
      method: "PATCH",
      signal,
    })
  },

  async markAllRead(signal?: AbortSignal): Promise<void> {
    await apiRequest("/notificacoes/ler-todas", markAllReadSchema, {
      method: "PATCH",
      signal,
    })
  },
}

import { z } from "zod"

import type { FeedPostData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"
import { ApiError, apiRequest, safeAvatarUrl } from "@/services/api"
import { publicationSchema, toFeedPost } from "@/services/publications"

export const SEARCH_MAX_LENGTH = 80

const cursorPattern = /^[A-Za-z0-9_-]{28,512}$/

export type SearchOrder = "recentes" | "score"

export type NormalizedSearchQuery = {
  query: string
  status: "empty" | "incomplete" | "ready"
}

export type SearchTechnologyData = {
  id: string
  name: string
  slug: string
  category: string | null
  iconUrl: string | null
}

export type SearchUserData = {
  id: string
  name: string
  username: string
  profileHref: string | null
  avatar: string
  bio: string | null
  visibility: "publico" | "privado"
  stacks: SearchTechnologyData[]
  score: number | null
  related: boolean
}

export type SearchUsersPageData = {
  items: SearchUserData[]
  nextCursor: string | null
  hasMore: boolean
}

export type SearchPublicationsPageData = {
  items: FeedPostData[]
  nextCursor: string | null
  hasMore: boolean
}

export type SearchOverviewData = {
  users: SearchUsersPageData
  publications: SearchPublicationsPageData
  technologies: {
    items: SearchTechnologyData[]
    hasMore: boolean
  }
}

const searchTechnologySchema = z.object({
  id: z.string(),
  nome: z.string(),
  slug: z.string(),
  categoria: z.string().nullable(),
  iconeUrl: z.string().nullable(),
})

const searchUserSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
  biografia: z.string().nullable(),
  visibilidadePerfil: z.enum(["publico", "privado"]),
  stacks: z.array(searchTechnologySchema),
  score: z.number().nullable(),
  relacionado: z.boolean(),
})

const searchUsersPageSchema = z.object({
  items: z.array(searchUserSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

const searchPublicationsPageSchema = z.object({
  items: z.array(publicationSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

const searchOverviewSchema = z.object({
  usuarios: searchUsersPageSchema,
  publicacoes: searchPublicationsPageSchema,
  tecnologias: z.object({
    items: z.array(searchTechnologySchema),
    hasMore: z.boolean(),
  }),
})

function stripControlChars(value: string): string {
  let out = ""
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code > 0x1f && code !== 0x7f) {
      out += value[index]
    }
  }
  return out
}

function stripOrphanCombiningMarks(value: string): string {
  return value
    .normalize("NFC")
    .replace(/^\p{M}+/gu, "")
    .replace(/(?<=\s)\p{M}+/gu, "")
}

export function normalizeSearchQuery(raw: string): NormalizedSearchQuery {
  const cleaned = stripControlChars(raw)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, SEARCH_MAX_LENGTH)

  if (!cleaned) {
    return { query: "", status: "empty" }
  }

  const searchable = stripOrphanCombiningMarks(cleaned)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/@/g, " ")
    .trim()

  if (!searchable) {
    return { query: cleaned, status: "incomplete" }
  }

  return { query: cleaned, status: "ready" }
}

function assertSearchLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new ApiError("Limite de busca inválido.", "VALIDATION_ERROR")
  }
  return limit
}

function assertSearchCursor(cursor: string): string {
  const normalized = cursor.trim()
  if (!cursorPattern.test(normalized)) {
    throw new ApiError("Cursor de paginação inválido.", "VALIDATION_ERROR")
  }
  return normalized
}

function assertReadyQuery(raw: string): string {
  const normalized = normalizeSearchQuery(raw)
  if (normalized.status !== "ready") {
    throw new ApiError(
      "Informe ao menos um caractere válido para pesquisar.",
      "VALIDATION_ERROR"
    )
  }
  return normalized.query
}

function toSearchTechnology(
  item: z.infer<typeof searchTechnologySchema>
): SearchTechnologyData {
  const safeIcon = safeAvatarUrl(item.iconeUrl)
  return {
    id: item.id,
    name: item.nome,
    slug: item.slug,
    category: item.categoria,
    iconUrl: safeIcon || null,
  }
}

function toSearchUser(item: z.infer<typeof searchUserSchema>): SearchUserData {
  return {
    id: item.id,
    name: item.nome,
    username: item.username,
    profileHref: profileHref(item.username),
    avatar: safeAvatarUrl(item.avatarUrl),
    bio: item.biografia,
    visibility: item.visibilidadePerfil,
    stacks: item.stacks.map(toSearchTechnology),
    score: item.score,
    related: item.relacionado,
  }
}

export const searchService = {
  async overview({
    query,
    limit = 5,
    order = "recentes",
    credentials,
    signal,
  }: {
    query: string
    limit?: number
    order?: SearchOrder
    credentials?: RequestCredentials
    signal?: AbortSignal
  }): Promise<SearchOverviewData> {
    const params = new URLSearchParams({
      q: assertReadyQuery(query),
      limite: String(assertSearchLimit(limit)),
      ordem: order,
    })
    const result = await apiRequest(`/busca?${params}`, searchOverviewSchema, {
      credentials,
      signal,
    })
    return {
      users: {
        items: result.data.usuarios.items.map(toSearchUser),
        nextCursor: result.data.usuarios.nextCursor,
        hasMore:
          result.data.usuarios.hasMore &&
          Boolean(result.data.usuarios.nextCursor),
      },
      publications: {
        items: result.data.publicacoes.items.map(toFeedPost),
        nextCursor: result.data.publicacoes.nextCursor,
        hasMore:
          result.data.publicacoes.hasMore &&
          Boolean(result.data.publicacoes.nextCursor),
      },
      technologies: {
        items: result.data.tecnologias.items.map(toSearchTechnology),
        hasMore: result.data.tecnologias.hasMore,
      },
    }
  },

  async users({
    query,
    limit = 10,
    cursor,
    credentials,
    signal,
  }: {
    query: string
    limit?: number
    cursor?: string | null
    credentials?: RequestCredentials
    signal?: AbortSignal
  }): Promise<SearchUsersPageData> {
    const params = new URLSearchParams({
      q: assertReadyQuery(query),
      limite: String(assertSearchLimit(limit)),
    })
    if (cursor) params.set("cursor", assertSearchCursor(cursor))
    const result = await apiRequest(
      `/busca/usuarios?${params}`,
      searchUsersPageSchema,
      {
        credentials,
        signal,
      }
    )
    return {
      items: result.data.items.map(toSearchUser),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore && Boolean(result.data.nextCursor),
    }
  },

  async publications({
    query,
    limit = 10,
    order = "recentes",
    cursor,
    credentials,
    signal,
  }: {
    query: string
    limit?: number
    order?: SearchOrder
    cursor?: string | null
    credentials?: RequestCredentials
    signal?: AbortSignal
  }): Promise<SearchPublicationsPageData> {
    const params = new URLSearchParams({
      q: assertReadyQuery(query),
      limite: String(assertSearchLimit(limit)),
      ordem: order,
    })
    if (cursor) params.set("cursor", assertSearchCursor(cursor))
    const result = await apiRequest(
      `/busca/publicacoes?${params}`,
      searchPublicationsPageSchema,
      {
        credentials,
        signal,
      }
    )
    return {
      items: result.data.items.map(toFeedPost),
      nextCursor: result.data.nextCursor,
      hasMore: result.data.hasMore && Boolean(result.data.nextCursor),
    }
  },
}

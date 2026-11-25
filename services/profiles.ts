import { z } from "zod"

import { apiRequest } from "@/services/api"

const stackSchema = z.object({
  id: z.string(),
  nome: z.string(),
  slug: z.string(),
  categoria: z.string().nullable(),
  iconeUrl: z.string().url().nullable(),
})

const countersSchema = z.object({
  seguidores: z.number(),
  seguindo: z.number(),
  publicacoes: z.number(),
  score: z.number(),
})

export const profileSchema = z.object({
  id: z.string(),
  nome: z.string(),
  username: z.string(),
  email: z.string().optional(),
  biografia: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  visibilidadePerfil: z.enum(["publico", "privado"]).optional(),
  stackIds: z.array(z.string()).optional(),
  stacks: z.array(stackSchema).optional(),
  contadores: countersSchema.optional(),
  criadoEm: z.string().nullable().optional(),
  atualizadoEm: z.string().nullable().optional(),
  relacao: z.object({
    enviada: z.enum(["nenhuma", "pendente", "aceita"]),
    recebida: z.enum(["nenhuma", "pendente", "aceita"]),
  }).optional(),
})

export type Profile = z.infer<typeof profileSchema>
export type ProfileStack = z.infer<typeof stackSchema>

const technologyPageSchema = z.object({
  items: z.array(stackSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
})

export const profilesService = {
  async me() {
    return (await apiRequest("/usuarios/me", profileSchema)).data
  },

  async byUsername(username: string) {
    return (await apiRequest(`/usuarios/${encodeURIComponent(username)}`, profileSchema)).data
  },

  async update(values: {
    nome: string
    username: string
    biografia: string | null
    visibilidadePerfil: "publico" | "privado"
  }) {
    return (await apiRequest("/usuarios/me", profileSchema, {
      method: "PATCH",
      body: values,
    })).data
  },

  async replaceStacks(stackIds: string[]) {
    return (await apiRequest("/usuarios/me/stacks", z.object({ stackIds: z.array(z.string()) }), {
      method: "PUT",
      body: { stackIds },
    })).data
  },

  async uploadAvatar(file: File) {
    const body = new FormData()
    body.set("file", file)
    return (await apiRequest("/usuarios/me/avatar", z.object({
      avatarUrl: z.string().url(),
      mimeType: z.string(),
      tamanhoBytes: z.number(),
      largura: z.number(),
      altura: z.number(),
    }), { method: "PUT", body, timeoutMs: 60_000 })).data
  },

  async removeAvatar() {
    return (await apiRequest("/usuarios/me/avatar", z.object({ avatarUrl: z.null() }), {
      method: "DELETE",
    })).data
  },

  async listTechnologies() {
    const items: ProfileStack[] = []
    let cursor: string | null = null
    do {
      const query = new URLSearchParams({ limite: "50" })
      if (cursor) query.set("cursor", cursor)
      const page = (await apiRequest(`/tecnologias?${query}`, technologyPageSchema)).data
      items.push(...page.items)
      cursor = page.nextCursor
    } while (cursor)
    return items
  },
}

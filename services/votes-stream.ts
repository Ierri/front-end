import { z } from "zod"

const defaultApiUrl = "https://hml-api-ierri.eulucas.com.br"
const objectIdPattern = /^[a-f\d]{24}$/i

export const MAX_VOTE_STREAM_IDS = 30

const voteStreamItemSchema = z.object({
  publicationId: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
  score: z.number(),
  revisao: z.number(),
})

const voteStreamSnapshotSchema = z.object({
  items: z.array(voteStreamItemSchema),
})

export type VoteStreamItem = z.infer<typeof voteStreamItemSchema>

export type VoteStreamConnection = {
  close: () => void
}

function normalizeStreamIds(ids: string[]): string[] {
  const unique: string[] = []
  const seen = new Set<string>()
  for (const raw of ids) {
    const normalized = raw.trim().toLowerCase()
    if (!objectIdPattern.test(normalized) || seen.has(normalized)) continue
    seen.add(normalized)
    unique.push(normalized)
    if (unique.length >= MAX_VOTE_STREAM_IDS) break
  }
  return unique
}

function parseJson(raw: unknown): unknown {
  if (typeof raw !== "string" || !raw || raw.length > 65_536) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function connectVotesStream({
  ids,
  onSnapshot,
  onVote,
}: {
  ids: string[]
  onSnapshot: (items: VoteStreamItem[]) => void
  onVote: (item: VoteStreamItem) => void
}): VoteStreamConnection {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return { close: () => undefined }
  }

  const normalizedIds = normalizeStreamIds(ids)
  if (!normalizedIds.length) {
    return { close: () => undefined }
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL?.trim() || defaultApiUrl
  ).replace(/\/$/, "")
  const url = `${baseUrl}/publicacoes/votos/stream?ids=${normalizedIds.join(",")}`

  let closed = false
  let source: EventSource | null = null
  let reconnectTimer: number | null = null
  let retries = 0
  let openedOnce = false
  let triedAnonymousFallback = false

  function clearReconnectTimer() {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function closeCurrentSource() {
    if (source) {
      source.close()
      source = null
    }
  }

  function scheduleReconnect(withCredentials: boolean) {
    if (closed || reconnectTimer !== null) return
    const delay =
      Math.min(1_500 * 2 ** retries, 30_000) + Math.floor(Math.random() * 400)
    retries = Math.min(retries + 1, 6)
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      open(withCredentials)
    }, delay)
  }

  function open(withCredentials: boolean) {
    if (closed) return
    closeCurrentSource()

    let instance: EventSource
    try {
      instance = new EventSource(url, { withCredentials })
    } catch {
      return
    }
    source = instance

    instance.addEventListener("open", () => {
      if (closed || source !== instance) return
      openedOnce = true
      retries = 0
    })

    instance.addEventListener("snapshot", (event: MessageEvent) => {
      if (closed || source !== instance) return
      openedOnce = true
      retries = 0
      const parsed = voteStreamSnapshotSchema.safeParse(parseJson(event.data))
      if (parsed.success) {
        onSnapshot(parsed.data.items)
      }
    })

    instance.addEventListener("vote", (event: MessageEvent) => {
      if (closed || source !== instance) return
      const parsed = voteStreamItemSchema.safeParse(parseJson(event.data))
      if (parsed.success) {
        onVote(parsed.data)
      }
    })

    instance.addEventListener("error", () => {
      if (closed || source !== instance) return
      if (!openedOnce && withCredentials && !triedAnonymousFallback) {
        triedAnonymousFallback = true
        closeCurrentSource()
        open(false)
        return
      }
      if (instance.readyState === EventSource.CLOSED) {
        closeCurrentSource()
        scheduleReconnect(withCredentials)
      }
    })
  }

  open(true)

  return {
    close() {
      closed = true
      clearReconnectTimer()
      closeCurrentSource()
    },
  }
}

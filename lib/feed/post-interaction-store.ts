import { isAuthApiError } from "@/services/api"
import { savesService } from "@/services/saves"
import { votesService, type UserVote } from "@/services/votes"
import {
  MAX_VOTE_STREAM_IDS,
  connectVotesStream,
  type VoteStreamConnection,
  type VoteStreamItem,
} from "@/services/votes-stream"

export type PostInteractionEntry = {
  vote: UserVote
  voteHydrated: boolean
  score: number | undefined
  saved: boolean | null
  saveHydrated: boolean
  voteRevision: number
  saveRevision: number
  serverVoteRevision: number
}

const EMPTY_ENTRY: PostInteractionEntry = Object.freeze({
  vote: null,
  voteHydrated: false,
  score: undefined,
  saved: null,
  saveHydrated: false,
  voteRevision: 0,
  saveRevision: 0,
  serverVoteRevision: 0,
})

const MAX_CONCURRENT_HYDRATIONS = 4
const STREAM_SYNC_DEBOUNCE_MS = 250
const objectIdPattern = /^[a-f\d]{24}$/i

type Listener = () => void
type HydrationTask = {
  key: string
  userId: string
  run: (signal: AbortSignal) => Promise<void>
}

let activeUserId: string | null = null
const entries = new Map<string, PostInteractionEntry>()
const listeners = new Set<Listener>()
const inFlightKeys = new Set<string>()
const inFlightVoteMutations = new Map<string, number>()
const inFlightSaveMutations = new Set<string>()
const activeControllers = new Set<AbortController>()
const hydrationQueue: HydrationTask[] = []
let activeHydrations = 0

const realtimeRefCounts = new Map<string, number>()
const canonicalToRawPostId = new Map<string, string>()
let activeStream: VoteStreamConnection | null = null
let activeStreamSignature = ""
let streamSyncTimer: number | null = null
let visibilityListenerAttached = false

function emit() {
  listeners.forEach((listener) => listener())
}

function getEntry(postId: string): PostInteractionEntry {
  return entries.get(postId) ?? EMPTY_ENTRY
}

function setEntry(postId: string, next: PostInteractionEntry) {
  entries.set(postId, next)
  emit()
}

function incrementVoteInFlight(postId: string) {
  inFlightVoteMutations.set(
    postId,
    (inFlightVoteMutations.get(postId) ?? 0) + 1
  )
}

function decrementVoteInFlight(postId: string) {
  const current = inFlightVoteMutations.get(postId) ?? 0
  if (current <= 1) {
    inFlightVoteMutations.delete(postId)
  } else {
    inFlightVoteMutations.set(postId, current - 1)
  }
}

function closeActiveStream() {
  if (activeStream) {
    activeStream.close()
    activeStream = null
  }
  activeStreamSignature = ""
}

function applyRealtimeItems(items: VoteStreamItem[]) {
  if (!items.length) return
  let changed = false

  for (const item of items) {
    const canonical = item.publicationId.trim().toLowerCase()
    const postId = canonicalToRawPostId.get(canonical) ?? canonical
    const current = getEntry(postId)

    if (item.revisao < current.serverVoteRevision) {
      continue
    }

    if ((inFlightVoteMutations.get(postId) ?? 0) > 0) {
      if (item.revisao > current.serverVoteRevision) {
        entries.set(postId, {
          ...current,
          serverVoteRevision: item.revisao,
        })
      }
      continue
    }

    if (
      current.score !== item.score ||
      current.serverVoteRevision !== item.revisao
    ) {
      const scoreChanged = current.score !== item.score
      entries.set(postId, {
        ...current,
        score: item.score,
        serverVoteRevision: item.revisao,
      })
      if (scoreChanged) {
        changed = true
      }
    }
  }

  if (changed) {
    emit()
  }
}

function syncStreamNow() {
  if (typeof window === "undefined") return
  if (streamSyncTimer !== null) {
    window.clearTimeout(streamSyncTimer)
    streamSyncTimer = null
  }

  if (
    typeof document !== "undefined" &&
    document.visibilityState === "hidden"
  ) {
    closeActiveStream()
    return
  }

  const allKeys = [...realtimeRefCounts.keys()]
  const selectedIds = allKeys
    .slice(Math.max(0, allKeys.length - MAX_VOTE_STREAM_IDS))
    .sort()

  if (!selectedIds.length) {
    closeActiveStream()
    return
  }

  const nextSignature = `${activeUserId ?? "anon"}:${selectedIds.join(",")}`
  if (activeStream && nextSignature === activeStreamSignature) {
    return
  }

  closeActiveStream()
  activeStreamSignature = nextSignature
  activeStream = connectVotesStream({
    ids: selectedIds,
    onSnapshot: applyRealtimeItems,
    onVote: (item) => applyRealtimeItems([item]),
  })
}

function scheduleStreamSync(immediate = false) {
  if (typeof window === "undefined") return
  if (immediate) {
    syncStreamNow()
    return
  }
  if (streamSyncTimer !== null) {
    window.clearTimeout(streamSyncTimer)
  }
  streamSyncTimer = window.setTimeout(() => {
    streamSyncTimer = null
    syncStreamNow()
  }, STREAM_SYNC_DEBOUNCE_MS)
}

function ensureVisibilityListener() {
  if (
    visibilityListenerAttached ||
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    return
  }
  visibilityListenerAttached = true
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      closeActiveStream()
    } else if (realtimeRefCounts.size > 0) {
      scheduleStreamSync(true)
    }
  })
}

export function retainPostRealtime(postId: string) {
  const raw = postId.trim()
  const canonical = raw.toLowerCase()
  if (!objectIdPattern.test(canonical)) return
  ensureVisibilityListener()
  canonicalToRawPostId.set(canonical, raw)

  const existing = realtimeRefCounts.get(canonical) ?? 0
  if (existing > 0) {
    realtimeRefCounts.delete(canonical)
  }
  realtimeRefCounts.set(canonical, existing + 1)
  scheduleStreamSync()
}

export function releasePostRealtime(postId: string) {
  const canonical = postId.trim().toLowerCase()
  const existing = realtimeRefCounts.get(canonical) ?? 0
  if (existing <= 0) return
  if (existing === 1) {
    realtimeRefCounts.delete(canonical)
  } else {
    realtimeRefCounts.set(canonical, existing - 1)
  }
  scheduleStreamSync()
}

function drainQueue() {
  while (
    activeHydrations < MAX_CONCURRENT_HYDRATIONS &&
    hydrationQueue.length > 0
  ) {
    const task = hydrationQueue.shift()!
    if (task.userId !== activeUserId) {
      inFlightKeys.delete(task.key)
      continue
    }
    activeHydrations += 1
    const controller = new AbortController()
    activeControllers.add(controller)
    void task.run(controller.signal).finally(() => {
      activeControllers.delete(controller)
      inFlightKeys.delete(task.key)
      activeHydrations -= 1
      drainQueue()
    })
  }
}

function enqueueHydration(task: HydrationTask) {
  if (inFlightKeys.has(task.key)) return
  inFlightKeys.add(task.key)
  hydrationQueue.push(task)
  drainQueue()
}

export function subscribePostInteractions(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getPostInteractionSnapshot(
  postId: string
): PostInteractionEntry {
  return getEntry(postId)
}

export function getEmptyPostInteractionSnapshot(): PostInteractionEntry {
  return EMPTY_ENTRY
}

export function syncPostInteractionUser(userId: string | null) {
  if (userId === activeUserId) return
  activeUserId = userId
  activeControllers.forEach((controller) => controller.abort())
  activeControllers.clear()
  hydrationQueue.length = 0
  inFlightKeys.clear()
  inFlightVoteMutations.clear()
  inFlightSaveMutations.clear()
  if (entries.size > 0) {
    entries.clear()
    emit()
  }
  if (realtimeRefCounts.size > 0) {
    scheduleStreamSync(true)
  } else {
    closeActiveStream()
  }
}

export function seedSavedPostInteractions(userId: string, postIds: string[]) {
  if (!userId || !postIds.length) return
  syncPostInteractionUser(userId)
  let changed = false
  for (const postId of postIds) {
    if (inFlightSaveMutations.has(postId)) continue
    const current = getEntry(postId)
    if (current.saved !== true || !current.saveHydrated) {
      entries.set(postId, {
        ...current,
        saved: true,
        saveHydrated: true,
        saveRevision: current.saveRevision + 1,
      })
      changed = true
    }
  }
  if (changed) emit()
}

export function hydratePostInteractions(
  userId: string,
  postId: string,
  onAuthError?: () => void
) {
  if (!userId) return
  syncPostInteractionUser(userId)
  const current = getEntry(postId)

  if (!current.voteHydrated) {
    const voteKey = `vote:${userId}:${postId}`
    enqueueHydration({
      key: voteKey,
      userId,
      async run(signal) {
        const snapshot = getEntry(postId)
        if (snapshot.voteHydrated) return
        const expectedRevision = snapshot.voteRevision
        try {
          const vote = await votesService.get(postId, signal)
          if (signal.aborted || activeUserId !== userId) return
          const latest = getEntry(postId)
          if (latest.voteRevision !== expectedRevision) return
          setEntry(postId, {
            ...latest,
            vote,
            voteHydrated: true,
          })
        } catch (caught) {
          if (signal.aborted || activeUserId !== userId) return
          if (isAuthApiError(caught)) {
            onAuthError?.()
          }
        }
      },
    })
  }

  if (!current.saveHydrated) {
    const saveKey = `save:${userId}:${postId}`
    enqueueHydration({
      key: saveKey,
      userId,
      async run(signal) {
        const snapshot = getEntry(postId)
        if (snapshot.saveHydrated) return
        const expectedRevision = snapshot.saveRevision
        try {
          const saved = await savesService.get(postId, signal)
          if (signal.aborted || activeUserId !== userId) return
          const latest = getEntry(postId)
          if (latest.saveRevision !== expectedRevision) return
          setEntry(postId, {
            ...latest,
            saved,
            saveHydrated: true,
          })
        } catch (caught) {
          if (signal.aborted || activeUserId !== userId) return
          if (isAuthApiError(caught)) {
            onAuthError?.()
          }
        }
      },
    })
  }
}

export function beginVoteMutation(
  userId: string,
  postId: string,
  nextVote: UserVote,
  nextScore: number
) {
  syncPostInteractionUser(userId)
  incrementVoteInFlight(postId)
  const previous = getEntry(postId)
  const revision = previous.voteRevision + 1
  setEntry(postId, {
    ...previous,
    vote: nextVote,
    score: nextScore,
    voteHydrated: true,
    voteRevision: revision,
  })
  return { previous, revision }
}

export function commitVoteMutation(
  userId: string,
  postId: string,
  revision: number,
  vote: UserVote,
  score: number
) {
  if (activeUserId !== userId) return
  decrementVoteInFlight(postId)
  const latest = getEntry(postId)
  if (latest.voteRevision !== revision) return
  setEntry(postId, {
    ...latest,
    vote,
    score,
    voteHydrated: true,
  })
}

export function rollbackVoteMutation(
  userId: string,
  postId: string,
  revision: number,
  previous: PostInteractionEntry
) {
  if (activeUserId !== userId) return
  decrementVoteInFlight(postId)
  const latest = getEntry(postId)
  if (latest.voteRevision !== revision) return
  setEntry(postId, {
    ...latest,
    vote: previous.vote,
    score: previous.score,
    voteHydrated: previous.voteHydrated,
  })
}

export function beginSaveMutation(
  userId: string,
  postId: string,
  nextSaved: boolean
) {
  syncPostInteractionUser(userId)
  inFlightSaveMutations.add(postId)
  const previous = getEntry(postId)
  const revision = previous.saveRevision + 1
  setEntry(postId, {
    ...previous,
    saved: nextSaved,
    saveHydrated: true,
    saveRevision: revision,
  })
  return { previous, revision }
}

export function commitSaveMutation(
  userId: string,
  postId: string,
  revision: number,
  saved: boolean
) {
  if (activeUserId !== userId) return
  const latest = getEntry(postId)
  if (latest.saveRevision !== revision) return
  inFlightSaveMutations.delete(postId)
  setEntry(postId, {
    ...latest,
    saved,
    saveHydrated: true,
  })
}

export function rollbackSaveMutation(
  userId: string,
  postId: string,
  revision: number,
  previous: PostInteractionEntry
) {
  if (activeUserId !== userId) return
  const latest = getEntry(postId)
  if (latest.saveRevision !== revision) return
  inFlightSaveMutations.delete(postId)
  setEntry(postId, {
    ...latest,
    saved: previous.saved,
    saveHydrated: previous.saveHydrated,
  })
}

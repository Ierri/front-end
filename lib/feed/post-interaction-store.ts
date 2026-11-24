import { isAuthApiError } from "@/services/api"
import { savesService } from "@/services/saves"
import { votesService, type UserVote } from "@/services/votes"

export type PostInteractionEntry = {
  vote: UserVote
  voteHydrated: boolean
  score: number | undefined
  saved: boolean | null
  saveHydrated: boolean
  voteRevision: number
  saveRevision: number
}

const EMPTY_ENTRY: PostInteractionEntry = Object.freeze({
  vote: null,
  voteHydrated: false,
  score: undefined,
  saved: null,
  saveHydrated: false,
  voteRevision: 0,
  saveRevision: 0,
})

const MAX_CONCURRENT_HYDRATIONS = 4

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
const activeControllers = new Set<AbortController>()
const hydrationQueue: HydrationTask[] = []
let activeHydrations = 0

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
  if (entries.size > 0) {
    entries.clear()
    emit()
  }
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
        const expectedRevision = getEntry(postId).voteRevision
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
        const expectedRevision = getEntry(postId).saveRevision
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
  setEntry(postId, {
    ...latest,
    saved: previous.saved,
    saveHydrated: previous.saveHydrated,
  })
}

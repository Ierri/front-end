"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ArrowBigDown, ArrowBigUp, Bookmark } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import {
  beginSaveMutation,
  beginVoteMutation,
  commitSaveMutation,
  commitVoteMutation,
  getEmptyPostInteractionSnapshot,
  getPostInteractionSnapshot,
  hydratePostInteractions,
  rollbackSaveMutation,
  rollbackVoteMutation,
  subscribePostInteractions,
  syncPostInteractionUser,
} from "@/lib/feed/post-interaction-store"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import { savesService } from "@/services/saves"
import { votesService, type UserVote, type VoteValue } from "@/services/votes"

type PostActionsProps = {
  postId: string
  score: number
  authorName: string
  source?: "demo" | "api"
  eager?: boolean
  className?: string
}

export function PostActions({
  postId,
  score,
  authorName,
  source,
  eager = false,
  className,
}: PostActionsProps) {
  const { status, user, refreshSession, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"
  const userId = isAuthenticated ? (user?.id ?? null) : null
  const isApiPost = source === "api"

  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const votePendingRef = useRef(false)
  const savePendingRef = useRef(false)
  const pendingAuthPromptRef = useRef(false)

  const [isVoting, setIsVoting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [demoVote, setDemoVote] = useState<UserVote>(null)
  const [demoSaved, setDemoSaved] = useState(false)

  const interaction = useSyncExternalStore(
    subscribePostInteractions,
    () => getPostInteractionSnapshot(postId),
    getEmptyPostInteractionSnapshot
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pendingAuthPromptRef.current = false
    }
  }, [])

  useEffect(() => {
    if (status === "loading") return
    syncPostInteractionUser(userId)
  }, [status, userId])

  useEffect(() => {
    if (pendingAuthPromptRef.current && status === "unauthenticated") {
      pendingAuthPromptRef.current = false
      requireAuth()
    }
  }, [requireAuth, status])

  useEffect(() => {
    if (!isApiPost || !userId) return
    const trigger = () =>
      hydratePostInteractions(userId, postId, () => {
        void refreshSession()
      })
    if (eager) {
      trigger()
      return
    }
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === "undefined") {
      trigger()
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trigger()
          observer.disconnect()
        }
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [eager, isApiPost, postId, refreshSession, userId])

  const myVote: UserVote = isApiPost ? interaction.vote : demoVote
  const displayedScore = isApiPost
    ? (interaction.score ?? score)
    : score + (demoVote ?? 0)
  const isSaved = isApiPost ? interaction.saved === true : demoSaved

  function handleAuthFailure(caught: unknown): string | null {
    if (!isAuthApiError(caught)) return null
    if (mountedRef.current) {
      if (status === "unauthenticated") {
        requireAuth()
      } else {
        pendingAuthPromptRef.current = true
        void refreshSession()
      }
    }
    return "Sua sessão expirou. Entre novamente para continuar."
  }

  async function handleVote(target: VoteValue) {
    if (!isAuthenticated || !userId) {
      requireAuth()
      return
    }
    if (!isApiPost) {
      setDemoVote((current) => (current === target ? null : target))
      return
    }
    if (votePendingRef.current) return
    votePendingRef.current = true
    setIsVoting(true)
    setError("")

    const currentVote = interaction.vote
    const currentScore = interaction.score ?? score
    const nextVote: UserVote = currentVote === target ? null : target
    const optimisticScore =
      currentScore + ((nextVote ?? 0) - (currentVote ?? 0))

    const { previous, revision } = beginVoteMutation(
      userId,
      postId,
      nextVote,
      optimisticScore
    )

    try {
      const result =
        nextVote === null
          ? await votesService.remove(postId)
          : await votesService.put(postId, nextVote)
      commitVoteMutation(
        userId,
        postId,
        revision,
        result.valor,
        result.contadores.score
      )
    } catch (caught) {
      rollbackVoteMutation(userId, postId, revision, previous)
      const authMessage = handleAuthFailure(caught)
      if (mountedRef.current) {
        setError(
          authMessage ??
            (caught instanceof Error
              ? caught.message
              : "Não foi possível registrar seu voto.")
        )
      }
    } finally {
      votePendingRef.current = false
      if (mountedRef.current) {
        setIsVoting(false)
      }
    }
  }

  async function handleToggleSave() {
    if (!isAuthenticated || !userId) {
      requireAuth()
      return
    }
    if (!isApiPost) {
      setDemoSaved((current) => !current)
      return
    }
    if (savePendingRef.current) return
    savePendingRef.current = true
    setIsSaving(true)
    setError("")

    const currentSaved = interaction.saved === true
    const nextSaved = !currentSaved
    const { previous, revision } = beginSaveMutation(userId, postId, nextSaved)

    try {
      const saved = nextSaved
        ? await savesService.put(postId)
        : await savesService.remove(postId)
      commitSaveMutation(userId, postId, revision, saved)
    } catch (caught) {
      rollbackSaveMutation(userId, postId, revision, previous)
      const authMessage = handleAuthFailure(caught)
      if (mountedRef.current) {
        setError(
          authMessage ??
            (caught instanceof Error
              ? caught.message
              : "Não foi possível atualizar os itens salvos.")
        )
      }
    } finally {
      savePendingRef.current = false
      if (mountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  return (
    <div ref={containerRef} className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div
          role="group"
          aria-label={`Votação da publicação de ${authorName}`}
          className="inline-flex items-center rounded-full border border-border"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isVoting}
            aria-pressed={myVote === 1}
            aria-label={myVote === 1 ? "Remover upvote" : "Dar upvote"}
            onClick={() => void handleVote(1)}
            className={cn(
              "rounded-full transition-colors motion-reduce:transition-none",
              myVote === 1 &&
                "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground dark:bg-primary dark:text-background dark:hover:bg-primary/85 dark:hover:text-background"
            )}
          >
            <ArrowBigUp className={cn(myVote === 1 && "fill-current")} />
          </Button>
          <span
            aria-label={`${displayedScore} votos`}
            className={cn(
              "min-w-10 text-center text-sm font-semibold tabular-nums",
              myVote === 1 && "text-accent-foreground dark:text-primary"
            )}
          >
            {displayedScore}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isVoting}
            aria-pressed={myVote === -1}
            aria-label={myVote === -1 ? "Remover downvote" : "Dar downvote"}
            onClick={() => void handleVote(-1)}
            className={cn(
              "rounded-full transition-colors motion-reduce:transition-none",
              myVote === -1 &&
                "bg-foreground text-background hover:bg-foreground/85 hover:text-background"
            )}
          >
            <ArrowBigDown className={cn(myVote === -1 && "fill-current")} />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isSaving}
          aria-pressed={isSaved}
          aria-label={isSaved ? "Remover dos salvos" : "Salvar publicação"}
          onClick={() => void handleToggleSave()}
          className={cn(
            "rounded-full transition-colors motion-reduce:transition-none",
            isSaved &&
              "border-primary/40 bg-accent dark:border-primary text-accent-foreground hover:bg-accent hover:text-accent-foreground dark:bg-primary dark:text-background dark:hover:bg-primary/85 dark:hover:text-background"
          )}
        >
          <Bookmark className={cn(isSaved && "fill-current")} />
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

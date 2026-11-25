"use client"

import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { Bookmark, LoaderCircle, RefreshCw } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedPostCard } from "@/components/feed/feed-post-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/feed/format-time"
import {
  getEmptyPostInteractionSnapshot,
  getPostInteractionSnapshot,
  seedSavedPostInteractions,
  subscribePostInteractions,
} from "@/lib/feed/post-interaction-store"
import { useCursorPagination } from "@/lib/feed/use-cursor-pagination"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import { savesService, type SavedPostData } from "@/services/saves"

function formatSavedLabel(isoDate: string): string {
  const relative = formatRelativeTime(isoDate)
  if (!relative) return ""
  if (relative === "Agora") return "Salvo agora"
  if (/^\d+\s+(min|h|d)$/.test(relative)) return `Salvo há ${relative}`
  return `Salvo em ${relative}`
}

function SavedPostItem({ post }: { post: SavedPostData }) {
  const interaction = useSyncExternalStore(
    subscribePostInteractions,
    () => getPostInteractionSnapshot(post.id),
    getEmptyPostInteractionSnapshot
  )
  const isUnsaved = interaction.saveHydrated && interaction.saved === false
  const savedLabel = formatSavedLabel(post.savedAt)

  return (
    <div className="space-y-2">
      {(savedLabel || isUnsaved) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          {savedLabel ? (
            <span className="text-muted-foreground">{savedLabel}</span>
          ) : (
            <span />
          )}
          {isUnsaved && (
            <span role="status" className="font-medium text-accent-foreground">
              Removido dos salvos · clique no marcador para desfazer
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "transition-opacity motion-reduce:transition-none",
          isUnsaved && "opacity-75"
        )}
      >
        <FeedPostCard post={post} />
      </div>
    </div>
  )
}

function SavedPostsFeedContent({ userId }: { userId: string }) {
  const { refreshSession } = useAuth()

  const fetchPage = useCallback(
    (cursor: string | null, signal: AbortSignal) =>
      savesService.listSaved({ cursor, signal }),
    []
  )

  const handlePageLoaded = useCallback(
    (page: { items: SavedPostData[] }) => {
      seedSavedPostInteractions(
        userId,
        page.items.map((item) => item.id)
      )
    },
    [userId]
  )

  const formatError = useCallback(
    (caught: unknown, isLoadMore: boolean) => {
      if (isAuthApiError(caught)) {
        void refreshSession()
        return "Sua sessão expirou. Entre novamente para ver seus salvos."
      }
      return caught instanceof Error
        ? caught.message
        : isLoadMore
          ? "Não foi possível carregar mais publicações salvas."
          : "Não foi possível carregar suas publicações salvas."
    },
    [refreshSession]
  )

  const {
    items: posts,
    hasMore,
    error,
    isLoading,
    isLoadingMore,
    sentinelRef,
    retry,
  } = useCursorPagination({
    loadOnMount: true,
    fetchPage,
    onPageLoaded: handlePageLoaded,
    formatError,
  })

  return (
    <section
      aria-label="Publicações salvas"
      aria-busy={isLoading || isLoadingMore}
      className="space-y-6"
    >
      {isLoading && !posts.length ? (
        <div
          role="status"
          className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          Carregando publicações salvas…
        </div>
      ) : posts.length ? (
        posts.map((post) => <SavedPostItem key={post.id} post={post} />)
      ) : !error && !isLoadingMore && !hasMore ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Bookmark aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-lg">Você ainda não salvou nenhuma publicação</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Salve interfaces e projetos do feed para montar sua coleção de
            referências.
          </p>
          <Link
            href="/feed"
            className={cn(buttonVariants({ variant: "default" }), "mt-5")}
          >
            Explorar o feed
          </Link>
        </div>
      ) : null}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-border bg-card px-6 py-8 text-center"
        >
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={retry}
          >
            <RefreshCw aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      )}

      <div
        ref={sentinelRef}
        className="flex min-h-10 items-center justify-center"
      >
        {isLoadingMore && (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Carregando mais publicações salvas…
          </p>
        )}
        {!hasMore && !error && !isLoading && posts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Você chegou ao fim das publicações salvas.
          </p>
        )}
      </div>
    </section>
  )
}

export function SavedPostsFeed() {
  const { user } = useAuth()
  if (!user?.id) return null
  return <SavedPostsFeedContent key={user.id} userId={user.id} />
}

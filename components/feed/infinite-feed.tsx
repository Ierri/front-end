"use client"

import { useCallback, useEffect } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"

import { FeedPostCard } from "@/components/feed/feed-post-card"
import { Button } from "@/components/ui/button"
import type { FeedPostData } from "@/lib/feed/types"
import { useCursorPagination } from "@/lib/feed/use-cursor-pagination"
import {
  publicationsService,
  type FeedOrder,
  type FeedPageData,
  type FeedScope,
} from "@/services/publications"

type InfiniteFeedProps = {
  initialPage: FeedPageData
  initialError?: string
  authorId?: string
  scope?: FeedScope
  order?: FeedOrder
  loadOnMount?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onPostsChange?: (posts: FeedPostData[]) => void
}

export function InfiniteFeed({
  initialPage,
  initialError = "",
  authorId,
  scope,
  order,
  loadOnMount = false,
  emptyTitle = "Ainda não há publicações",
  emptyDescription = "Seja a primeira pessoa a compartilhar um projeto por aqui.",
  onPostsChange,
}: InfiniteFeedProps) {
  const fetchPage = useCallback(
    (cursor: string | null, signal: AbortSignal) =>
      publicationsService.list({ cursor, authorId, scope, order, signal }),
    [authorId, order, scope]
  )

  const formatError = useCallback(
    (caught: unknown, isLoadMore: boolean) =>
      caught instanceof Error
        ? caught.message
        : isLoadMore
          ? "Não foi possível carregar mais publicações."
          : "Não foi possível carregar as publicações.",
    []
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
    initialPage,
    initialError,
    loadOnMount,
    fetchPage,
    formatError,
  })

  useEffect(() => {
    onPostsChange?.(posts)
  }, [onPostsChange, posts])

  return (
    <>
      {posts.length ? (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      ) : !error && !isLoading && !isLoadingMore && !hasMore ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <h2 className="text-lg">{emptyTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      ) : null}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-border bg-card px-6 py-8 text-center"
        >
          <p className="text-sm text-muted-foreground">{error}</p>
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
        {(isLoading || isLoadingMore) && (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Carregando publicações…
          </p>
        )}
        {!hasMore && !error && posts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Você chegou ao fim das publicações.
          </p>
        )}
      </div>
    </>
  )
}

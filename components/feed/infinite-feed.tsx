"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { LoaderCircle, RefreshCw } from "lucide-react"

import { FeedPostCard } from "@/components/feed/feed-post-card"
import { Button } from "@/components/ui/button"
import type { FeedPostData } from "@/lib/feed/types"
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
  const [posts, setPosts] = useState(initialPage.items)
  const [cursor, setCursor] = useState(initialPage.nextCursor)
  const [hasMore, setHasMore] = useState(initialPage.hasMore)
  const [error, setError] = useState(initialError)
  const [isLoading, setIsLoading] = useState(loadOnMount)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(loadOnMount)

  useEffect(() => {
    onPostsChange?.(posts)
  }, [onPostsChange, posts])

  useEffect(() => {
    if (!loadOnMount) return
    const controller = new AbortController()
    requestRef.current?.abort()
    requestRef.current = controller
    loadingRef.current = true

    void publicationsService
      .list({ authorId, scope, order, signal: controller.signal })
      .then((page) => {
        if (controller.signal.aborted) return
        setPosts(page.items)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
        setError("")
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as publicações."
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          loadingRef.current = false
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [authorId, loadOnMount, order, scope])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || (!hasMore && posts.length > 0)) return

    loadingRef.current = true
    setIsLoading(true)
    setError("")
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller

    try {
      const page = await publicationsService.list({
        cursor,
        authorId,
        scope,
        order,
        signal: controller.signal,
      })
      setPosts((current) => {
        const knownIds = new Set(current.map((post) => post.id))
        return [
          ...current,
          ...page.items.filter((post) => !knownIds.has(post.id)),
        ]
      })
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (requestError) {
      if (controller.signal.aborted) return
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar mais publicações."
      )
    } finally {
      if (!controller.signal.aborted) {
        loadingRef.current = false
        setIsLoading(false)
      }
    }
  }, [authorId, cursor, hasMore, order, posts.length, scope])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || error || isLoading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { rootMargin: "320px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [error, hasMore, isLoading, loadMore])

  useEffect(() => () => requestRef.current?.abort(), [])

  return (
    <>
      {posts.length ? (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      ) : !error && !isLoading ? (
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
            onClick={() => void loadMore()}
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
        {isLoading && (
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
        {!hasMore && posts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Você chegou ao fim das publicações.
          </p>
        )}
      </div>
    </>
  )
}

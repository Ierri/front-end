"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Bookmark, LoaderCircle, RefreshCw } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedPostCard } from "@/components/feed/feed-post-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { seedSavedPostInteractions } from "@/lib/feed/post-interaction-store"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import { savesService, type SavedPostData } from "@/services/saves"

export function SavedPostsFeed() {
  const { user, refreshSession } = useAuth()
  const userId = user?.id ?? null

  const [posts, setPosts] = useState<SavedPostData[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState("")

  const sentinelRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const loadingRef = useRef(true)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    requestRef.current?.abort()
    requestRef.current = controller
    loadingRef.current = true

    void savesService
      .listSaved({ signal: controller.signal })
      .then((page) => {
        if (controller.signal.aborted || !mountedRef.current) return
        seedSavedPostInteractions(
          userId,
          page.items.map((item) => item.id)
        )
        setPosts(page.items)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
        setError("")
      })
      .catch((caught) => {
        if (controller.signal.aborted || !mountedRef.current) return
        if (isAuthApiError(caught)) {
          void refreshSession()
          setError("Sua sessão expirou. Entre novamente para ver seus salvos.")
          return
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar suas publicações salvas."
        )
      })
      .finally(() => {
        if (!controller.signal.aborted && mountedRef.current) {
          loadingRef.current = false
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [refreshSession, userId])

  const loadPage = useCallback(
    async (nextCursor: string | null) => {
      if (!userId || loadingRef.current) return
      loadingRef.current = true
      if (nextCursor) setIsLoadingMore(true)
      else setIsLoading(true)
      setError("")

      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller

      try {
        const page = await savesService.listSaved({
          cursor: nextCursor,
          signal: controller.signal,
        })
        if (controller.signal.aborted || !mountedRef.current) return
        seedSavedPostInteractions(
          userId,
          page.items.map((item) => item.id)
        )
        setPosts((current) => {
          if (!nextCursor) return page.items
          const knownIds = new Set(current.map((post) => post.id))
          return [
            ...current,
            ...page.items.filter((post) => !knownIds.has(post.id)),
          ]
        })
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) return
        if (isAuthApiError(caught)) {
          void refreshSession()
          setError("Sua sessão expirou. Entre novamente para ver seus salvos.")
          return
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar mais publicações salvas."
        )
      } finally {
        if (!controller.signal.aborted && mountedRef.current) {
          loadingRef.current = false
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [refreshSession, userId]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || !cursor || error || isLoading || isLoadingMore)
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadPage(cursor)
      },
      { rootMargin: "320px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cursor, error, hasMore, isLoading, isLoadingMore, loadPage])

  return (
    <section aria-label="Publicações salvas" className="space-y-6">
      {posts.length ? (
        posts.map((post) => <FeedPostCard key={post.id} post={post} />)
      ) : !error && !isLoading ? (
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
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void loadPage(posts.length ? cursor : null)}
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
            Carregando publicações salvas…
          </p>
        )}
        {!hasMore && !error && posts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Você chegou ao fim das publicações salvas.
          </p>
        )}
      </div>
    </section>
  )
}

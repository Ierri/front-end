"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CursorPage<T> = {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

type UseCursorPaginationOptions<T extends { id: string }> = {
  initialPage?: CursorPage<T>
  initialError?: string
  loadOnMount?: boolean
  fetchPage: (
    cursor: string | null,
    signal: AbortSignal
  ) => Promise<CursorPage<T>>
  onPageLoaded?: (page: CursorPage<T>) => void
  formatError?: (caught: unknown, isLoadMore: boolean) => string
}

const EMPTY_PAGE: CursorPage<never> = {
  items: [],
  nextCursor: null,
  hasMore: false,
}

export function useCursorPagination<T extends { id: string }>({
  initialPage = EMPTY_PAGE,
  initialError = "",
  loadOnMount = false,
  fetchPage,
  onPageLoaded,
  formatError,
}: UseCursorPaginationOptions<T>) {
  const initialHasMore =
    initialPage.hasMore &&
    (Boolean(initialPage.nextCursor) ||
      (loadOnMount && initialPage.items.length === 0))

  const [items, setItems] = useState<T[]>(initialPage.items)
  const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [error, setError] = useState<string>(initialError)
  const [isLoading, setIsLoading] = useState<boolean>(loadOnMount)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const loadingRef = useRef<boolean>(loadOnMount)
  const mountedRef = useRef<boolean>(true)
  const failedCursorRef = useRef<string | null>(null)
  const fetchPageRef = useRef(fetchPage)
  const onPageLoadedRef = useRef(onPageLoaded)
  const formatErrorRef = useRef(formatError)

  useEffect(() => {
    fetchPageRef.current = fetchPage
    onPageLoadedRef.current = onPageLoaded
    formatErrorRef.current = formatError
  }, [fetchPage, formatError, onPageLoaded])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestRef.current?.abort()
    }
  }, [])

  const executeFetch = useCallback(
    async (targetCursor: string | null, append: boolean) => {
      loadingRef.current = true
      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setIsLoadingMore(false)
      }
      setError("")

      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller

      try {
        const page = await fetchPageRef.current(targetCursor, controller.signal)
        if (controller.signal.aborted || !mountedRef.current) return
        onPageLoadedRef.current?.(page)
        failedCursorRef.current = null
        setItems((current) => {
          if (!append) return page.items
          const knownIds = new Set(current.map((item) => item.id))
          return [
            ...current,
            ...page.items.filter((item) => !knownIds.has(item.id)),
          ]
        })
        setCursor(page.nextCursor)
        setHasMore(page.hasMore && Boolean(page.nextCursor))
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) return
        failedCursorRef.current = targetCursor
        setError(
          formatErrorRef.current
            ? formatErrorRef.current(caught, append)
            : caught instanceof Error
              ? caught.message
              : "Não foi possível carregar os itens."
        )
      } finally {
        if (requestRef.current === controller && mountedRef.current) {
          loadingRef.current = false
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (!loadOnMount) return
    const controller = new AbortController()
    requestRef.current?.abort()
    requestRef.current = controller
    loadingRef.current = true

    void fetchPageRef
      .current(null, controller.signal)
      .then((page) => {
        if (controller.signal.aborted || !mountedRef.current) return
        onPageLoadedRef.current?.(page)
        failedCursorRef.current = null
        setItems(page.items)
        setCursor(page.nextCursor)
        setHasMore(page.hasMore && Boolean(page.nextCursor))
        setError("")
      })
      .catch((caught) => {
        if (controller.signal.aborted || !mountedRef.current) return
        failedCursorRef.current = null
        setError(
          formatErrorRef.current
            ? formatErrorRef.current(caught, false)
            : caught instanceof Error
              ? caught.message
              : "Não foi possível carregar os itens."
        )
      })
      .finally(() => {
        if (requestRef.current === controller && mountedRef.current) {
          loadingRef.current = false
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [loadOnMount])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || !cursor) return
    void executeFetch(cursor, true)
  }, [cursor, executeFetch, hasMore])

  const retry = useCallback(() => {
    if (loadingRef.current) return
    const retryCursor = failedCursorRef.current
    const shouldAppend = retryCursor !== null
    void executeFetch(retryCursor, shouldAppend)
  }, [executeFetch])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || !cursor || error || isLoading || isLoadingMore)
      return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "320px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cursor, error, hasMore, isLoading, isLoadingMore, loadMore])

  return {
    items,
    cursor,
    hasMore,
    error,
    isLoading,
    isLoadingMore,
    sentinelRef,
    loadMore,
    retry,
  }
}

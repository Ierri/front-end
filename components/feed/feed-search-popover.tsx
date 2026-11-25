"use client"

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowBigUp,
  Code2,
  FileText,
  Film,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent } from "@/components/ui/popover"
import type { FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import {
  SEARCH_MAX_LENGTH,
  normalizeSearchQuery,
  searchService,
  type SearchOrder,
  type SearchOverviewData,
  type SearchPublicationsPageData,
  type SearchTechnologyData,
  type SearchUserData,
  type SearchUsersPageData,
} from "@/services/search"

type SearchTab = "all" | "users" | "publications"

type CachedEntry =
  | { kind: "all"; data: SearchOverviewData }
  | { kind: "users"; data: SearchUsersPageData }
  | { kind: "publications"; data: SearchPublicationsPageData }

const DEBOUNCE_MS = 280
const CACHE_TTL_MS = 15_000
const MAX_CACHE_ENTRIES = 20

const tabOptions: Array<{ value: SearchTab; label: string }> = [
  { value: "all", label: "Tudo" },
  { value: "users", label: "Criadores" },
  { value: "publications", label: "Projetos" },
]

const orderOptions: Array<{ value: SearchOrder; label: string }> = [
  { value: "recentes", label: "Recentes" },
  { value: "score", label: "Mais votados" },
]

function SearchUserItem({
  user,
  onSelect,
}: {
  user: SearchUserData
  onSelect: () => void
}) {
  const isPrivate = user.visibility === "privado"
  const stackSummary = user.stacks
    .slice(0, 3)
    .map((stack) => stack.name)
    .join(" · ")
  const secondaryLine = stackSummary || user.bio || null

  const content = (
    <>
      <FeedUserAvatar
        src={user.avatar}
        name={user.name}
        size="default"
        fictitious={false}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          {isPrivate ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <LockKeyhole aria-hidden="true" className="size-3" />
              Privado
            </span>
          ) : user.related ? (
            <span className="inline-flex shrink-0 items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
              Relacionado
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username}
          {secondaryLine ? ` · ${secondaryLine}` : ""}
        </p>
      </div>
    </>
  )

  if (!user.profileHref) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">
        {content}
      </div>
    )
  }

  return (
    <Link
      href={user.profileHref}
      onClick={onSelect}
      aria-label={`Ver perfil de ${user.name} (@${user.username})${isPrivate ? " — perfil privado" : ""}`}
      className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
    >
      {content}
    </Link>
  )
}

function SearchPublicationItem({
  post,
  onSelect,
}: {
  post: FeedPostData
  onSelect: () => void
}) {
  const cover = post.media[0]
  const summary =
    post.content.trim() || `Projeto publicado por ${post.author.name}`

  return (
    <Link
      href={`/feed/post/${post.id}`}
      onClick={onSelect}
      aria-label={`Abrir projeto de ${post.author.name}: ${summary.slice(0, 80)}`}
      className="flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
    >
      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted">
        {cover?.type === "image" ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : cover?.type === "video" ? (
          <Film aria-hidden="true" className="size-5 text-muted-foreground" />
        ) : (
          <FileText
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-5 font-medium text-foreground">
          {summary}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="truncate">@{post.author.username}</span>
          <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
            <ArrowBigUp aria-hidden="true" className="size-3.5" />
            {post.score}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
            <MessageCircle aria-hidden="true" className="size-3.5" />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function FeedSearchPopover() {
  const popoverId = useId()
  const { status, user, refreshSession } = useAuth()
  const viewerKey = status === "authenticated" && user?.id ? user.id : "anon"

  const [open, setOpen] = useState(false)
  const [rawQuery, setRawQuery] = useState("")
  const [activeTab, setActiveTab] = useState<SearchTab>("all")
  const [order, setOrder] = useState<SearchOrder>("recentes")
  const [overview, setOverview] = useState<SearchOverviewData | null>(null)
  const [usersPage, setUsersPage] = useState<SearchUsersPageData | null>(null)
  const [publicationsPage, setPublicationsPage] =
    useState<SearchPublicationsPageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [loadMoreError, setLoadMoreError] = useState("")

  const anchorRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)
  const debounceRef = useRef<number | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const loadMoreRequestRef = useRef<AbortController | null>(null)
  const requestSeqRef = useRef(0)
  const cacheRef = useRef<
    Map<string, { expiresAt: number; entry: CachedEntry }>
  >(new Map())
  const cacheViewerRef = useRef<string>(viewerKey)

  const clearDebounce = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
  }, [])

  const abortActiveRequests = useCallback(() => {
    clearDebounce()
    requestRef.current?.abort()
    requestRef.current = null
    loadMoreRequestRef.current?.abort()
    loadMoreRequestRef.current = null
  }, [clearDebounce])

  useEffect(() => {
    mountedRef.current = true
    const handlePopState = () => {
      setOpen(false)
    }
    window.addEventListener("popstate", handlePopState)
    return () => {
      mountedRef.current = false
      window.removeEventListener("popstate", handlePopState)
      abortActiveRequests()
    }
  }, [abortActiveRequests])

  const readCache = useCallback(
    (key: string): CachedEntry | null => {
      if (cacheViewerRef.current !== viewerKey) {
        cacheRef.current.clear()
        cacheViewerRef.current = viewerKey
        return null
      }
      const hit = cacheRef.current.get(key)
      if (!hit) return null
      if (hit.expiresAt <= Date.now()) {
        cacheRef.current.delete(key)
        return null
      }
      return hit.entry
    },
    [viewerKey]
  )

  const writeCache = useCallback(
    (key: string, entry: CachedEntry) => {
      if (cacheViewerRef.current !== viewerKey) {
        cacheRef.current.clear()
        cacheViewerRef.current = viewerKey
      }
      if (cacheRef.current.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = cacheRef.current.keys().next().value
        if (oldestKey !== undefined) {
          cacheRef.current.delete(oldestKey)
        }
      }
      cacheRef.current.set(key, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        entry,
      })
    },
    [viewerKey]
  )

  const callWithSessionFallback = useCallback(
    async <T,>(
      runner: (credentials?: RequestCredentials) => Promise<T>
    ): Promise<T> => {
      try {
        return await runner(undefined)
      } catch (caught) {
        if (!isAuthApiError(caught)) throw caught
        cacheRef.current.clear()
        void refreshSession()
        return runner("omit")
      }
    },
    [refreshSession]
  )

  const executeSearch = useCallback(
    async (
      rawValue: string,
      tab: SearchTab,
      nextOrder: SearchOrder,
      bypassCache = false
    ) => {
      const normalized = normalizeSearchQuery(rawValue)
      abortActiveRequests()

      if (normalized.status !== "ready") {
        setIsLoading(false)
        setIsLoadingMore(false)
        setError("")
        setLoadMoreError("")
        if (normalized.status === "empty") {
          setOverview(null)
          setUsersPage(null)
          setPublicationsPage(null)
        }
        return
      }

      const effectiveOrder = tab === "users" ? "recentes" : nextOrder
      const cacheKey = `${viewerKey}:${tab}:${effectiveOrder}:${normalized.query.toLowerCase()}`

      if (!bypassCache) {
        const cached = readCache(cacheKey)
        if (cached) {
          setError("")
          setLoadMoreError("")
          setIsLoading(false)
          if (cached.kind === "all") setOverview(cached.data)
          else if (cached.kind === "users") setUsersPage(cached.data)
          else setPublicationsPage(cached.data)
          return
        }
      }

      const seq = requestSeqRef.current + 1
      requestSeqRef.current = seq
      const controller = new AbortController()
      requestRef.current = controller

      setIsLoading(true)
      setError("")
      setLoadMoreError("")

      try {
        if (tab === "all") {
          const data = await callWithSessionFallback((credentials) =>
            searchService.overview({
              query: normalized.query,
              limit: 5,
              order: effectiveOrder,
              credentials,
              signal: controller.signal,
            })
          )
          if (
            controller.signal.aborted ||
            !mountedRef.current ||
            seq !== requestSeqRef.current
          ) {
            return
          }
          setOverview(data)
          writeCache(cacheKey, { kind: "all", data })
        } else if (tab === "users") {
          const data = await callWithSessionFallback((credentials) =>
            searchService.users({
              query: normalized.query,
              limit: 10,
              credentials,
              signal: controller.signal,
            })
          )
          if (
            controller.signal.aborted ||
            !mountedRef.current ||
            seq !== requestSeqRef.current
          ) {
            return
          }
          setUsersPage(data)
          writeCache(cacheKey, { kind: "users", data })
        } else {
          const data = await callWithSessionFallback((credentials) =>
            searchService.publications({
              query: normalized.query,
              limit: 10,
              order: effectiveOrder,
              credentials,
              signal: controller.signal,
            })
          )
          if (
            controller.signal.aborted ||
            !mountedRef.current ||
            seq !== requestSeqRef.current
          ) {
            return
          }
          setPublicationsPage(data)
          writeCache(cacheKey, { kind: "publications", data })
        }
      } catch (caught) {
        if (
          controller.signal.aborted ||
          !mountedRef.current ||
          seq !== requestSeqRef.current
        ) {
          return
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível realizar a busca."
        )
      } finally {
        if (
          !controller.signal.aborted &&
          mountedRef.current &&
          seq === requestSeqRef.current
        ) {
          setIsLoading(false)
        }
      }
    },
    [
      abortActiveRequests,
      callWithSessionFallback,
      readCache,
      viewerKey,
      writeCache,
    ]
  )

  const handleLoadMore = useCallback(async () => {
    const normalized = normalizeSearchQuery(rawQuery)
    if (normalized.status !== "ready" || isLoadingMore) return

    const cursor =
      activeTab === "users"
        ? usersPage?.nextCursor
        : activeTab === "publications"
          ? publicationsPage?.nextCursor
          : null

    if (!cursor) return

    loadMoreRequestRef.current?.abort()
    const controller = new AbortController()
    loadMoreRequestRef.current = controller
    setIsLoadingMore(true)
    setLoadMoreError("")

    try {
      if (activeTab === "users") {
        const nextPage = await callWithSessionFallback((credentials) =>
          searchService.users({
            query: normalized.query,
            limit: 10,
            cursor,
            credentials,
            signal: controller.signal,
          })
        )
        if (controller.signal.aborted || !mountedRef.current) return
        setUsersPage((current) => {
          if (!current) return nextPage
          const seen = new Set(current.items.map((item) => item.id))
          return {
            items: [
              ...current.items,
              ...nextPage.items.filter((item) => !seen.has(item.id)),
            ],
            nextCursor: nextPage.nextCursor,
            hasMore: nextPage.hasMore,
          }
        })
      } else if (activeTab === "publications") {
        const nextPage = await callWithSessionFallback((credentials) =>
          searchService.publications({
            query: normalized.query,
            limit: 10,
            order,
            cursor,
            credentials,
            signal: controller.signal,
          })
        )
        if (controller.signal.aborted || !mountedRef.current) return
        setPublicationsPage((current) => {
          if (!current) return nextPage
          const seen = new Set(current.items.map((item) => item.id))
          return {
            items: [
              ...current.items,
              ...nextPage.items.filter((item) => !seen.has(item.id)),
            ],
            nextCursor: nextPage.nextCursor,
            hasMore: nextPage.hasMore,
          }
        })
      }
    } catch (caught) {
      if (controller.signal.aborted || !mountedRef.current) return
      setLoadMoreError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível carregar mais resultados."
      )
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setIsLoadingMore(false)
      }
    }
  }, [
    activeTab,
    callWithSessionFallback,
    isLoadingMore,
    order,
    publicationsPage?.nextCursor,
    rawQuery,
    usersPage?.nextCursor,
  ])

  function scheduleSearch(
    nextValue: string,
    tab: SearchTab,
    nextOrder: SearchOrder
  ) {
    clearDebounce()
    requestRef.current?.abort()
    loadMoreRequestRef.current?.abort()
    setLoadMoreError("")

    const normalized = normalizeSearchQuery(nextValue)
    if (normalized.status === "empty") {
      setIsLoading(false)
      setError("")
      setOverview(null)
      setUsersPage(null)
      setPublicationsPage(null)
      setOpen(false)
      return
    }

    setOpen(true)
    if (normalized.status === "incomplete") {
      setIsLoading(false)
      setError("")
      return
    }

    setIsLoading(true)
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      void executeSearch(nextValue, tab, nextOrder)
    }, DEBOUNCE_MS)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    setRawQuery(nextValue)
    scheduleSearch(nextValue, activeTab, order)
  }

  function handleInputFocus() {
    const normalized = normalizeSearchQuery(rawQuery)
    if (normalized.status === "empty") return
    setOpen(true)
    if (normalized.status === "ready") {
      void executeSearch(rawQuery, activeTab, order)
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault()
      event.stopPropagation()
      abortActiveRequests()
      setIsLoading(false)
      setOpen(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeSearchQuery(rawQuery)
    if (normalized.status === "empty") return
    setOpen(true)
    void executeSearch(rawQuery, activeTab, order)
  }

  function handleClear() {
    abortActiveRequests()
    setRawQuery("")
    setError("")
    setLoadMoreError("")
    setOverview(null)
    setUsersPage(null)
    setPublicationsPage(null)
    setIsLoading(false)
    setIsLoadingMore(false)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleTabChange(nextTab: SearchTab) {
    if (nextTab === activeTab) return
    setActiveTab(nextTab)
    void executeSearch(rawQuery, nextTab, order)
  }

  function handleOrderChange(nextOrder: SearchOrder) {
    if (nextOrder === order) return
    setOrder(nextOrder)
    void executeSearch(rawQuery, activeTab, nextOrder)
  }

  function handleSelectTechnology(tech: SearchTechnologyData) {
    setRawQuery(tech.name)
    setActiveTab("all")
    setOpen(true)
    inputRef.current?.focus()
    void executeSearch(tech.name, "all", order)
  }

  function handleSelectResult() {
    abortActiveRequests()
    setIsLoading(false)
    setOpen(false)
  }

  const normalized = normalizeSearchQuery(rawQuery)
  const hasAllResults = Boolean(
    overview &&
    (overview.technologies.items.length > 0 ||
      overview.users.items.length > 0 ||
      overview.publications.items.length > 0)
  )

  return (
    <Popover
      open={open}
      modal={false}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details.reason === "outside-press") {
          const target = details.event?.target
          if (target instanceof Node && anchorRef.current?.contains(target)) {
            return
          }
        }
        setOpen(nextOpen)
        if (!nextOpen) {
          abortActiveRequests()
          setIsLoading(false)
        }
      }}
    >
      <form
        ref={anchorRef}
        role="search"
        onSubmit={handleSubmit}
        className="relative col-span-2 row-start-2 w-full justify-self-center md:col-span-1 md:col-start-3 md:row-start-1 md:max-w-lg md:justify-self-end"
      >
        <label htmlFor="feed-search" className="sr-only">
          Buscar projetos e criadores
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          id="feed-search"
          name="search"
          type="search"
          autoComplete="off"
          maxLength={SEARCH_MAX_LENGTH}
          value={rawQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          placeholder="Buscar projetos e criadores"
          className="h-11 rounded-full border-border bg-muted pr-10 pl-11 text-sm transition-colors hover:bg-secondary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
        {rawQuery.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
            className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-background/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </form>

      <PopoverContent
        id={popoverId}
        anchor={anchorRef}
        positionMethod="fixed"
        side="bottom"
        align="end"
        sideOffset={10}
        collisionAvoidance={{
          side: "none",
          align: "shift",
          fallbackAxisSide: "none",
        }}
        initialFocus={false}
        finalFocus={false}
        aria-label="Resultados da busca"
        className="w-[min(32rem,calc(100vw-2rem))] min-w-[min(100%,var(--anchor-width))] gap-0 overflow-hidden rounded-2xl p-0 shadow-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-popover px-3.5 py-2.5">
          <div
            role="group"
            aria-label="Filtrar categoria da busca"
            className="flex items-center gap-1"
          >
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <LoaderCircle
                aria-hidden="true"
                className="size-3.5 animate-spin text-muted-foreground motion-reduce:animate-none"
              />
            )}
            {activeTab === "publications" && (
              <div
                role="group"
                aria-label="Ordenar projetos"
                className="flex items-center rounded-full bg-muted p-0.5"
              >
                {orderOptions.map((option) => {
                  const selected = order === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleOrderChange(option.value)}
                      className={cn(
                        "cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                        selected
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[min(28rem,calc(100svh-9rem))] overflow-y-auto p-3">
          {normalized.status === "incomplete" ? (
            <p
              role="status"
              className="py-8 text-center text-xs text-muted-foreground"
            >
              Digite um nome, @username, stack ou tema para pesquisar.
            </p>
          ) : error ? (
            <div role="alert" className="py-7 text-center">
              <p className="text-xs text-destructive">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  void executeSearch(rawQuery, activeTab, order, true)
                }
              >
                <RefreshCw aria-hidden="true" />
                Tentar novamente
              </Button>
            </div>
          ) : isLoading &&
            ((activeTab === "all" && !overview) ||
              (activeTab === "users" && !usersPage) ||
              (activeTab === "publications" && !publicationsPage)) ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
              Buscando projetos e criadores…
            </div>
          ) : activeTab === "all" ? (
            hasAllResults && overview ? (
              <div className="space-y-4">
                {overview.technologies.items.length > 0 && (
                  <section aria-label="Stacks e tecnologias">
                    <h3 className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Stacks
                    </h3>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {overview.technologies.items.map((tech) => (
                        <button
                          key={tech.id}
                          type="button"
                          onClick={() => handleSelectTechnology(tech)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors outline-none hover:border-accent-foreground/30 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                        >
                          {tech.iconUrl ? (
                            <Image
                              src={tech.iconUrl}
                              alt=""
                              width={14}
                              height={14}
                              unoptimized
                              className="size-3.5 object-contain"
                            />
                          ) : (
                            <Code2
                              aria-hidden="true"
                              className="size-3.5 text-muted-foreground"
                            />
                          )}
                          {tech.name}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {overview.users.items.length > 0 && (
                  <section aria-label="Criadores encontrados">
                    <div className="mb-1 flex items-center justify-between px-2">
                      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Criadores
                      </h3>
                      {overview.users.hasMore && (
                        <button
                          type="button"
                          onClick={() => handleTabChange("users")}
                          className="cursor-pointer rounded-sm text-xs font-medium text-accent-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Ver todos
                        </button>
                      )}
                    </div>
                    <ul className="space-y-0.5">
                      {overview.users.items.map((creator) => (
                        <li key={creator.id}>
                          <SearchUserItem
                            user={creator}
                            onSelect={handleSelectResult}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {overview.publications.items.length > 0 && (
                  <section aria-label="Projetos encontrados">
                    <div className="mb-1 flex items-center justify-between px-2">
                      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Projetos
                      </h3>
                      {overview.publications.hasMore && (
                        <button
                          type="button"
                          onClick={() => handleTabChange("publications")}
                          className="cursor-pointer rounded-sm text-xs font-medium text-accent-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Ver todos
                        </button>
                      )}
                    </div>
                    <ul className="space-y-0.5">
                      {overview.publications.items.map((post) => (
                        <li key={post.id}>
                          <SearchPublicationItem
                            post={post}
                            onSelect={handleSelectResult}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <div role="status" className="py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nenhum resultado para &ldquo;{normalized.query}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tente buscar por outra tecnologia, tema ou @username.
                </p>
              </div>
            )
          ) : activeTab === "users" ? (
            usersPage && usersPage.items.length > 0 ? (
              <div className="space-y-3">
                <ul className="space-y-0.5">
                  {usersPage.items.map((creator) => (
                    <li key={creator.id}>
                      <SearchUserItem
                        user={creator}
                        onSelect={handleSelectResult}
                      />
                    </li>
                  ))}
                </ul>

                {loadMoreError && (
                  <div role="alert" className="text-center">
                    <p className="text-xs text-destructive">{loadMoreError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => void handleLoadMore()}
                    >
                      <RefreshCw aria-hidden="true" />
                      Tentar novamente
                    </Button>
                  </div>
                )}

                {!loadMoreError && usersPage.hasMore && (
                  <div className="flex justify-center pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoadingMore}
                      onClick={() => void handleLoadMore()}
                    >
                      {isLoadingMore ? (
                        <>
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-3.5 animate-spin motion-reduce:animate-none"
                          />
                          Carregando…
                        </>
                      ) : (
                        "Carregar mais criadores"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div role="status" className="py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nenhum criador encontrado para &ldquo;{normalized.query}
                  &rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Experimente procurar pelo @username ou por uma stack.
                </p>
              </div>
            )
          ) : publicationsPage && publicationsPage.items.length > 0 ? (
            <div className="space-y-3">
              <ul className="space-y-0.5">
                {publicationsPage.items.map((post) => (
                  <li key={post.id}>
                    <SearchPublicationItem
                      post={post}
                      onSelect={handleSelectResult}
                    />
                  </li>
                ))}
              </ul>

              {loadMoreError && (
                <div role="alert" className="text-center">
                  <p className="text-xs text-destructive">{loadMoreError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => void handleLoadMore()}
                  >
                    <RefreshCw aria-hidden="true" />
                    Tentar novamente
                  </Button>
                </div>
              )}

              {!loadMoreError && publicationsPage.hasMore && (
                <div className="flex justify-center pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingMore}
                    onClick={() => void handleLoadMore()}
                  >
                    {isLoadingMore ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-3.5 animate-spin motion-reduce:animate-none"
                        />
                        Carregando…
                      </>
                    ) : (
                      "Carregar mais projetos"
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div role="status" className="py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum projeto encontrado para &ldquo;{normalized.query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Experimente outro termo ou veja a aba Criadores.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

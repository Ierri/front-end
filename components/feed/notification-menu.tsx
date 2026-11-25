"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, LoaderCircle, RefreshCw } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import {
  notificationsService,
  type NotificationItemData,
} from "@/services/notifications"

export function NotificationMenu() {
  const router = useRouter()
  const { status, user, refreshSession, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"
  const userId = isAuthenticated ? (user?.id ?? null) : null

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems] = useState<NotificationItemData[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")

  const mountedRef = useRef(true)
  const unreadRequestRef = useRef<AbortController | null>(null)
  const listRequestRef = useRef<AbortController | null>(null)
  const markAllPendingRef = useRef(false)
  const markingIdsRef = useRef<Set<string>>(new Set())
  const pendingAuthPromptRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pendingAuthPromptRef.current = false
      unreadRequestRef.current?.abort()
      listRequestRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (pendingAuthPromptRef.current && status === "unauthenticated") {
      pendingAuthPromptRef.current = false
      requireAuth()
    }
  }, [requireAuth, status])

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return
    unreadRequestRef.current?.abort()
    const controller = new AbortController()
    unreadRequestRef.current = controller
    try {
      const total = await notificationsService.unreadCount(controller.signal)
      if (!controller.signal.aborted && mountedRef.current) {
        setUnreadCount(total)
      }
    } catch (caught) {
      if (controller.signal.aborted || !mountedRef.current) return
      if (isAuthApiError(caught)) {
        setUnreadCount(0)
        void refreshSession()
      }
    }
  }, [refreshSession, userId])

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()
    unreadRequestRef.current?.abort()
    unreadRequestRef.current = controller

    void notificationsService
      .unreadCount(controller.signal)
      .then((total) => {
        if (!controller.signal.aborted && mountedRef.current) {
          setUnreadCount(total)
        }
      })
      .catch((caught) => {
        if (controller.signal.aborted || !mountedRef.current) return
        if (isAuthApiError(caught)) {
          setUnreadCount(0)
          void refreshSession()
        }
      })

    const handleFocus = () => void fetchUnreadCount()
    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("focus", handleFocus)
      controller.abort()
    }
  }, [fetchUnreadCount, refreshSession, userId])

  const loadNotifications = useCallback(
    async (nextCursor: string | null) => {
      if (!userId) return
      listRequestRef.current?.abort()
      const controller = new AbortController()
      listRequestRef.current = controller

      if (nextCursor) setIsLoadingMore(true)
      else setIsLoading(true)
      setError("")
      setActionError("")

      try {
        const page = await notificationsService.list({
          cursor: nextCursor,
          signal: controller.signal,
        })
        if (controller.signal.aborted || !mountedRef.current) return
        setItems((current) => {
          if (!nextCursor) return page.items
          const knownIds = new Set(current.map((item) => item.id))
          return [
            ...current,
            ...page.items.filter((item) => !knownIds.has(item.id)),
          ]
        })
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      } catch (caught) {
        if (controller.signal.aborted || !mountedRef.current) return
        if (isAuthApiError(caught)) {
          void refreshSession()
          setError("Sua sessão expirou. Entre novamente para ver notificações.")
          return
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar as notificações."
        )
      } finally {
        if (!controller.signal.aborted && mountedRef.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [refreshSession, userId]
  )

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen && userId) {
      void loadNotifications(null)
      void fetchUnreadCount()
    } else if (!nextOpen) {
      listRequestRef.current?.abort()
    }
  }

  function handleActionAuthError(caught: unknown): string | null {
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

  async function handleMarkAllRead() {
    if (!userId || markAllPendingRef.current) return
    markAllPendingRef.current = true
    setIsMarkingAll(true)
    setActionError("")

    const previousItems = items
    const previousUnread = unreadCount
    setItems((current) => current.map((item) => ({ ...item, unread: false })))
    setUnreadCount(0)

    try {
      await notificationsService.markAllRead()
    } catch (caught) {
      if (mountedRef.current) {
        setItems(previousItems)
        setUnreadCount(previousUnread)
        setActionError(
          handleActionAuthError(caught) ??
            (caught instanceof Error
              ? caught.message
              : "Não foi possível marcar as notificações como lidas.")
        )
      }
    } finally {
      markAllPendingRef.current = false
      if (mountedRef.current) {
        setIsMarkingAll(false)
      }
    }
  }

  async function handleSelectNotification(notification: NotificationItemData) {
    setActionError("")
    if (notification.unread && !markingIdsRef.current.has(notification.id)) {
      markingIdsRef.current.add(notification.id)
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, unread: false } : item
        )
      )
      setUnreadCount((current) => Math.max(0, current - 1))

      try {
        await notificationsService.markRead(notification.id)
      } catch (caught) {
        if (mountedRef.current) {
          setItems((current) =>
            current.map((item) =>
              item.id === notification.id ? { ...item, unread: true } : item
            )
          )
          setUnreadCount((current) => current + 1)
          setActionError(
            handleActionAuthError(caught) ??
              (caught instanceof Error
                ? caught.message
                : "Não foi possível marcar a notificação como lida.")
          )
        }
        return
      } finally {
        markingIdsRef.current.delete(notification.id)
      }
    }

    if (notification.publicationId) {
      setOpen(false)
      router.push(`/feed/post/${notification.publicationId}`)
    }
  }

  const hasUnread = unreadCount > 0 || items.some((item) => item.unread)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label={
          unreadCount > 0
            ? `Abrir notificações (${unreadCount} não lidas)`
            : "Abrir notificações"
        }
        className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background"
          />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="max-h-[min(32rem,var(--available-height))] w-[22rem] max-w-[calc(100vw-2rem)] overflow-y-auto p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <PopoverHeader>
            <PopoverTitle>Notificações</PopoverTitle>
            <PopoverDescription>
              Acompanhe as interações com suas publicações.
            </PopoverDescription>
          </PopoverHeader>
          {hasUnread && (
            <button
              type="button"
              disabled={isMarkingAll}
              onClick={() => void handleMarkAllRead()}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-accent-foreground transition-colors outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
            >
              {isMarkingAll ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <CheckCheck aria-hidden="true" className="size-3.5" />
              )}
              Ler todas
            </button>
          )}
        </div>

        {actionError && (
          <p role="alert" className="text-xs text-destructive">
            {actionError}
          </p>
        )}

        {isLoading && !items.length ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground"
          >
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
            Carregando notificações…
          </div>
        ) : error && !items.length ? (
          <div role="alert" className="py-6 text-center">
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void loadNotifications(null)}
            >
              <RefreshCw aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        ) : items.length ? (
          <div className="space-y-3">
            <ul className="-mx-2 space-y-1">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleSelectNotification(notification)}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                      notification.unread && "bg-accent/60 hover:bg-accent/80"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-2 size-2 shrink-0 rounded-full",
                        notification.unread ? "bg-primary" : "bg-transparent"
                      )}
                    />
                    <FeedUserAvatar
                      src={notification.actor.avatar}
                      name={notification.actor.name}
                      size="small"
                      fictitious={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 font-medium">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {error && (
              <div role="alert" className="text-center">
                <p className="text-xs text-destructive">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => void loadNotifications(cursor)}
                >
                  <RefreshCw aria-hidden="true" />
                  Tentar novamente
                </Button>
              </div>
            )}

            {!error && hasMore && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoadingMore}
                  onClick={() => void loadNotifications(cursor)}
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
                    "Carregar mais"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Você ainda não tem notificações.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

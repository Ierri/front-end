"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import {
  CommentThread,
  type ReplyLoadState,
} from "@/components/feed/comment-thread"
import { PostCommentForm } from "@/components/feed/post-comment-form"
import type { FeedCommentData, FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"
import { ApiError } from "@/services/api"
import { commentsService, isAuthApiError } from "@/services/comments"

export type ReplyTarget = { id: string; name: string; content: string }

const transientIdempotencyErrors = new Set([
  "NETWORK_ERROR",
  "COMENTARIO_WRITE_UNAVAILABLE",
  "COMENTARIO_OPERATION_PENDING",
])

function hasCommentId(comments: FeedCommentData[], targetId: string): boolean {
  return comments.some(
    (comment) =>
      comment.id === targetId || hasCommentId(comment.replies, targetId)
  )
}

function countPublishedComments(comments: FeedCommentData[]): number {
  return comments.reduce(
    (count, comment) =>
      count +
      (comment.status === "publicado" ? 1 : 0) +
      countPublishedComments(comment.replies),
    0
  )
}

function sortChronologically(comments: FeedCommentData[]): FeedCommentData[] {
  if (comments.length < 2 || !comments.every((item) => Boolean(item.createdAt)))
    return comments
  return [...comments].sort((a, b) => {
    const timeDiff = Date.parse(a.createdAt!) - Date.parse(b.createdAt!)
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) return timeDiff
    return a.id.localeCompare(b.id)
  })
}

function mergeUniqueComments(
  existing: FeedCommentData[],
  incoming: FeedCommentData[]
): FeedCommentData[] {
  const incomingById = new Map(incoming.map((item) => [item.id, item]))
  const merged = existing.map((item) => {
    const fresh = incomingById.get(item.id)
    if (!fresh) return item
    incomingById.delete(item.id)
    return { ...fresh, replies: item.replies }
  })
  return sortChronologically([...merged, ...incomingById.values()])
}

function appendReply(
  comments: FeedCommentData[],
  targetId: string,
  reply: FeedCommentData
): FeedCommentData[] {
  return comments.map((comment) =>
    comment.id === targetId
      ? {
          ...comment,
          replies: mergeUniqueComments(comment.replies, [reply]),
        }
      : { ...comment, replies: appendReply(comment.replies, targetId, reply) }
  )
}

function mergeRepliesForParent(
  comments: FeedCommentData[],
  parentId: string,
  incoming: FeedCommentData[]
): FeedCommentData[] {
  return comments.map((comment) =>
    comment.id === parentId
      ? {
          ...comment,
          replies: mergeUniqueComments(comment.replies, incoming),
        }
      : {
          ...comment,
          replies: mergeRepliesForParent(comment.replies, parentId, incoming),
        }
  )
}

function updateCommentInTree(
  comments: FeedCommentData[],
  targetId: string,
  updater: (comment: FeedCommentData) => FeedCommentData
): FeedCommentData[] {
  return comments.map((comment) =>
    comment.id === targetId
      ? updater(comment)
      : {
          ...comment,
          replies: updateCommentInTree(comment.replies, targetId, updater),
        }
  )
}

export function PostDiscussion({
  post,
  modal,
}: {
  post: FeedPostData
  modal: boolean
}) {
  const { status, user, refreshSession, requireAuth } = useAuth()
  const isApiPost = post.source === "api"

  const [thread, setThread] = useState<{
    items: FeedCommentData[]
    totalCount: number | undefined
  }>({
    items: post.comments,
    totalCount: post.commentCount,
  })
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(isApiPost)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [listError, setListError] = useState("")

  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [replyStates, setReplyStates] = useState<
    Record<string, ReplyLoadState>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [announcement, setAnnouncement] = useState("")

  const mountedRef = useRef(true)
  const submittingRef = useRef(false)
  const pendingAuthPromptRef = useRef(false)
  const listRequestRef = useRef<AbortController | null>(null)
  const replyRequestsRef = useRef<Map<string, AbortController>>(new Map())
  const pendingIdempotencyRef = useRef<{
    fingerprint: string
    key: string
  } | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pendingAuthPromptRef.current = false
    }
  }, [])

  useEffect(() => {
    if (pendingAuthPromptRef.current && status === "unauthenticated") {
      pendingAuthPromptRef.current = false
      requireAuth()
    }
  }, [requireAuth, status])

  const handleAuthError = useCallback(
    (caught: unknown): string | null => {
      if (!isAuthApiError(caught)) return null
      pendingIdempotencyRef.current = null
      if (mountedRef.current) {
        if (status === "unauthenticated") {
          requireAuth()
        } else {
          pendingAuthPromptRef.current = true
          void refreshSession()
        }
      }
      return "Sua sessão expirou. Entre novamente para continuar."
    },
    [refreshSession, requireAuth, status]
  )

  const loadCommentsPage = useCallback(
    async (nextCursor: string | null) => {
      if (!isApiPost) return
      listRequestRef.current?.abort()
      const controller = new AbortController()
      listRequestRef.current = controller

      if (nextCursor) setIsLoadingMore(true)
      else setIsLoading(true)
      setListError("")

      try {
        const page = await commentsService.list(post.id, {
          cursor: nextCursor,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setThread((current) => ({
          ...current,
          items: nextCursor
            ? mergeUniqueComments(current.items, page.items)
            : page.items,
        }))
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
      } catch (caught) {
        if (controller.signal.aborted) return
        setListError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar os comentários."
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [isApiPost, post.id]
  )

  const reloadComments = useCallback(() => {
    void loadCommentsPage(null)
  }, [loadCommentsPage])

  const loadMoreComments = useCallback(() => {
    if (!cursor) return
    void loadCommentsPage(cursor)
  }, [cursor, loadCommentsPage])

  useEffect(() => {
    if (!isApiPost) return
    const controller = new AbortController()
    listRequestRef.current?.abort()
    listRequestRef.current = controller
    const replyRequests = replyRequestsRef.current

    void commentsService
      .list(post.id, { signal: controller.signal })
      .then((page) => {
        if (controller.signal.aborted) return
        setThread((current) => ({ ...current, items: page.items }))
        setCursor(page.nextCursor)
        setHasMore(page.hasMore)
        setListError("")
      })
      .catch((caught) => {
        if (controller.signal.aborted) return
        setListError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar os comentários."
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => {
      controller.abort()
      replyRequests.forEach((request) => request.abort())
      replyRequests.clear()
    }
  }, [isApiPost, post.id])

  const loadReplies = useCallback(
    async (commentId: string, nextCursor?: string | null) => {
      if (!isApiPost) return
      replyRequestsRef.current.get(commentId)?.abort()
      const controller = new AbortController()
      replyRequestsRef.current.set(commentId, controller)

      setReplyStates((current) => ({
        ...current,
        [commentId]: {
          loaded: current[commentId]?.loaded ?? false,
          loading: true,
          cursor: current[commentId]?.cursor ?? null,
          hasMore: current[commentId]?.hasMore ?? false,
          error: "",
        },
      }))

      try {
        const page = await commentsService.replies(commentId, {
          cursor: nextCursor,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setThread((current) => ({
          ...current,
          items: mergeRepliesForParent(current.items, commentId, page.items),
        }))
        setReplyStates((current) => ({
          ...current,
          [commentId]: {
            loaded: true,
            loading: false,
            cursor: page.nextCursor,
            hasMore: page.hasMore,
            error: "",
          },
        }))
      } catch (caught) {
        if (controller.signal.aborted) return
        const message =
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar as respostas."
        setReplyStates((current) => ({
          ...current,
          [commentId]: {
            loaded: current[commentId]?.loaded ?? false,
            loading: false,
            cursor: current[commentId]?.cursor ?? null,
            hasMore: current[commentId]?.hasMore ?? false,
            error: message,
          },
        }))
      } finally {
        if (replyRequestsRef.current.get(commentId) === controller) {
          replyRequestsRef.current.delete(commentId)
        }
      }
    },
    [isApiPost]
  )

  async function submitComment(content: string): Promise<boolean> {
    if (!isApiPost) {
      const comment: FeedCommentData = {
        id: crypto.randomUUID(),
        author: {
          id: user?.id,
          username: user?.username,
          name: user?.name ?? "Usuário",
          avatar: user?.avatarUrl ?? "",
          fictitious: false,
        },
        technologies: [],
        content,
        time: "Agora",
        replies: [],
      }
      setThread((current) => ({
        ...current,
        items: replyTarget
          ? appendReply(current.items, replyTarget.id, comment)
          : [...current.items, comment],
      }))
      setAnnouncement(
        replyTarget
          ? `Resposta a ${replyTarget.name} adicionada.`
          : "Comentário adicionado."
      )
      setReplyTarget(null)
      return true
    }

    if (submittingRef.current) return false
    submittingRef.current = true
    const target = replyTarget
    const parentId = target?.id ?? null
    const fingerprint = `${parentId ?? "root"}:${content}`
    const idempotencyKey =
      pendingIdempotencyRef.current?.fingerprint === fingerprint
        ? pendingIdempotencyRef.current.key
        : crypto.randomUUID()
    pendingIdempotencyRef.current = { fingerprint, key: idempotencyKey }

    setIsSubmitting(true)
    setSubmitError("")
    try {
      const created = await commentsService.create(post.id, {
        content,
        parentId,
        idempotencyKey,
      })
      pendingIdempotencyRef.current = null
      if (!mountedRef.current) return true
      setThread((current) => {
        const alreadyPresent = hasCommentId(current.items, created.id)
        const items = parentId
          ? appendReply(current.items, parentId, created)
          : mergeUniqueComments(current.items, [created])
        return {
          items,
          totalCount: alreadyPresent
            ? current.totalCount
            : (current.totalCount ?? 0) + 1,
        }
      })
      setAnnouncement(
        target
          ? `Resposta a ${target.name} adicionada.`
          : "Comentário adicionado."
      )
      setReplyTarget(null)
      return true
    } catch (caught) {
      const authMessage = handleAuthError(caught)
      if (!mountedRef.current) return false
      if (authMessage) {
        setSubmitError(authMessage)
        return false
      }
      if (!(
        caught instanceof ApiError &&
        transientIdempotencyErrors.has(caught.code)
      )) {
        pendingIdempotencyRef.current = null
      }
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível enviar o comentário."
      )
      return false
    } finally {
      submittingRef.current = false
      if (mountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  async function handleEditComment(
    commentId: string,
    content: string
  ): Promise<string | null> {
    try {
      const updated = await commentsService.update(commentId, { content })
      if (!mountedRef.current) return null
      setThread((current) => ({
        ...current,
        items: updateCommentInTree(current.items, commentId, (item) => ({
          ...updated,
          replies: item.replies,
        })),
      }))
      setAnnouncement("Comentário atualizado.")
      return null
    } catch (caught) {
      const authMessage = handleAuthError(caught)
      if (!mountedRef.current) return null
      if (authMessage) return authMessage
      return caught instanceof Error
        ? caught.message
        : "Não foi possível atualizar o comentário."
    }
  }

  async function handleDeleteComment(
    commentId: string
  ): Promise<string | null> {
    try {
      await commentsService.remove(commentId)
      if (!mountedRef.current) return null
      setThread((current) => ({
        items: updateCommentInTree(current.items, commentId, (item) => ({
          ...item,
          status: "excluido",
          content: "Comentário removido",
          editedAt: null,
        })),
        totalCount:
          current.totalCount === undefined
            ? undefined
            : Math.max(0, current.totalCount - 1),
      }))
      setReplyTarget((current) => (current?.id === commentId ? null : current))
      setAnnouncement("Comentário removido.")
      return null
    } catch (caught) {
      const authMessage = handleAuthError(caught)
      if (!mountedRef.current) return null
      if (authMessage) return authMessage
      return caught instanceof Error
        ? caught.message
        : "Não foi possível excluir o comentário."
    }
  }

  const displayedCount = isApiPost
    ? Math.max(thread.totalCount ?? 0, countPublishedComments(thread.items))
    : thread.totalCount

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col border-t border-border",
        modal && "max-md:contents md:flex-1"
      )}
    >
      <div
        className={cn(
          "px-5 py-5 sm:px-6",
          modal &&
            "flex-1 max-md:border-t max-md:border-border md:min-h-0 md:overflow-y-auto"
        )}
      >
        <CommentThread
          comments={thread.items}
          totalCount={displayedCount}
          isApiPost={isApiPost}
          isLoading={isLoading}
          error={listError}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          postAuthorId={post.author.id}
          postAuthorAvatar={post.author.avatar}
          activeReplyId={replyTarget?.id}
          replyStates={replyStates}
          onReply={(comment) => {
            setSubmitError("")
            setReplyTarget({
              id: comment.id,
              name: comment.author.name,
              content: comment.content,
            })
          }}
          onRetry={reloadComments}
          onLoadMore={loadMoreComments}
          onLoadReplies={(commentId, nextCursor) =>
            void loadReplies(commentId, nextCursor)
          }
          onEdit={isApiPost ? handleEditComment : undefined}
          onDelete={isApiPost ? handleDeleteComment : undefined}
        />
      </div>
      <div
        className={cn(
          modal &&
            "shrink-0 max-md:sticky max-md:bottom-0 max-md:z-10 max-md:bg-background max-md:pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <PostCommentForm
          replyTarget={replyTarget}
          available
          isSubmitting={isSubmitting}
          error={submitError}
          onCancelReply={() => {
            setReplyTarget(null)
            setSubmitError("")
          }}
          onComment={submitComment}
        />
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

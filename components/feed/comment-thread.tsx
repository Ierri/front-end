"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  LoaderCircle,
  MessageSquare,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { FeedCommentData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"
import { cn } from "@/lib/utils"
import { COMMENT_MAX_LENGTH } from "@/services/comments"

export type ReplyLoadState = {
  loaded: boolean
  loading: boolean
  cursor: string | null
  hasMore: boolean
  error: string
}

type CommentThreadProps = {
  comments: FeedCommentData[]
  totalCount?: number
  unavailable?: boolean
  isApiPost?: boolean
  isLoading?: boolean
  error?: string
  hasMore?: boolean
  isLoadingMore?: boolean
  postAuthorId?: string
  postAuthorAvatar: string
  activeReplyId?: string
  replyStates?: Record<string, ReplyLoadState>
  onReply: (comment: FeedCommentData) => void
  onRetry?: () => void
  onLoadMore?: () => void
  onLoadReplies?: (commentId: string, cursor?: string | null) => void
  onEdit?: (commentId: string, content: string) => Promise<string | null>
  onDelete?: (commentId: string) => Promise<string | null>
}

const actionButtonFocusClass =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"

function countComments(comments: FeedCommentData[]): number {
  return comments.reduce(
    (count, comment) => count + 1 + countComments(comment.replies),
    0
  )
}

function CommentItem({
  comment,
  isApiPost = false,
  postAuthorId,
  postAuthorAvatar,
  activeReplyId,
  replyStates,
  onReply,
  onLoadReplies,
  onEdit,
  onDelete,
  depth = 0,
}: Pick<
  CommentThreadProps,
  | "isApiPost"
  | "postAuthorId"
  | "postAuthorAvatar"
  | "activeReplyId"
  | "replyStates"
  | "onReply"
  | "onLoadReplies"
  | "onEdit"
  | "onDelete"
> & {
  comment: FeedCommentData
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment.content)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const mountedRef = useRef(true)
  const editSavingRef = useRef(false)
  const deletingRef = useRef(false)
  const { status, user, requireAuth } = useAuth()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const isAuthenticated = status === "authenticated"
  const effectiveDepth = comment.depth ?? depth
  const isRemoved = comment.status === "excluido" || comment.status === "oculto"
  const isAuthor = postAuthorId
    ? Boolean(comment.author.id) && comment.author.id === postAuthorId
    : Boolean(postAuthorAvatar) && comment.author.avatar === postAuthorAvatar
  const canReply = !isRemoved && (!isApiPost || effectiveDepth < 2)
  const canManage =
    isApiPost &&
    isAuthenticated &&
    Boolean(user?.id) &&
    comment.author.id === user?.id &&
    comment.status === "publicado"
  const showEditForm = canManage && isEditing
  const canHaveApiReplies = isApiPost && effectiveDepth < 2

  const replyState = replyStates?.[comment.id]
  const repliesLoaded = replyState?.loaded ?? false
  const repliesLoading = replyState?.loading ?? false
  const repliesHasMore = replyState?.hasMore ?? false
  const repliesError = replyState?.error ?? ""
  const visibleReplyCount = countComments(comment.replies)

  const showLoadApiRepliesButton =
    canHaveApiReplies && Boolean(onLoadReplies) && !repliesLoaded
  const showEmptyRepliesLabel =
    canHaveApiReplies &&
    Boolean(onLoadReplies) &&
    repliesLoaded &&
    visibleReplyCount === 0
  const showToggleRepliesButton =
    visibleReplyCount > 0 && (!canHaveApiReplies || repliesLoaded)

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onEdit || editSavingRef.current) return
    const trimmed = editValue.trim()
    if (!trimmed) {
      setEditError("Escreva um comentário antes de salvar.")
      return
    }
    if (trimmed === comment.content.trim()) {
      setIsEditing(false)
      setEditError("")
      return
    }
    editSavingRef.current = true
    setEditSaving(true)
    setEditError("")
    try {
      const failure = await onEdit(comment.id, trimmed)
      if (!mountedRef.current) return
      if (failure) {
        setEditError(failure)
        return
      }
      setIsEditing(false)
    } finally {
      editSavingRef.current = false
      if (mountedRef.current) {
        setEditSaving(false)
      }
    }
  }

  async function handleConfirmDelete() {
    if (!onDelete || deletingRef.current) return
    deletingRef.current = true
    setIsDeleting(true)
    setDeleteError("")
    try {
      const failure = await onDelete(comment.id)
      if (!mountedRef.current) return
      if (failure) {
        setDeleteError(failure)
        return
      }
      setConfirmingDelete(false)
    } finally {
      deletingRef.current = false
      if (mountedRef.current) {
        setIsDeleting(false)
      }
    }
  }

  const authorHref =
    comment.author.fictitious === false
      ? profileHref(comment.author.username)
      : null

  return (
    <li
      className={cn(
        "relative",
        depth > 0 &&
          "before:absolute before:top-1 before:-left-5 before:h-3 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-border/60"
      )}
    >
      <article className="flex gap-3">
        {authorHref ? (
          <Link
            href={authorHref}
            aria-label={`Ver perfil de ${comment.author.name}`}
            className="shrink-0 self-start rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <FeedUserAvatar
              src={comment.author.avatar}
              name={comment.author.name}
              size="small"
              fictitious={false}
            />
          </Link>
        ) : (
          <FeedUserAvatar
            src={comment.author.avatar}
            name={comment.author.name}
            size="small"
            fictitious={comment.author.fictitious !== false}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {authorHref ? (
              <Link
                href={authorHref}
                className="rounded-sm text-sm leading-5 font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {comment.author.name}
              </Link>
            ) : (
              <p className="text-sm leading-5 font-semibold">
                {comment.author.name}
              </p>
            )}
            {isAuthor && (
              <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                Autor
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {comment.time}
            </span>
            {!isRemoved && comment.editedAt && (
              <span className="text-[11px] text-muted-foreground">
                · editado
              </span>
            )}
          </div>

          {showEditForm ? (
            <form
              onSubmit={(event) => void handleEditSubmit(event)}
              className="mt-2 space-y-2"
            >
              <Textarea
                aria-label="Editar comentário"
                rows={2}
                maxLength={COMMENT_MAX_LENGTH}
                value={editValue}
                disabled={editSaving}
                autoFocus
                onChange={(event) => setEditValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !editSaving) {
                    setIsEditing(false)
                    setEditValue(comment.content)
                    setEditError("")
                  } else if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey) &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                className="min-h-16 resize-none text-sm leading-6"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      editSaving ||
                      !editValue.trim() ||
                      editValue.trim() === comment.content.trim()
                    }
                  >
                    {editSaving ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-3.5 animate-spin motion-reduce:animate-none"
                        />
                        Salvando…
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={editSaving}
                    onClick={() => {
                      setIsEditing(false)
                      setEditValue(comment.content)
                      setEditError("")
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
                {editValue.length >= COMMENT_MAX_LENGTH - 200 && (
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {editValue.length}/{COMMENT_MAX_LENGTH}
                  </span>
                )}
              </div>
              {editError && (
                <p role="alert" className="text-xs text-destructive">
                  {editError}
                </p>
              )}
            </form>
          ) : (
            <p
              className={cn(
                "mt-1.5 text-sm leading-6 break-words whitespace-pre-wrap",
                isRemoved
                  ? "text-muted-foreground italic"
                  : "text-foreground/90"
              )}
            >
              {comment.content}
            </p>
          )}

          {!showEditForm && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {canReply && (
                <button
                  type="button"
                  aria-pressed={activeReplyId === comment.id}
                  onClick={() => {
                    if (!requireAuth()) return
                    setExpanded(true)
                    onReply(comment)
                  }}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-accent-foreground focus-visible:text-accent-foreground",
                    actionButtonFocusClass,
                    activeReplyId === comment.id && "text-accent-foreground"
                  )}
                >
                  <CornerDownRight aria-hidden="true" className="size-3" />
                  Responder
                </button>
              )}

              {canManage && onEdit && !confirmingDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setEditValue(comment.content)
                    setEditError("")
                    setConfirmingDelete(false)
                    setDeleteError("")
                    setIsEditing(true)
                  }}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-accent-foreground",
                    actionButtonFocusClass
                  )}
                >
                  <Pencil aria-hidden="true" className="size-3" />
                  Editar
                </button>
              )}

              {canManage && onDelete && !confirmingDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("")
                    setConfirmingDelete(true)
                  }}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-destructive focus-visible:text-destructive",
                    actionButtonFocusClass
                  )}
                >
                  <Trash2 aria-hidden="true" className="size-3" />
                  Excluir
                </button>
              )}

              {canManage && confirmingDelete && (
                <span
                  role="group"
                  aria-label="Confirmar exclusão do comentário"
                  className="inline-flex items-center gap-2 text-xs"
                >
                  <span className="text-muted-foreground">Excluir?</span>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => void handleConfirmDelete()}
                    className={cn(
                      "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm font-semibold text-destructive transition-colors outline-none hover:underline focus-visible:underline disabled:opacity-50",
                      actionButtonFocusClass
                    )}
                  >
                    {isDeleting ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-3 animate-spin motion-reduce:animate-none"
                        />
                        Excluindo…
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setConfirmingDelete(false)
                      setDeleteError("")
                    }}
                    className={cn(
                      "inline-flex min-h-6 cursor-pointer items-center rounded-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground disabled:opacity-50",
                      actionButtonFocusClass
                    )}
                  >
                    Cancelar
                  </button>
                </span>
              )}

              {showLoadApiRepliesButton && (
                <button
                  type="button"
                  disabled={repliesLoading}
                  onClick={() => {
                    setExpanded(true)
                    onLoadReplies?.(comment.id)
                  }}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-accent-foreground disabled:opacity-60",
                    actionButtonFocusClass
                  )}
                >
                  {repliesLoading ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-3 animate-spin motion-reduce:animate-none"
                      />
                      Carregando respostas…
                    </>
                  ) : (
                    <>
                      <ChevronDown aria-hidden="true" className="size-3" />
                      {visibleReplyCount > 0
                        ? "Ver mais respostas"
                        : "Ver respostas"}
                    </>
                  )}
                </button>
              )}

              {showToggleRepliesButton && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded(!expanded)}
                  className={cn(
                    "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-accent-foreground",
                    actionButtonFocusClass
                  )}
                >
                  {expanded ? (
                    <ChevronUp aria-hidden="true" className="size-3" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-3" />
                  )}
                  {expanded
                    ? "Ocultar"
                    : visibleReplyCount === 1
                      ? "Ver"
                      : `Ver ${visibleReplyCount}`}{" "}
                  {visibleReplyCount === 1 ? "resposta" : "respostas"}
                </button>
              )}

              {showEmptyRepliesLabel && (
                <span className="text-xs text-muted-foreground">
                  Sem respostas
                </span>
              )}
            </div>
          )}

          {deleteError && (
            <p role="alert" className="mt-1.5 text-xs text-destructive">
              {deleteError}
            </p>
          )}

          {repliesError && (
            <div
              role="alert"
              className="mt-2 flex flex-wrap items-center gap-2 text-xs text-destructive"
            >
              <span>{repliesError}</span>
              {onLoadReplies && (
                <button
                  type="button"
                  onClick={() =>
                    onLoadReplies(comment.id, replyState?.cursor ?? null)
                  }
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-sm font-medium text-foreground underline underline-offset-2 outline-none hover:text-accent-foreground",
                    actionButtonFocusClass
                  )}
                >
                  <RefreshCw aria-hidden="true" className="size-3" />
                  Tentar novamente
                </button>
              )}
            </div>
          )}
        </div>
      </article>

      {(comment.replies.length > 0 || (repliesLoaded && repliesHasMore)) && (
        <div
          aria-hidden={!expanded}
          inert={!expanded}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <ul className={cn("space-y-5 pt-4 pl-6", depth === 0 && "ml-2")}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isApiPost={isApiPost}
                  postAuthorId={postAuthorId}
                  postAuthorAvatar={postAuthorAvatar}
                  activeReplyId={activeReplyId}
                  replyStates={replyStates}
                  onReply={onReply}
                  onLoadReplies={onLoadReplies}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
              {repliesLoaded && repliesHasMore && onLoadReplies && (
                <li>
                  <button
                    type="button"
                    disabled={repliesLoading}
                    onClick={() =>
                      onLoadReplies(comment.id, replyState?.cursor ?? null)
                    }
                    className={cn(
                      "inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded-sm text-xs font-medium text-accent-foreground transition-colors outline-none hover:underline focus-visible:underline disabled:opacity-60",
                      actionButtonFocusClass
                    )}
                  >
                    {repliesLoading ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-3 animate-spin motion-reduce:animate-none"
                        />
                        Carregando mais respostas…
                      </>
                    ) : (
                      "Carregar mais respostas"
                    )}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}

export function CommentThread({
  comments,
  totalCount,
  unavailable = false,
  isApiPost = false,
  isLoading = false,
  error = "",
  hasMore = false,
  isLoadingMore = false,
  onRetry,
  onLoadMore,
  ...props
}: CommentThreadProps) {
  const count = totalCount ?? countComments(comments)

  return (
    <section aria-labelledby="post-comments-title">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h2
          id="post-comments-title"
          className="flex items-center gap-2 text-base"
        >
          Conversa
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 font-sans text-[11px] font-medium text-muted-foreground tabular-nums">
            {count}
          </span>
        </h2>
      </header>

      {isLoading && comments.length === 0 ? (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
        >
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          Carregando comentários…
        </div>
      ) : error && comments.length === 0 ? (
        <div role="alert" className="py-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RefreshCw aria-hidden="true" />
              Tentar novamente
            </Button>
          )}
        </div>
      ) : comments.length ? (
        <div className="space-y-6">
          <ul className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isApiPost={isApiPost}
                {...props}
              />
            ))}
          </ul>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-border bg-card px-4 py-3 text-center"
            >
              <p className="text-xs text-muted-foreground">{error}</p>
              {onLoadMore && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onLoadMore}
                >
                  <RefreshCw aria-hidden="true" />
                  Tentar novamente
                </Button>
              )}
            </div>
          )}

          {!error && hasMore && onLoadMore && (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={onLoadMore}
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
                  "Carregar mais comentários"
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center">
          <MessageSquare
            aria-hidden="true"
            className="mx-auto mb-3 size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">
            {unavailable
              ? "Comentários ainda indisponíveis"
              : "Comece a conversa"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {unavailable
              ? "A leitura das conversas será liberada em uma próxima etapa."
              : "Compartilhe o que chamou sua atenção ou uma ideia para o projeto."}
          </p>
        </div>
      )}
    </section>
  )
}

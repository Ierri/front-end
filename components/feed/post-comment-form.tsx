"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { ArrowUp, LoaderCircle, X } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import type { ReplyTarget } from "@/components/feed/post-discussion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { COMMENT_MAX_LENGTH } from "@/services/comments"

type PostCommentFormProps = {
  replyTarget: ReplyTarget | null
  available?: boolean
  isSubmitting?: boolean
  error?: string
  onCancelReply: () => void
  onComment: (content: string) => Promise<boolean> | boolean | void
  onUnavailable?: () => void
}

export function PostCommentForm({
  replyTarget,
  available = true,
  isSubmitting = false,
  error = "",
  onCancelReply,
  onComment,
  onUnavailable,
}: PostCommentFormProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const [comment, setComment] = useState("")
  const { status, user, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"
  const canComment = isAuthenticated && available
  const commentPlaceholder = replyTarget
    ? "Continue essa conversa…"
    : "Adicione um comentário…"

  useEffect(() => {
    if (replyTarget) inputRef.current?.focus()
  }, [replyTarget])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    if (!requireAuth()) return
    if (!available) {
      onUnavailable?.()
      return
    }
    const trimmed = comment.trim()
    if (!trimmed) {
      inputRef.current?.focus()
      return
    }
    const ok = await onComment(trimmed)
    if (ok !== false) {
      setComment("")
    }
  }

  return (
    <form
      aria-label={
        replyTarget ? `Responder a ${replyTarget.name}` : "Adicionar comentário"
      }
      onSubmit={(event) => void handleSubmit(event)}
      className="shrink-0 border-t border-border bg-background p-4 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {replyTarget && (
            <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                Respondendo a{" "}
                <span className="font-medium text-primary">
                  {replyTarget.name}
                </span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={isSubmitting}
                onClick={onCancelReply}
                aria-label="Cancelar resposta"
                className="shrink-0 text-muted-foreground"
              >
                <X aria-hidden="true" className="size-3.5" />
              </Button>
            </div>
          )}
          {canComment && (
            <Label htmlFor={inputId} className="sr-only">
              {replyTarget ? "Sua resposta" : "Seu comentário"}
            </Label>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-muted/20 p-2 transition-colors focus-within:border-ring/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/10">
            <div className="shrink-0 self-start">
              <FeedUserAvatar
                src={user?.avatarUrl}
                name={user?.name ?? "Visitante"}
                size="small"
                fictitious={false}
              />
            </div>
            {canComment ? (
              <Textarea
                ref={inputRef}
                id={inputId}
                name="comment"
                rows={1}
                maxLength={COMMENT_MAX_LENGTH}
                value={comment}
                disabled={isSubmitting}
                required
                placeholder={commentPlaceholder}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey) &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                className="field-sizing-content max-h-32 min-h-8 flex-1 resize-none rounded-none border-0 bg-transparent px-1.5 py-1 text-sm leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            ) : (
              <button
                type="button"
                aria-label={
                  isAuthenticated
                    ? "Comentários ainda indisponíveis"
                    : "Entrar para adicionar comentário"
                }
                onClick={() => {
                  if (isAuthenticated) onUnavailable?.()
                  else requireAuth()
                }}
                className="min-h-8 flex-1 cursor-text px-1.5 py-1 text-left text-sm leading-6 text-muted-foreground outline-none"
              >
                {isAuthenticated && !available
                  ? "Comentários ainda não estão disponíveis"
                  : commentPlaceholder}
              </button>
            )}
            <Button
              type={canComment ? "submit" : "button"}
              size="icon"
              disabled={isSubmitting || (canComment && !comment.trim())}
              onClick={
                canComment
                  ? undefined
                  : () => {
                      if (isAuthenticated) onUnavailable?.()
                      else requireAuth()
                    }
              }
              aria-label={
                isSubmitting
                  ? "Enviando comentário"
                  : canComment
                    ? replyTarget
                      ? "Enviar resposta"
                      : "Enviar comentário"
                    : isAuthenticated
                      ? "Comentários ainda indisponíveis"
                      : "Entrar para adicionar comentário"
              }
              className="size-8 shrink-0 rounded-full"
            >
              {isSubmitting ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <ArrowUp aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
          {canComment && comment.length >= COMMENT_MAX_LENGTH - 200 && (
            <p className="mt-1.5 text-right text-[11px] text-muted-foreground tabular-nums">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}

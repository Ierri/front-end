"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  MessageSquare,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import type { FeedCommentData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

type CommentThreadProps = {
  comments: FeedCommentData[]
  postAuthor: string
  activeReplyId?: string
  onReply: (comment: FeedCommentData) => void
}

function countComments(comments: FeedCommentData[]): number {
  return comments.reduce(
    (count, comment) => count + 1 + countComments(comment.replies),
    0
  )
}

function CommentItem({
  comment,
  postAuthor,
  activeReplyId,
  onReply,
  depth = 0,
}: Omit<CommentThreadProps, "comments"> & {
  comment: FeedCommentData
  depth?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const { requireAuth } = useAuth()
  const isAuthor = comment.author.avatar === postAuthor

  return (
    <li
      className={cn(
        "relative",
        depth > 0 &&
          "before:absolute before:top-1 before:-left-5 before:h-3 before:w-3 before:rounded-bl-lg before:border-b before:border-l before:border-border/60"
      )}
    >
      <article className="flex gap-3">
        <FeedUserAvatar
          src={comment.author.avatar}
          name={comment.author.name}
          size="small"
          fictitious={comment.author.fictitious !== false}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm leading-5 font-semibold">
              {comment.author.name}
            </p>
            {isAuthor && (
              <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                Autor
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {comment.time}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 break-words whitespace-pre-wrap text-foreground/90">
            {comment.content}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
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
                activeReplyId === comment.id && "text-accent-foreground"
              )}
            >
              <CornerDownRight aria-hidden="true" className="size-3" />
              Responder
            </button>
            {comment.replies.length > 0 && (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                className="inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-accent-foreground"
              >
                {expanded ? (
                  <ChevronUp aria-hidden="true" className="size-3" />
                ) : (
                  <ChevronDown aria-hidden="true" className="size-3" />
                )}
                {expanded
                  ? "Ocultar"
                  : countComments(comment.replies) === 1
                    ? "Ver"
                    : `Ver ${countComments(comment.replies)}`}{" "}
                {countComments(comment.replies) === 1
                  ? "resposta"
                  : "respostas"}
              </button>
            )}
          </div>
        </div>
      </article>
      {comment.replies.length > 0 && (
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
                  postAuthor={postAuthor}
                  activeReplyId={activeReplyId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  )
}

export function CommentThread({ comments, ...props }: CommentThreadProps) {
  const count = countComments(comments)
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
      {comments.length ? (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} {...props} />
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center">
          <MessageSquare
            aria-hidden="true"
            className="mx-auto mb-3 size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">Comece a conversa</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Compartilhe o que chamou sua atenção ou uma ideia para o projeto.
          </p>
        </div>
      )}
    </section>
  )
}

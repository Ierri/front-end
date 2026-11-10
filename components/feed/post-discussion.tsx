"use client"

import { useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { CommentThread } from "@/components/feed/comment-thread"
import { PostCommentForm } from "@/components/feed/post-comment-form"
import type { FeedCommentData, FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

export type ReplyTarget = { id: string; name: string; content: string }

function appendReply(
  comments: FeedCommentData[],
  targetId: string,
  reply: FeedCommentData
): FeedCommentData[] {
  return comments.map((comment) =>
    comment.id === targetId
      ? { ...comment, replies: [...comment.replies, reply] }
      : { ...comment, replies: appendReply(comment.replies, targetId, reply) }
  )
}

export function PostDiscussion({
  post,
  modal,
}: {
  post: FeedPostData
  modal: boolean
}) {
  const { user } = useAuth()
  const [comments, setComments] = useState(post.comments)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [announcement, setAnnouncement] = useState("")

  function submitComment(content: string) {
    const comment: FeedCommentData = {
      id: crypto.randomUUID(),
      author: {
        name: user?.name ?? "Usuário",
        avatar: user?.avatarUrl ?? "",
        fictitious: false,
      },
      technologies: [],
      content,
      time: "Agora",
      replies: [],
    }
    setComments((current) =>
      replyTarget
        ? appendReply(current, replyTarget.id, comment)
        : [...current, comment]
    )
    setAnnouncement(
      replyTarget
        ? `Resposta a ${replyTarget.name} adicionada.`
        : "Comentário adicionado."
    )
    setReplyTarget(null)
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col border-t border-border",
        modal && "md:flex-1"
      )}
    >
      <div
        className={cn(
          "px-5 py-5 sm:px-6",
          modal && "md:min-h-0 md:flex-1 md:overflow-y-auto"
        )}
      >
        <CommentThread
          comments={comments}
          postAuthor={post.author.avatar}
          activeReplyId={replyTarget?.id}
          onReply={(comment) =>
            setReplyTarget({
              id: comment.id,
              name: comment.author.name,
              content: comment.content,
            })
          }
        />
      </div>
      <PostCommentForm
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        onComment={submitComment}
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import type { FeedCommentData } from "@/lib/feed/types"

function CommentItem({ comment }: { comment: FeedCommentData }) {
  return (
    <li>
      <article>
        <FeedUserSummary
          user={comment.author}
          technologies={comment.technologies}
          compact
        />
        <p className="mt-3 text-sm leading-6 text-foreground">
          {comment.content}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <time className="text-xs text-muted-foreground">{comment.time}</time>
          <Button
            type="button"
            variant="link"
            size="xs"
            aria-disabled="true"
            className="h-auto px-0 py-1"
          >
            Responder
          </Button>
        </div>
      </article>

      {comment.replies.length > 0 ? (
        <ul className="mt-4 ml-4 space-y-5 border-l border-border pl-4 sm:ml-5 sm:pl-5">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CommentThread({ comments }: { comments: FeedCommentData[] }) {
  return (
    <section aria-labelledby="post-comments-title" className="border-t pt-6">
      <h2 id="post-comments-title" className="text-lg">
        Comentários
      </h2>
      <ul className="mt-6 space-y-7">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ul>
    </section>
  )
}

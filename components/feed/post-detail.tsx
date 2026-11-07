import { CommentThread } from "@/components/feed/comment-thread"
import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import { PostCommentForm } from "@/components/feed/post-comment-form"
import { PostMediaGallery } from "@/components/feed/post-media-gallery"
import type { FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

type PostDetailProps = {
  post: FeedPostData
  modal?: boolean
}

export function PostDetail({ post, modal = false }: PostDetailProps) {
  const hasSingleMediaModal = modal && post.media.length === 1

  return (
    <article
      className={cn(
        "min-h-0 bg-background md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.85fr)]",
        hasSingleMediaModal
          ? "h-full overflow-y-auto md:h-auto md:max-h-[min(92svh,58rem)] md:overflow-hidden"
          : modal
            ? "h-full overflow-y-auto md:overflow-hidden"
            : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <h1 className="sr-only">Publicação de {post.author.name}</h1>

      <PostMediaGallery
        media={post.media}
        priority
        className={cn(
          hasSingleMediaModal
            ? "md:max-h-[min(92svh,58rem)] md:overflow-y-auto"
            : modal && "md:h-full md:overflow-y-auto"
        )}
      />

      <div
        className={cn(
          "min-w-0",
          modal && "md:flex md:h-full md:flex-col md:overflow-hidden",
          hasSingleMediaModal && "md:[contain:size]"
        )}
      >
        <div
          className={cn(
            "space-y-6 p-5 sm:p-6",
            modal && "md:min-h-0 md:flex-1 md:overflow-y-auto"
          )}
        >
          <FeedUserSummary
            user={post.author}
            technologies={post.technologies}
          />

          <p className="text-sm leading-6 text-foreground">{post.content}</p>

          <PostActions score={post.score} authorName={post.author.name} />

          <CommentThread comments={post.comments} />
        </div>

        {modal && <PostCommentForm />}
      </div>
    </article>
  )
}

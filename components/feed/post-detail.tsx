import { CommentThread } from "@/components/feed/comment-thread"
import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
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
        "min-h-0 bg-background lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.85fr)]",
        hasSingleMediaModal
          ? "h-full overflow-y-auto lg:h-auto lg:max-h-[min(92svh,58rem)] lg:overflow-hidden"
          : modal
            ? "h-full overflow-y-auto lg:overflow-hidden"
            : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <h1 className="sr-only">Publicação de {post.author.name}</h1>

      <PostMediaGallery
        media={post.media}
        priority
        className={cn(
          hasSingleMediaModal
            ? "lg:max-h-[min(92svh,58rem)] lg:overflow-y-auto"
            : modal && "lg:h-full lg:overflow-y-auto"
        )}
      />

      <div
        className={cn(
          "min-w-0 space-y-6 p-5 sm:p-6",
          modal && "lg:h-full lg:overflow-y-auto",
          hasSingleMediaModal && "lg:[contain:size]"
        )}
      >
        <FeedUserSummary user={post.author} technologies={post.technologies} />

        <p className="text-sm leading-6 text-foreground">{post.content}</p>

        <PostActions score={post.score} authorName={post.author.name} />

        <CommentThread comments={post.comments} />
      </div>
    </article>
  )
}

import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import Link from "next/link"

import { PostDiscussion } from "@/components/feed/post-discussion"
import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import { PostMediaGallery } from "@/components/feed/post-media-gallery"
import type { FeedPostData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"
import { cn } from "@/lib/utils"

type PostDetailProps = {
  post: FeedPostData
  modal?: boolean
}

export function PostDetail({ post, modal = false }: PostDetailProps) {
  const authorHref =
    post.source === "api" ? profileHref(post.author.username) : null

  return (
    <article
      className={cn(
        "min-h-0 bg-background md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.85fr)]",
        modal
          ? "h-full overflow-y-auto md:grid-rows-[minmax(0,1fr)] md:overflow-hidden"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <h1 className="sr-only">Publicação de {post.author.name}</h1>

      <PostMediaGallery
        media={post.media}
        priority
        unoptimized={post.source === "api"}
        className={cn(
          modal && "md:min-h-0 md:overflow-y-auto",
          modal &&
            post.media.length === 1 &&
            "md:flex md:flex-col md:[&>figure]:my-auto md:[&>figure]:shrink-0"
        )}
      />

      <div
        className={cn(
          "min-w-0",
          modal && "md:flex md:min-h-0 md:flex-col md:overflow-hidden"
        )}
      >
        <div className={cn("space-y-6 p-5 sm:p-6", modal && "md:shrink-0")}>
          {authorHref ? (
            <Link
              href={authorHref}
              aria-label={`Ver perfil de ${post.author.name}`}
              className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <FeedUserSummary
                user={post.author}
                technologies={post.technologies}
              />
            </Link>
          ) : (
            <FeedUserSummary
              user={post.author}
              technologies={post.technologies}
            />
          )}

          <p className="text-sm leading-6 text-foreground">{post.content}</p>

          <ProfileStackBadges stacks={post.stacks} />

          <PostActions
            postId={post.id}
            score={post.score}
            authorName={post.author.name}
            source={post.source}
            eager
          />
        </div>

        <PostDiscussion key={post.id} post={post} modal={modal} />
      </div>
    </article>
  )
}

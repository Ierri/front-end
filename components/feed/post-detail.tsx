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
          ? "flex h-full flex-col overflow-y-auto md:grid-rows-[minmax(0,1fr)] md:overflow-hidden"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <h1 className="sr-only">Publicação de {post.author.name}</h1>

      <PostMediaGallery
        media={post.media}
        priority
        unoptimized={post.source === "api"}
        className={cn(
          modal && "shrink-0 md:min-h-0 md:overflow-y-auto",
          modal &&
            post.media.length === 1 &&
            "md:flex md:flex-col md:[&>figure]:my-auto md:[&>figure]:shrink-0"
        )}
      />

      <div
        className={cn(
          "min-w-0",
          modal && "contents md:flex md:min-h-0 md:flex-col md:overflow-hidden"
        )}
      >
        <div className={cn("space-y-6 p-5 sm:p-6", modal && "shrink-0")}>
          <div
            className={cn(
              "flex items-start justify-between gap-2",
              modal && "pr-7"
            )}
          >
            {authorHref ? (
              <Link
                href={authorHref}
                aria-label={`Ver perfil de ${post.author.name}`}
                className="block min-w-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
            <ProfileStackBadges
              stacks={post.stacks}
              className="mt-0 max-w-1/2 justify-end gap-0"
            />
          </div>

          <p className="text-sm leading-6 text-foreground">{post.content}</p>

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

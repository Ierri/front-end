"use client"

import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { PostDiscussion } from "@/components/feed/post-discussion"
import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import { PostMediaGallery } from "@/components/feed/post-media-gallery"
import { PostOwnerMenu } from "@/components/feed/post-owner-menu"
import {
  applyPostMutation,
  usePostMutation,
} from "@/lib/feed/post-mutation-store"
import type { FeedPostData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"
import { cn } from "@/lib/utils"

type PostDetailProps = {
  post: FeedPostData
  modal?: boolean
  onClose?: () => void
}

export function PostDetail({ post, modal = false, onClose }: PostDetailProps) {
  const router = useRouter()
  const mutation = usePostMutation(post.id)
  const currentPost = applyPostMutation(post, mutation)
  const authorHref =
    currentPost.source === "api"
      ? profileHref(currentPost.author.username)
      : null

  function handleDeleted() {
    if (modal) {
      if (onClose) onClose()
      else router.back()
      return
    }
    router.replace("/feed")
  }

  return (
    <article
      className={cn(
        "min-h-0 bg-background md:grid md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:grid-cols-[minmax(0,1.65fr)_minmax(22rem,0.85fr)]",
        modal
          ? "flex h-full flex-col overflow-y-auto md:grid-rows-[minmax(0,1fr)] md:overflow-hidden"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <h1 className="sr-only">Publicação de {currentPost.author.name}</h1>

      <PostMediaGallery
        media={currentPost.media}
        priority
        unoptimized={currentPost.source === "api"}
        className={cn(
          modal && "shrink-0 md:min-h-0 md:overflow-y-auto",
          modal &&
            currentPost.media.length === 1 &&
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
                aria-label={`Ver perfil de ${currentPost.author.name}`}
                className="block min-w-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <FeedUserSummary
                  user={currentPost.author}
                  technologies={currentPost.technologies}
                  showUsername
                />
              </Link>
            ) : (
              <FeedUserSummary
                user={currentPost.author}
                technologies={currentPost.technologies}
                showUsername
              />
            )}
            <div className="flex max-w-1/2 items-start justify-end gap-1.5">
              <ProfileStackBadges
                stacks={currentPost.stacks}
                className="mt-0 justify-end gap-0"
              />
              <PostOwnerMenu post={currentPost} onDeleted={handleDeleted} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
              {currentPost.content}
            </p>
            {(currentPost.editedAt ||
              currentPost.visibility === "seguidores") && (
              <p className="text-xs text-muted-foreground">
                {[
                  currentPost.visibility === "seguidores"
                    ? "Apenas seguidores"
                    : null,
                  currentPost.editedAt ? "Editado" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <PostActions
            postId={currentPost.id}
            score={currentPost.score}
            authorName={currentPost.author.name}
            source={currentPost.source}
            eager
          />
        </div>

        <PostDiscussion key={currentPost.id} post={currentPost} modal={modal} />
      </div>
    </article>
  )
}

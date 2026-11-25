"use client"

import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import Image from "next/image"
import Link from "next/link"

import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import { PostOwnerMenu } from "@/components/feed/post-owner-menu"
import {
  applyPostMutation,
  usePostMutation,
} from "@/lib/feed/post-mutation-store"
import type { FeedPostData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"

export function FeedPostCard({
  post,
  prioritizeCover = false,
}: {
  post: FeedPostData
  prioritizeCover?: boolean
}) {
  const mutation = usePostMutation(post.id)
  if (mutation.deleted) return null

  const currentPost = applyPostMutation(post, mutation)
  const cover = currentPost.media[0]
  const authorHref =
    currentPost.source === "api"
      ? profileHref(currentPost.author.username)
      : null

  return (
    <article className="rounded-2xl border border-border">
      <header className="relative flex items-start justify-between gap-2 p-4">
        <Link
          href={`/feed/post/${currentPost.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-[1] rounded-t-2xl"
        />
        <FeedUserSummary
          user={currentPost.author}
          technologies={currentPost.technologies}
          showUsername
          profileHref={authorHref ?? undefined}
        />
        <div className="relative z-10 flex max-w-1/2 items-start justify-end gap-1.5">
          <ProfileStackBadges
            stacks={currentPost.stacks}
            className="mt-0 justify-end gap-0"
          />
          <PostOwnerMenu post={currentPost} />
        </div>
      </header>
      <Link
        href={`/feed/post/${currentPost.id}`}
        aria-label={`Abrir publicação de ${currentPost.author.name}`}
        className="group block rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <p className="px-4 pb-4 text-sm leading-6 whitespace-pre-wrap text-foreground">
          {currentPost.content}
        </p>

        {cover ? (
          <div className="relative mx-4 aspect-video overflow-hidden rounded-xl bg-muted">
            {cover.type === "image" ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                unoptimized={currentPost.source === "api"}
                loading={prioritizeCover ? "eager" : "lazy"}
                fetchPriority={prioritizeCover ? "high" : undefined}
                sizes="(max-width: 1024px) calc(100vw - 2rem), (max-width: 1280px) calc(100vw - 9rem), 48rem"
                className="object-cover"
              />
            ) : (
              <video
                src={cover.src}
                poster={cover.poster}
                aria-label={cover.alt}
                preload="metadata"
                className="size-full object-cover"
              />
            )}
          </div>
        ) : null}
      </Link>

      <footer className="p-4">
        <PostActions
          postId={currentPost.id}
          score={currentPost.score}
          authorName={currentPost.author.name}
          source={currentPost.source}
        />
      </footer>
    </article>
  )
}

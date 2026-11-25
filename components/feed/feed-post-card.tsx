import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import Image from "next/image"
import Link from "next/link"

import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import type { FeedPostData } from "@/lib/feed/types"
import { profileHref } from "@/lib/profile/routes"

export function FeedPostCard({ post }: { post: FeedPostData }) {
  const cover = post.media[0]
  const authorHref =
    post.source === "api" ? profileHref(post.author.username) : null

  return (
    <article className="rounded-2xl border border-border">
      <header className="relative flex items-start justify-between gap-2 p-4">
        <Link
          href={`/feed/post/${post.id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-[1] rounded-t-2xl"
        />
        <FeedUserSummary
          user={post.author}
          technologies={post.technologies}
          profileHref={authorHref ?? undefined}
        />
        <ProfileStackBadges
          stacks={post.stacks}
          className="relative z-10 mt-0 max-w-1/2 justify-end gap-0"
        />
      </header>
      <Link
        href={`/feed/post/${post.id}`}
        aria-label={`Abrir publicação de ${post.author.name}`}
        className="group block rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <p className="px-4 pb-4 text-sm leading-6 text-foreground">
          {post.content}
        </p>

        {cover ? (
          <div className="relative mx-4 aspect-video overflow-hidden rounded-xl bg-muted">
            {cover.type === "image" ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                unoptimized={post.source === "api"}
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
          postId={post.id}
          score={post.score}
          authorName={post.author.name}
          source={post.source}
        />
      </footer>
    </article>
  )
}

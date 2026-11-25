import Image from "next/image"
import Link from "next/link"

import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import type { FeedPostData } from "@/lib/feed/types"

export function FeedPostCard({ post }: { post: FeedPostData }) {
  const cover = post.media[0]

  return (
    <article className="rounded-2xl border border-border">
      <header className="p-4">
        {post.source === "api" && post.author.username ? (
          <Link
            href={`/profile/${encodeURIComponent(post.author.username)}`}
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
      </header>
      <Link
        href={`/feed/post/${post.id}`}
        aria-label={`Abrir publicação de ${post.author.name}`}
        className="group block rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <p className="px-4 pb-4 text-sm leading-6 text-foreground">
          {post.content}
        </p>

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

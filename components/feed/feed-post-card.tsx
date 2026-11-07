import Image from "next/image"
import Link from "next/link"

import { FeedUserSummary } from "@/components/feed/feed-user-summary"
import { PostActions } from "@/components/feed/post-actions"
import type { FeedPostData } from "@/lib/feed/types"

export function FeedPostCard({ post }: { post: FeedPostData }) {
  const cover = post.media[0]

  return (
    <article className="rounded-2xl border border-border">
      <Link
        href={`/feed/post/${post.id}`}
        aria-label={`Abrir publicação de ${post.author.name}`}
        className="group block rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <header className="p-4">
          <FeedUserSummary
            user={post.author}
            technologies={post.technologies}
          />
        </header>

        <p className="px-4 pb-4 text-sm leading-6 text-foreground">
          {post.content}
        </p>

        <div className="relative mx-4 aspect-video overflow-hidden rounded-xl bg-muted">
          {cover.type === "image" ? (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
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
        <PostActions score={post.score} authorName={post.author.name} />
      </footer>
    </article>
  )
}

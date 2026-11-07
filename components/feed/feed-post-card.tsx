import Image from "next/image"
import { ArrowBigDown, ArrowBigUp, Bookmark } from "lucide-react"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { TechnologyIconList } from "@/components/feed/technology-icon-list"
import { Button } from "@/components/ui/button"
import type { FeedPostData } from "@/lib/feed/types"

export function FeedPostCard({ post }: { post: FeedPostData }) {
  return (
    <article className="rounded-2xl border border-border">
      <header className="flex items-center gap-3 p-4">
        <FeedUserAvatar
          src={post.author.avatar}
          name={post.author.name}
          size="large"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.author.name}</p>
          <TechnologyIconList
            technologies={post.technologies}
            ownerName={post.author.name}
            className="mt-1.5"
          />
        </div>
      </header>

      <p className="px-4 pb-4 text-sm leading-6 text-foreground">
        {post.content}
      </p>

      <div className="relative mx-4 aspect-video overflow-hidden rounded-xl bg-muted">
        <Image
          src={post.media.src}
          alt={post.media.alt}
          fill
          sizes="(max-width: 1024px) calc(100vw - 2rem), (max-width: 1280px) calc(100vw - 9rem), 48rem"
          className="object-cover"
        />
      </div>

      <footer className="flex items-center justify-between p-4">
        <div
          role="group"
          aria-label={`Votação demonstrativa da publicação de ${post.author.name}`}
          className="inline-flex items-center rounded-full border border-border"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dar upvote"
            aria-disabled="true"
            className="rounded-full"
          >
            <ArrowBigUp />
          </Button>
          <span
            aria-label={`${post.score} votos`}
            className="min-w-10 text-center text-sm font-semibold tabular-nums"
          >
            {post.score}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dar downvote"
            aria-disabled="true"
            className="rounded-full"
          >
            <ArrowBigDown />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Salvar publicação"
          aria-disabled="true"
          className="rounded-full"
        >
          <Bookmark />
        </Button>
      </footer>
    </article>
  )
}

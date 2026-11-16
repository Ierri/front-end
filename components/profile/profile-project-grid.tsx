import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle } from "lucide-react"

import { technologyCatalog } from "@/components/feed/technology-icon-list"
import type { FeedPostData } from "@/lib/feed/types"
import { getProfilePostTitle } from "@/lib/feed/mock-data"

export function ProfileProjectGrid({ posts }: { posts: FeedPostData[] }) {
  if (!posts.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-12 text-center">
        <h3 className="text-xl font-semibold">Nenhum projeto publicado ainda</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Quando novas publicações forem compartilhadas, elas aparecerão nesta galeria.
        </p>
      </div>
    )
  }

  return (
    <ul className="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => {
        const cover = post.media[0]
        const title = getProfilePostTitle(post.id)

        return (
          <li key={post.id} className="min-w-0">
            <Link
              href={`/feed/post/${post.id}`}
              aria-label={`Abrir projeto ${title}`}
              className="group block rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                {cover?.type === "video" ? (
                  <video
                    src={cover.src}
                    poster={cover.poster}
                    aria-label={cover.alt}
                    preload="metadata"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                  />
                ) : cover ? (
                  <Image
                    src={cover.src}
                    alt={cover.alt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                  />
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-3 pt-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold transition-colors group-hover:text-accent-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {post.content}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1" aria-label={`${post.score} votos`}>
                    <Heart aria-hidden="true" className="size-3.5" />
                    {post.score}
                  </span>
                  <span className="inline-flex items-center gap-1" aria-label={`${post.comments.length} comentários`}>
                    <MessageCircle aria-hidden="true" className="size-3.5" />
                    {post.comments.length}
                  </span>
                </div>
              </div>

              <ul aria-label={`Tecnologias de ${title}`} className="mt-3 flex flex-wrap gap-1.5">
                {post.technologies.map((technology) => (
                  <li
                    key={technology}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {technologyCatalog[technology].label}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

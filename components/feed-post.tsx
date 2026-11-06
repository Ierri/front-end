import Image from "next/image"
import {
  ArrowBigDown,
  ArrowBigUp,
  Bookmark,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export type FeedPost = {
  id: string
  author: {
    name: string
    avatar: string
  }
  technologies: Array<{
    label: string
    icon: LucideIcon
  }>
  media: {
    src: string
    alt: string
  }
  score: number
}

export function FeedPostCard({ post }: { post: FeedPost }) {
  return (
    <article className="rounded-2xl border border-border">
      <header className="flex items-center gap-3 p-4">
        <Image
          src={post.author.avatar}
          alt={`Foto de perfil fictícia de ${post.author.name}`}
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{post.author.name}</p>
          <ul
            aria-label={`Tecnologias de ${post.author.name}`}
            className="mt-1.5 flex items-center gap-2.5"
          >
            {post.technologies.map((technology) => {
              const TechnologyIcon = technology.icon

              return (
                <li key={technology.label}>
                  <TechnologyIcon
                    role="img"
                    aria-label={technology.label}
                    className="size-4 text-muted-foreground"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </header>

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

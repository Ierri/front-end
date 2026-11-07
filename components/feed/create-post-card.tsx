import Link from "next/link"
import { Camera } from "lucide-react"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { currentFeedUser } from "@/lib/feed/mock-data"

export function CreatePostCard() {
  return (
    <article className="rounded-2xl border border-border">
      <Link
        href="/feed/post/new"
        aria-label="Criar uma nova publicação"
        className="group flex items-center gap-3 rounded-2xl p-4 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <FeedUserAvatar
          src={currentFeedUser.avatar}
          name={currentFeedUser.name}
          size="large"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Compartilhe seu projeto</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Adicione imagens ou vídeos para publicar.
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
          <Camera aria-hidden="true" className="size-5" />
        </span>
      </Link>
    </article>
  )
}

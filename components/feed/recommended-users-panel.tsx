import Link from "next/link"

import { CreatePostCard } from "@/components/feed/create-post-card"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { profileHref } from "@/lib/profile/routes"
import { creatorsService, type RankedCreatorData } from "@/services/creators"

const rowClassName =
  "flex items-center gap-3 p-4 first:rounded-t-xl last:rounded-b-xl"

export async function RecommendedUsersPanel() {
  let creators: RankedCreatorData[] = []

  try {
    const page = await creatorsService.ranking({ limit: 5 })
    creators = page.items
  } catch {
    creators = []
  }

  return (
    <aside className="sticky top-[calc(5rem+1px)] hidden max-h-[calc(100svh-5rem-1px)] w-80 self-start justify-self-start overflow-y-auto pt-6 pb-6 xl:block">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg">Criadores em destaque</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Perfis mais votados da comunidade
          </p>
        </div>

        <section
          aria-label="Criadores em destaque"
          className="overflow-hidden rounded-xl border border-border"
        >
          {creators.length ? (
            <ul className="divide-y divide-border/60">
              {creators.map((creator) => {
                const href = profileHref(creator.username)
                const pointsText = `${creator.score} ${creator.score === 1 ? "ponto" : "pontos"}`
                const content = (
                  <>
                    <FeedUserAvatar
                      src={creator.avatar}
                      name={creator.name}
                      size="default"
                      fictitious={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {creator.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        @{creator.username}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                      {creator.score} {creator.score === 1 ? "pt" : "pts"}
                    </span>
                  </>
                )

                return (
                  <li key={creator.id}>
                    {href ? (
                      <Link
                        href={href}
                        aria-label={`Ver perfil de ${creator.name} (@${creator.username}), ${pointsText}`}
                        className={`${rowClassName} transition-colors outline-none hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={rowClassName}>{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="p-4 text-xs leading-5 text-muted-foreground">
              Os criadores em destaque aparecerão aqui conforme a comunidade
              publicar e votar.
            </p>
          )}
        </section>
        <CreatePostCard />
      </div>
    </aside>
  )
}

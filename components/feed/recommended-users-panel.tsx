import Link from "next/link"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { creatorsService, type RankedCreatorData } from "@/services/creators"

export async function RecommendedUsersPanel() {
  let creators: RankedCreatorData[] = []

  try {
    const page = await creatorsService.ranking({ limit: 5 })
    creators = page.items
  } catch {
    creators = []
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100svh-5rem)] w-80 justify-self-start pt-6 pb-6 xl:block">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg">Criadores em destaque</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Perfis mais votados da comunidade
          </p>
        </div>

        <section
          aria-label="Criadores em destaque"
          className="rounded-xl border border-border"
        >
          {creators.length ? (
            <ul className="divide-y divide-border/60">
              {creators.map((creator) => (
                <li key={creator.id}>
                  <Link
                    href={`/feed?autorId=${creator.id}`}
                    aria-label={`Ver publicações de ${creator.name}`}
                    className="flex items-center gap-3 p-4 transition-colors outline-none first:rounded-t-xl last:rounded-b-xl hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
                  >
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-xs leading-5 text-muted-foreground">
              Os criadores em destaque aparecerão aqui conforme a comunidade
              publicar e votar.
            </p>
          )}
        </section>
      </div>
    </aside>
  )
}

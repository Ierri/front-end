import Link from "next/link"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { profileHref } from "@/lib/profile/routes"
import type { RankedCreatorData } from "@/services/creators"

const cardClassName =
  "group relative flex min-h-28 items-center overflow-hidden rounded-2xl border border-border bg-card p-4"

export function TopPostsRanking({
  creators,
}: {
  creators: RankedCreatorData[]
}) {
  const rankedCreators = creators.slice(0, 5)

  return (
    <section aria-label="Top 5 de criadores por pontuação">
      {rankedCreators.length ? (
        <ol className="flex h-28 [scrollbar-width:none] items-center gap-3 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
          {rankedCreators.map((creator, index) => {
            const href = profileHref(creator.username)
            const pointsLabel = `${creator.score} ${creator.score === 1 ? "ponto" : "pontos"}`
            const content = (
              <>
                <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3 pr-7">
                  <FeedUserAvatar
                    src={creator.avatar}
                    name={creator.name}
                    size="large"
                    fictitious={false}
                  />
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold"
                      title={creator.name}
                    >
                      {creator.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                      {pointsLabel}
                    </p>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -right-3 flex w-16 items-center justify-center mask-[linear-gradient(to_right,black_25%,transparent_100%)] font-heading text-8xl leading-none font-bold tracking-tighter text-primary/25 transition-colors duration-200 group-hover:text-primary/40 motion-reduce:transition-none"
                >
                  {index + 1}
                </span>
              </>
            )

            return (
              <li key={creator.id} className="min-w-56 flex-[1_0_14rem]">
                {href ? (
                  <Link
                    href={href}
                    aria-label={`${index + 1}º lugar: ${creator.name}, ${pointsLabel}. Ver perfil.`}
                    className={`${cardClassName} transition-colors duration-200 outline-none hover:border-primary/40 hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div className={cardClassName}>{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          O ranking dos criadores aparecerá aqui conforme os projetos receberem
          votos.
        </p>
      )}
    </section>
  )
}

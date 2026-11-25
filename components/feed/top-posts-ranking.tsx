"use client"

import { useEffect, useRef, useState } from "react"
import { PostModal } from "@/components/feed/post-modal"
import type { FeedPostData } from "@/lib/feed/types"
import { publicationsService } from "@/services/publications"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import type { RankedCreatorData } from "@/services/creators"

export function TopPostsRanking({
  creators,
}: {
  creators: RankedCreatorData[]
}) {
  const rankedCreators = creators.slice(0, 5)
  const listRef = useRef<HTMLOListElement>(null)
  const drag = useRef<{ id: number; x: number; left: number } | null>(null)
  const moved = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  const request = useRef<AbortController | null>(null)
  const [post, setPost] = useState<FeedPostData | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => () => request.current?.abort(), [])

  async function openTopPost(creator: RankedCreatorData) {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoadingId(creator.id)
    setError("")
    try {
      const page = await publicationsService.list({
        authorId: creator.id,
        order: "score",
        limit: 1,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      if (page.items[0]) setPost(page.items[0])
      else setError(`${creator.name} ainda não tem uma publicação disponível.`)
    } catch {
      if (!controller.signal.aborted)
        setError("Não foi possível abrir a publicação. Tente novamente.")
    } finally {
      if (!controller.signal.aborted) setLoadingId(null)
    }
  }

  function updateFade(list: HTMLOListElement) {
    setHasMore(list.scrollWidth - list.clientWidth - list.scrollLeft > 1)
  }

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(() => updateFade(list))
    observer.observe(list)
    updateFade(list)
    return () => observer.disconnect()
  }, [rankedCreators.length])

  function stopDrag() {
    drag.current = null
    setDragging(false)
  }

  return (
    <section
      className="w-full min-w-0"
      aria-label="Top 5 de criadores por pontuação"
    >
      {rankedCreators.length ? (
        <div className="relative w-full min-w-0">
          <ol
            ref={listRef}
            className={`flex w-full snap-x snap-mandatory [scrollbar-width:none] items-stretch gap-3 overflow-x-auto overscroll-x-contain px-1 py-1 select-none [&::-webkit-scrollbar]:hidden ${dragging ? "cursor-grabbing [&_button]:cursor-grabbing" : "cursor-grab"}`}
            onScroll={(event) => updateFade(event.currentTarget)}
            onDragStart={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              moved.current = false
              if (event.pointerType !== "mouse" || event.button !== 0) return
              const list = event.currentTarget
              if (list.scrollWidth <= list.clientWidth) return
              drag.current = {
                id: event.pointerId,
                x: event.clientX,
                left: list.scrollLeft,
              }
            }}
            onPointerMove={(event) => {
              const start = drag.current
              if (!start || start.id !== event.pointerId) return
              const distance = event.clientX - start.x
              if (!moved.current && Math.abs(distance) < 5) return
              const list = event.currentTarget
              if (!moved.current) {
                moved.current = true
                list.setPointerCapture(event.pointerId)
                setDragging(true)
              }
              list.scrollLeft = start.left - distance
            }}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onLostPointerCapture={stopDrag}
            onPointerLeave={() => {
              if (!moved.current) stopDrag()
            }}
            onClickCapture={(event) => {
              if (!moved.current || event.detail === 0) return
              event.preventDefault()
              event.stopPropagation()
              moved.current = false
            }}
          >
            {rankedCreators.map((creator, index) => (
              <li
                key={creator.id}
                className="w-56 max-w-[85%] shrink-0 snap-start sm:min-w-56 sm:flex-[1_0_14rem]"
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-busy={loadingId === creator.id}
                  onClick={() => void openTopPost(creator)}
                  aria-label={`${index + 1}º lugar: ${creator.name}. Abrir publicação mais votada.`}
                  className="group relative flex min-h-28 w-full items-center overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-colors duration-200 outline-none hover:border-primary/40 hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
                >
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
                        {loadingId === creator.id
                          ? "Abrindo…"
                          : `${creator.score} ${creator.score === 1 ? "ponto" : "pontos"}`}
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -right-3 flex w-16 items-center justify-center mask-[linear-gradient(to_right,black_25%,transparent_100%)] font-heading text-8xl leading-none font-bold tracking-tighter text-primary/25 transition-colors duration-200 group-hover:text-primary/40 motion-reduce:transition-none"
                  >
                    {index + 1}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {hasMore && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-linear-to-l from-background to-transparent sm:w-14"
            />
          )}
        </div>
      ) : null}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {post && <PostModal post={post} onClose={() => setPost(null)} />}
    </section>
  )
}

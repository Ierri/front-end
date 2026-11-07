import Image from "next/image"
import Link from "next/link"
import { Bookmark, Search, UserRound } from "lucide-react"

import { FeedNavigation } from "@/components/feed/feed-navigation"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { NotificationMenu } from "@/components/feed/notification-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { currentFeedUser } from "@/lib/feed/mock-data"

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
        <div className="grid min-h-20 grid-cols-2 items-center gap-x-3 gap-y-3 py-3 md:grid-cols-[auto_auto_minmax(18rem,1fr)_auto] md:py-0">
          <Link
            href="/feed"
            aria-label="Ierri — voltar ao feed"
            className="justify-self-start rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <Image
              src="/brand/ierri/logos/svg/ierri-symbol-primary.svg"
              alt=""
              width={42}
              height={42}
              className="size-10 dark:hidden"
              priority
            />
            <Image
              src="/brand/ierri/logos/svg/ierri-symbol-inverse.svg"
              alt=""
              width={42}
              height={42}
              className="hidden size-10 dark:block"
              priority
            />
          </Link>

          <div className="col-span-2 row-start-3 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:ml-7">
            <FeedNavigation />
          </div>

          <form
            role="search"
            className="relative col-span-2 row-start-2 w-full md:col-span-1 md:col-start-3 md:row-start-1 md:max-w-lg md:justify-self-end"
          >
            <label htmlFor="feed-search" className="sr-only">
              Buscar projetos e criadores
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="feed-search"
              name="search"
              type="search"
              placeholder="Buscar projetos e criadores"
              className="h-11 rounded-full border-border bg-muted pr-4 pl-11 text-sm transition-colors hover:bg-secondary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </form>

          <div className="flex items-center gap-3 justify-self-end md:col-start-4 md:row-start-1">
            <NotificationMenu />

            <details name="feed-header-menu" className="group relative">
              <summary className="flex cursor-pointer list-none items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
                <FeedUserAvatar
                  src={currentFeedUser.avatar}
                  name={currentFeedUser.name}
                  priority
                />
                <span className="sr-only">Abrir menu do perfil</span>
              </summary>

              <div className="absolute top-full right-0 mt-3 w-52 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 px-3 py-2.5"
                >
                  <UserRound aria-hidden="true" className="size-4" />
                  Meu perfil
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start gap-3 px-3 py-2.5"
                >
                  <Bookmark aria-hidden="true" className="size-4" />
                  Salvos
                </Button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  )
}

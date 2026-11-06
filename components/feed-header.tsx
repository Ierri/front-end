import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"

export function FeedHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto grid min-h-20 w-full max-w-[1600px] grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 md:grid-cols-[1fr_minmax(20rem,40rem)_1fr] md:px-8">
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

        <form
          role="search"
          className="relative col-span-2 row-start-2 w-full md:col-span-1 md:col-start-2 md:row-start-1"
        >
          <label htmlFor="feed-search" className="sr-only">
            Buscar projetos e criadores
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="feed-search"
            name="search"
            type="search"
            placeholder="Buscar projetos e criadores"
            className="h-11 w-full rounded-full border border-border bg-muted pr-4 pl-11 text-sm transition-colors placeholder:text-muted-foreground hover:bg-secondary focus-visible:border-ring focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none"
          />
        </form>

        <div className="flex min-w-0 items-center gap-3 justify-self-end">
          <span className="truncate text-sm font-semibold">Rafael Lima</span>
          <Image
            src="/avatars/rafael-lima-demo.png"
            alt="Foto de perfil fictícia de Rafael Lima"
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
            priority
          />
        </div>
      </div>
    </header>
  )
}

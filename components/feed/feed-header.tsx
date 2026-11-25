import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"

import { FeedNavigation } from "@/components/feed/feed-navigation"
import { FeedAccountActions } from "@/components/feed/feed-account-actions"
import { FeedSearchPopover } from "@/components/feed/feed-search-popover"

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
            <Suspense>
              <FeedNavigation />
            </Suspense>
          </div>

          <FeedSearchPopover />

          <div className="flex items-center gap-3 justify-self-end md:col-start-4 md:row-start-1">
            <Suspense
              fallback={
                <span className="size-10 rounded-full bg-muted" aria-hidden />
              }
            >
              <FeedAccountActions />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  )
}

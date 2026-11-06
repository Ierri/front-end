import Link from "next/link"
import { Bell, Bookmark, House, UserCheck } from "lucide-react"

const navigationItems = [
  { label: "Página Inicial", icon: House, active: true },
  { label: "Seguindo", icon: UserCheck, active: false },
  { label: "Notificações", icon: Bell, active: false },
  { label: "Salvos", icon: Bookmark, active: false },
]

export function FeedSidebar() {
  return (
    <aside className="border-b border-border lg:sticky lg:top-20 lg:h-[calc(100svh-5rem)] lg:border-r lg:border-b-0">
      <nav aria-label="Navegação do feed" className="py-3 lg:px-3 lg:py-10">
        <ul className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:w-full lg:flex-col lg:gap-6 lg:px-0">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const content = (
              <>
                <Icon aria-hidden="true" className="size-5" />
                <span className="whitespace-nowrap lg:sr-only xl:not-sr-only">
                  {item.label}
                </span>
              </>
            )

            return (
              <li key={item.label} className="shrink-0">
                {item.active ? (
                  <Link
                    href="/feed"
                    aria-current="page"
                    className="flex h-11 items-center gap-3 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors outline-none hover:bg-accent/80 focus-visible:ring-2 focus-visible:ring-ring lg:justify-center lg:px-0 xl:justify-start xl:px-4"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium text-muted-foreground lg:justify-center lg:px-0 xl:justify-start xl:px-4">
                    {content}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

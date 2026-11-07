import Link from "next/link"

const navigationItems = [
  { label: "Página Inicial", active: true },
  { label: "Seguindo", active: false },
  { label: "Mais votados", active: false },
]

export function FeedNavigation() {
  return (
    <nav aria-label="Navegação do feed" className="overflow-x-auto">
      <ul className="flex min-w-max items-center gap-6">
        {navigationItems.map((item) => (
          <li key={item.label}>
            {item.active ? (
              <Link
                href="/feed"
                aria-current="page"
                className="relative flex h-12 items-center justify-center text-sm font-semibold whitespace-nowrap text-foreground outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary focus-visible:ring-2 focus-visible:ring-ring md:h-20"
              >
                {item.label}
              </Link>
            ) : (
              <div className="flex h-12 items-center justify-center text-sm font-medium whitespace-nowrap text-muted-foreground md:h-20">
                {item.label}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

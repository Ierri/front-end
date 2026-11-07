"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const navigationItems = [
  { label: "Página Inicial", value: "home" },
  { label: "Seguindo", value: "following" },
  { label: "Mais votados", value: "top" },
]

export function FeedNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get("tab")
  const activeTab = navigationItems.some((item) => item.value === requestedTab)
    ? requestedTab
    : "home"

  return (
    <nav aria-label="Navegação do feed" className="overflow-x-auto">
      <Tabs
        value={pathname === "/feed" ? activeTab : null}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams)
          if (value === "home") params.delete("tab")
          else params.set("tab", String(value))
          const query = params.toString()
          router.push(query ? `/feed?${query}` : "/feed")
        }}
      >
        <TabsList
          variant="line"
          aria-label="Filtrar publicações"
          className="min-w-max gap-6 p-0 group-data-horizontal/tabs:h-auto"
        >
          {navigationItems.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="h-12 flex-none rounded-none px-0 text-sm font-semibold transition-colors after:bg-primary after:transition-none group-data-horizontal/tabs:after:bottom-0 md:h-20"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  )
}

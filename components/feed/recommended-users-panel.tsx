import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TechnologyIconList } from "@/components/feed/technology-icon-list"
import { recommendedUsers } from "@/lib/feed/mock-data"

export function RecommendedUsersPanel() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100svh-5rem)] w-80 justify-self-start pt-6 pb-6 xl:block">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg">Recomendados</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Demonstração
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Talvez você goste
          </p>
        </div>

        <section className="rounded-xl border border-border">
          <ul>
            {recommendedUsers.map((user) => (
              <li key={user.name} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9" aria-label={user.name}>
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>
                    <TechnologyIconList
                      technologies={user.technologies}
                      ownerName={user.name}
                      className="mt-2"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}

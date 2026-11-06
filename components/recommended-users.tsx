import {
  Braces,
  CircleUserRound,
  Cloud,
  Code2,
  Component,
  Database,
  Palette,
  PanelsTopLeft,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

type Technology = {
  label: string
  icon: LucideIcon
}

type RecommendedUser = {
  name: string
  technologies: Technology[]
}

const recommendedUsers: RecommendedUser[] = [
  {
    name: "Ana Costa",
    technologies: [
      { label: "React", icon: Component },
      { label: "TypeScript", icon: Braces },
      { label: "Design de interfaces", icon: Palette },
    ],
  },
  {
    name: "Lucas Mendes",
    technologies: [
      { label: "Desenvolvimento web", icon: Code2 },
      { label: "Bancos de dados", icon: Database },
      { label: "Cloud", icon: Cloud },
    ],
  },
  {
    name: "Camila Rocha",
    technologies: [
      { label: "Design de interfaces", icon: PanelsTopLeft },
      { label: "Aplicativos mobile", icon: Smartphone },
      { label: "React", icon: Component },
    ],
  },
  {
    name: "Diego Alves",
    technologies: [
      { label: "TypeScript", icon: Braces },
      { label: "Desenvolvimento web", icon: Code2 },
      { label: "Bancos de dados", icon: Database },
    ],
  },
]

export function RecommendedUsers() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100svh-5rem)] w-80 justify-self-start pt-24 pb-6 xl:block">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg">Recomendados</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Talvez você goste
          </p>
        </div>

        <section className="rounded-xl border border-border">
          <ul>
            {recommendedUsers.map((user) => (
              <li key={user.name} className="p-4">
                <div className="flex items-center gap-3">
                  <CircleUserRound
                    aria-hidden="true"
                    className="size-9 shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>
                    <ul
                      aria-label={`Tecnologias de ${user.name}`}
                      className="mt-2 flex items-center gap-2.5"
                    >
                      {user.technologies.map((technology) => {
                        const TechnologyIcon = technology.icon

                        return (
                          <li key={technology.label}>
                            <TechnologyIcon
                              role="img"
                              aria-label={technology.label}
                              className="size-4 text-muted-foreground"
                            />
                          </li>
                        )
                      })}
                    </ul>
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

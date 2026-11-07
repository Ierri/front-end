import {
  Braces,
  Cloud,
  Code2,
  Component,
  Database,
  Palette,
  PanelsTopLeft,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

import type { TechnologyKey } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

const technologyDetails: Record<
  TechnologyKey,
  { label: string; icon: LucideIcon }
> = {
  web: { label: "Desenvolvimento web", icon: Code2 },
  typescript: { label: "TypeScript", icon: Braces },
  database: { label: "Bancos de dados", icon: Database },
  mobile: { label: "Aplicativos mobile", icon: Smartphone },
  react: { label: "React", icon: Component },
  design: { label: "Design de interfaces", icon: Palette },
  "interface-design": {
    label: "Design de interfaces",
    icon: PanelsTopLeft,
  },
  cloud: { label: "Cloud", icon: Cloud },
}

type TechnologyIconListProps = {
  technologies: TechnologyKey[]
  ownerName: string
  className?: string
}

export function TechnologyIconList({
  technologies,
  ownerName,
  className,
}: TechnologyIconListProps) {
  return (
    <ul
      aria-label={`Tecnologias de ${ownerName}`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {technologies.map((technology) => {
        const { icon: TechnologyIcon, label } = technologyDetails[technology]

        return (
          <li key={technology}>
            <TechnologyIcon
              role="img"
              aria-label={label}
              className="size-4 text-muted-foreground"
            />
          </li>
        )
      })}
    </ul>
  )
}

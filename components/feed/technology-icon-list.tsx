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

export const technologyCatalog: Record<
  TechnologyKey,
  { label: string; description: string; icon: LucideIcon }
> = {
  web: {
    label: "Desenvolvimento web",
    description: "Sites e aplicações para a web",
    icon: Code2,
  },
  typescript: {
    label: "TypeScript",
    description: "Tipagem e ferramentas de desenvolvimento",
    icon: Braces,
  },
  database: {
    label: "Bancos de dados",
    description: "Modelagem, consultas e armazenamento",
    icon: Database,
  },
  mobile: {
    label: "Aplicativos mobile",
    description: "Experiências para celulares e tablets",
    icon: Smartphone,
  },
  react: {
    label: "React",
    description: "Interfaces com componentes reutilizáveis",
    icon: Component,
  },
  design: {
    label: "Design de interfaces",
    description: "Experiência, interação e sistemas visuais",
    icon: Palette,
  },
  "interface-design": {
    label: "Design de interfaces",
    description: "Pesquisa e desenho de produtos digitais",
    icon: PanelsTopLeft,
  },
  cloud: {
    label: "Cloud",
    description: "Infraestrutura e serviços em nuvem",
    icon: Cloud,
  },
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
        const { icon: TechnologyIcon, label } = technologyCatalog[technology]

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

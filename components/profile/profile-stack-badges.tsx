import { ProfileStackIcon } from "@/components/profile/profile-stack-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ProfileStack } from "@/services/profiles"

const categoryOrder = [
  "Linguagem",
  "Frontend",
  "Backend",
  "Mobile",
  "Banco de dados",
  "API",
  "Design",
  "Testes",
  "Infraestrutura",
  "Ferramenta",
]

function categoryPosition(category: string | null) {
  const position = categoryOrder.indexOf(category?.trim() ?? "")
  return position === -1 ? categoryOrder.length : position
}

export function ProfileStackBadges({
  stacks,
  className,
  sortByCategory = false,
}: {
  stacks?: ProfileStack[]
  className?: string
  sortByCategory?: boolean
}) {
  if (!stacks?.length) return null

  const orderedStacks = sortByCategory
    ? [...stacks].sort(
        (left, right) =>
          categoryPosition(left.categoria) - categoryPosition(right.categoria)
      )
    : stacks

  return (
    <TooltipProvider>
      <ul
        aria-label="Stacks e tecnologias"
        className={cn("mt-5 flex flex-wrap gap-1.5", className)}
      >
        {orderedStacks.map((stack) => (
          <li key={stack.id}>
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label={stack.nome}
                className="grid size-8 place-items-center rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ProfileStackIcon stack={stack} selected />
              </TooltipTrigger>
              <TooltipContent>{stack.nome}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  )
}

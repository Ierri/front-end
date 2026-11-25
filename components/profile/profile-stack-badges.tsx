import { ProfileStackIcon } from "@/components/profile/profile-stack-icon"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { ProfileStack } from "@/services/profiles"

export function ProfileStackBadges({
  stacks,
  className,
}: {
  stacks?: ProfileStack[]
  className?: string
}) {
  if (!stacks?.length) return null

  return (
    <TooltipProvider>
      <ul
        aria-label="Stacks e tecnologias"
        className={cn("mt-5 flex flex-wrap gap-1.5", className)}
      >
        {stacks.map((stack) => (
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

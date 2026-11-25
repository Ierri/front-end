"use client"

import { Code2, Globe2, LockKeyhole } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ProfileName({
  name,
  isPrivate,
  technologyCount,
}: {
  name: string
  isPrivate: boolean
  technologyCount?: number
}) {
  const visibility = isPrivate ? "Perfil privado" : "Perfil público"
  const VisibilityIcon = isPrivate ? LockKeyhole : Globe2
  const technologies =
    technologyCount === 1 ? "1 tecnologia" : `${technologyCount} tecnologias`

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <h1 className="min-w-0 text-3xl font-bold tracking-tight break-words sm:text-4xl">
        {name}
      </h1>
      <TooltipProvider>
        <div className="flex shrink-0 items-center justify-center gap-1 self-center text-muted-foreground">
          <Tooltip>
            <TooltipTrigger
              type="button"
              aria-label={visibility}
              className="inline-flex size-7 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-ring"
            >
              <VisibilityIcon aria-hidden="true" className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{visibility}</TooltipContent>
          </Tooltip>
          {technologyCount !== undefined && (
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label={technologies}
                className="inline-flex size-7 items-center justify-center rounded-md focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Code2 aria-hidden="true" className="size-4" />
              </TooltipTrigger>
              <TooltipContent>{technologies}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}

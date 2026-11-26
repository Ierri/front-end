"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function FeedThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Moon aria-hidden="true" className="size-5 dark:hidden" />
        <Sun aria-hidden="true" className="hidden size-5 dark:block" />
        <span className="sr-only">Alterar modo</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        Alterar modo
      </TooltipContent>
    </Tooltip>
  )
}

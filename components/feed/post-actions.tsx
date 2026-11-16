"use client"

import { ArrowBigDown, ArrowBigUp, Bookmark } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PostActionsProps = {
  score: number
  authorName: string
  className?: string
}

export function PostActions({
  score,
  authorName,
  className,
}: PostActionsProps) {
  const { status, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"

  function handleUnavailableAction() {
    if (!isAuthenticated) requireAuth()
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div
        role="group"
        aria-label={`Votação demonstrativa da publicação de ${authorName}`}
        className="inline-flex items-center rounded-full border border-border"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dar upvote"
          aria-disabled={isAuthenticated}
          onClick={handleUnavailableAction}
          className="rounded-full"
        >
          <ArrowBigUp />
        </Button>
        <span
          aria-label={`${score} votos`}
          className="min-w-10 text-center text-sm font-semibold tabular-nums"
        >
          {score}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dar downvote"
          aria-disabled={isAuthenticated}
          onClick={handleUnavailableAction}
          className="rounded-full"
        >
          <ArrowBigDown />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        aria-label="Salvar publicação"
        aria-disabled={isAuthenticated}
        onClick={handleUnavailableAction}
        className="rounded-full"
      >
        <Bookmark />
      </Button>
    </div>
  )
}

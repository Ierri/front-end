"use client"

import { useState } from "react"
import { ArrowBigDown, ArrowBigUp, Bookmark } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PostActionsProps = {
  score: number
  authorName: string
  source?: "demo" | "api"
  className?: string
}

export function PostActions({
  score,
  authorName,
  source,
  className,
}: PostActionsProps) {
  const { status, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"
  const [notice, setNotice] = useState("")

  function handleUnavailableAction(action: "votar" | "salvar") {
    if (!isAuthenticated) {
      requireAuth()
      return
    }
    if (source === "api") {
      setNotice(
        action === "votar"
          ? "Os votos ainda não estão disponíveis."
          : "Os itens salvos ainda não estão disponíveis."
      )
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div
          role="group"
          aria-label={`Votação da publicação de ${authorName}`}
          className="inline-flex items-center rounded-full border border-border"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dar upvote"
            aria-disabled={isAuthenticated}
            onClick={() => handleUnavailableAction("votar")}
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
            onClick={() => handleUnavailableAction("votar")}
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
          onClick={() => handleUnavailableAction("salvar")}
          className="rounded-full"
        >
          <Bookmark />
        </Button>
      </div>
      {notice && (
        <p role="status" className="text-xs text-muted-foreground">
          {notice}
        </p>
      )}
    </div>
  )
}

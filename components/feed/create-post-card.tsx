"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"

export function CreatePostCard() {
  const { status, user, requireAuth } = useAuth()
  const isAuthenticated = status === "authenticated"

  return (
    <article>
      <Link
        href="/feed/post/new"
        onClick={(event) => {
          if (!requireAuth()) event.preventDefault()
        }}
        aria-label="Criar uma nova publicação"
        className="group flex min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors duration-200 ease-out outline-none hover:border-primary/40 hover:bg-accent/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:p-5"
      >
        {isAuthenticated && user && (
          <FeedUserAvatar
            src={user.avatarUrl}
            name={user.name}
            size="large"
            fictitious={false}
          />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-6 font-semibold transition-colors duration-200 group-hover:text-accent-foreground group-focus-visible:text-accent-foreground motion-reduce:transition-none sm:text-base">
            {isAuthenticated ? "Criar uma publicação" : "Entre para postar!"}
          </p>
          <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
            {isAuthenticated
              ? "Compartilhe seu próximo projeto e receba feedback."
              : "Faça login na sua conta ou crie uma para começar a mostrar seu trabalho para as pessoas!"}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition-colors duration-200 group-hover:text-accent-foreground group-focus-visible:text-accent-foreground motion-reduce:transition-none"
        >
          <Plus className="size-6" strokeWidth={1.75} />
        </span>
      </Link>
    </article>
  )
}

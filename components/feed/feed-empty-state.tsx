"use client"

import Link from "next/link"
import { ArrowUpRight, MousePointer2, Plus } from "lucide-react"

import { CreatePostTrigger } from "@/components/feed/create-post-trigger"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FeedEmptyStateProps = {
  title: string
  description: string
  explore?: boolean
}

export function FeedEmptyState({
  title,
  description,
  explore = false,
}: FeedEmptyStateProps) {
  const actionClass = cn(buttonVariants(), "mt-6 min-h-11 gap-2 px-5")

  return (
    <section className="flex flex-col items-center px-6 py-12 text-center sm:px-10 sm:py-16">
      <div aria-hidden="true" className="relative mb-8 h-44 w-64">
        {/* Projeto web e versão mobile. */}
        <div className="absolute top-3 left-1 w-52 -rotate-6 overflow-hidden rounded-xl border border-muted-foreground/30 bg-card">
          <div className="flex h-7 items-center gap-1 border-b border-border bg-secondary px-3">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="size-1.5 rounded-full bg-muted-foreground/40" />
            <span className="ml-auto h-1 w-10 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="grid grid-cols-[1fr_4.5rem] items-center gap-3 p-4">
            <div className="space-y-2">
              <div className="h-1 w-7 rounded-full bg-accent-foreground/60" />
              <div className="space-y-1">
                <div className="h-2 w-16 rounded-sm bg-foreground/80" />
                <div className="h-2 w-12 rounded-sm bg-foreground/80" />
              </div>
              <div className="space-y-1 pt-1">
                <div className="h-1 w-full rounded-full bg-muted-foreground/35" />
                <div className="h-1 w-4/5 rounded-full bg-muted-foreground/35" />
              </div>
              <div className="mt-3 h-4 w-11 rounded-md bg-primary" />
            </div>
            <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-accent">
              <div className="absolute -top-3 -right-4 size-16 rounded-full border border-accent-foreground/20" />
              <div className="h-14 w-9 rotate-12 rounded-t-full bg-primary" />
              <div className="absolute bottom-3 left-2 size-7 rounded-full border-4 border-accent bg-foreground" />
            </div>
          </div>
        </div>

        <div className="absolute top-9 right-0 w-16 rotate-6 rounded-2xl border border-muted-foreground/40 bg-card p-1.5 ring-4 ring-background">
          <div className="mx-auto mb-2 h-1 w-5 rounded-full bg-muted-foreground/50" />
          <div className="flex h-14 items-end justify-center overflow-hidden rounded-lg bg-accent">
            <div className="h-11 w-7 rounded-t-full bg-primary" />
          </div>
          <div className="mt-2 h-1.5 w-9 rounded-sm bg-foreground/80" />
          <div className="mt-1 h-1 w-7 rounded-full bg-muted-foreground/35" />
          <div className="mt-2 h-3 w-full rounded bg-primary" />
          <div className="mx-auto mt-2 h-0.5 w-4 rounded-full bg-muted-foreground/50" />
        </div>

        <MousePointer2
          className="absolute right-16 bottom-0 size-6 fill-primary text-foreground"
          strokeWidth={1.5}
        />
      </div>

      <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
        Share<span className="text-primary">.</span> Review
        <span className="text-primary">.</span> Inspire
        <span className="text-primary">.</span>
      </p>
      <h2 className="mt-3 max-w-md font-heading text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-6 text-pretty text-muted-foreground">
        {description}
      </p>

      {explore ? (
        <Link href="/feed" className={actionClass}>
          Explorar projetos
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <CreatePostTrigger className={actionClass}>
          <Plus aria-hidden="true" className="size-4" />
          Compartilhar um projeto
        </CreatePostTrigger>
      )}
    </section>
  )
}

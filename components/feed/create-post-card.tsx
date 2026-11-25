"use client"

import { ImageIcon, Plus } from "lucide-react"

import { CreatePostTrigger } from "@/components/feed/create-post-trigger"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CreatePostCard() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border">
      <div aria-hidden="true" className="relative isolate h-40 overflow-hidden">
        <div className="absolute top-11 left-[17%] h-20 w-[58%] -rotate-12 rounded-lg border border-border bg-secondary" />
        <div className="absolute top-11 left-[27%] w-[54%] rotate-6 rounded-lg border border-border bg-card p-2.5">
          <div className="mb-2 flex gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="size-1.5 rounded-full bg-muted-foreground/35" />
            <span className="size-1.5 rounded-full bg-muted-foreground/35" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="grid h-12 place-items-center rounded bg-accent text-accent-foreground">
              <ImageIcon className="size-5" strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 rounded bg-foreground/75" />
              <div className="h-1 w-4/5 rounded bg-muted-foreground/45" />
              <div className="h-1 w-3/5 rounded bg-muted-foreground/45" />
              <div className="h-2.5 w-8 rounded bg-primary" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            No que você está trabalhando?
          </h2>
          <p className="text-sm leading-5 text-muted-foreground">
            Mostre uma interface ou um protótipo e receba feedback da
            comunidade.
          </p>
        </div>
        <CreatePostTrigger
          className={cn(
            buttonVariants({ size: "lg" }),
            "min-h-10 w-full gap-2"
          )}
        >
          <Plus aria-hidden="true" />
          Compartilhar projeto
        </CreatePostTrigger>
      </div>
    </section>
  )
}

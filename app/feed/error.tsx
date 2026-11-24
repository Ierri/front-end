"use client"

import { Button } from "@/components/ui/button"

export default function FeedError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[50svh] w-full max-w-3xl items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <h1 className="text-xl">Não foi possível abrir o feed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente em alguns instantes.
        </p>
        <Button className="mt-5" variant="outline" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </main>
  )
}

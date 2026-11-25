import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { FeedHeader } from "@/components/feed/feed-header"
import { SavedPostsFeed } from "@/components/profile/saved-posts-feed"

export const metadata: Metadata = {
  title: "Salvos",
  description: "Publicações que você salvou no Ierri.",
  robots: { index: false, follow: false },
}

export default function SavedPostsPage() {
  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-20 sm:px-6 sm:py-10">
        <ProtectedRoute returnTo="/profile/saved">
          <div className="space-y-6">
            <div>
              <Link
                href="/profile"
                className="mb-5 inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Voltar ao perfil
              </Link>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Salvos
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Referências e projetos que você guardou para consultar depois.
              </p>
            </div>

            <SavedPostsFeed />
          </div>
        </ProtectedRoute>
      </main>
    </div>
  )
}

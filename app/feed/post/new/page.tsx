import type { Metadata } from "next"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { CreatePostForm } from "@/components/feed/create-post-form"

export const metadata: Metadata = {
  title: "Criar publicação",
  description: "Compartilhe imagens e vídeos do seu projeto no Ierri.",
}

export default function NewPostPage() {
  return (
    <ProtectedRoute returnTo="/feed/post/new">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <CreatePostForm />
      </main>
    </ProtectedRoute>
  )
}

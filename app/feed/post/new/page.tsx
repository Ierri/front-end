import type { Metadata } from "next"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { CreatePostModal } from "@/components/feed/create-post-modal"
import FeedPage from "../../page"

export const metadata: Metadata = {
  title: "Criar publicação",
  description: "Compartilhe imagens e vídeos do seu projeto no Ierri.",
}

export default function NewPostPage() {
  return (
    <ProtectedRoute returnTo="/feed/post/new">
      <FeedPage searchParams={Promise.resolve({})} />
      <CreatePostModal direct />
    </ProtectedRoute>
  )
}

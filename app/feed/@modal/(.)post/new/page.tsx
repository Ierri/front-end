import { ProtectedRoute } from "@/components/auth/protected-route"
import { CreatePostModal } from "@/components/feed/create-post-modal"

export default function InterceptedNewPostPage() {
  return (
    <ProtectedRoute returnTo="/feed/post/new">
      <CreatePostModal />
    </ProtectedRoute>
  )
}

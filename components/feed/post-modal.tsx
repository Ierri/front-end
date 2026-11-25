import { FeedRouteModal } from "@/components/feed/feed-route-modal"
import { PostDetail } from "@/components/feed/post-detail"
import type { FeedPostData } from "@/lib/feed/types"

export function PostModal({
  post,
  onClose,
  closeHref,
}: {
  post: FeedPostData
  onClose?: () => void
  closeHref?: string
}) {
  return (
    <FeedRouteModal
      onClose={onClose}
      closeHref={closeHref}
      title={`Publicação de ${post.author.name}`}
      closeLabel="Fechar publicação"
      popupClassName="h-dvh overflow-hidden md:h-[min(90svh,58rem)] md:w-[min(96vw,92rem)]"
    >
      <PostDetail post={post} modal />
    </FeedRouteModal>
  )
}

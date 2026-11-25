import { FeedRouteModal } from "@/components/feed/feed-route-modal"
import { PostDetail } from "@/components/feed/post-detail"
import type { FeedPostData } from "@/lib/feed/types"

export function PostModal({
  post,
  onClose,
}: {
  post: FeedPostData
  onClose?: () => void
}) {
  return (
    <FeedRouteModal
      onClose={onClose}
      title={`Publicação de ${post.author.name}`}
      closeLabel="Fechar publicação"
      popupClassName="h-dvh overflow-hidden md:h-[min(90svh,58rem)] md:w-[min(96vw,92rem)]"
    >
      {(close) => <PostDetail post={post} modal onClose={close} />}
    </FeedRouteModal>
  )
}

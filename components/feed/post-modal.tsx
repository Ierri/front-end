import { FeedRouteModal } from "@/components/feed/feed-route-modal"
import { PostDetail } from "@/components/feed/post-detail"
import type { FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

export function PostModal({ post }: { post: FeedPostData }) {
  const hasSingleMedia = post.media.length === 1

  return (
    <FeedRouteModal
      title={`Publicação de ${post.author.name}`}
      closeLabel="Fechar publicação"
      popupClassName={cn(
        "overflow-hidden md:w-[min(96vw,92rem)]",
        hasSingleMedia
          ? "md:h-auto md:max-h-[min(92svh,58rem)]"
          : "md:h-[min(92svh,58rem)]"
      )}
    >
      <PostDetail post={post} modal />
    </FeedRouteModal>
  )
}

"use client"

import { CreatePostForm } from "@/components/feed/create-post-form"
import { FeedRouteModal } from "@/components/feed/feed-route-modal"

export function CreatePostModal() {
  return (
    <FeedRouteModal
      title="Criar publicação"
      closeLabel="Fechar criação de publicação"
      popupClassName="overflow-y-auto md:h-auto md:max-h-[86svh] md:w-[min(90vw,46rem)]"
    >
      {(close) => <CreatePostForm variant="modal" onExit={close} />}
    </FeedRouteModal>
  )
}

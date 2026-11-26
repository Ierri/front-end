"use client"

import { useRouter } from "next/navigation"

import { CreatePostForm } from "@/components/feed/create-post-form"
import {
  FeedRouteModal,
  postComposerPopupClassName,
} from "@/components/feed/feed-route-modal"

export function CreatePostModal({
  onClose,
  direct = false,
}: {
  onClose?: () => void
  direct?: boolean
}) {
  const router = useRouter()
  const close = onClose ?? (direct ? () => router.replace("/feed") : undefined)

  return (
    <FeedRouteModal
      onClose={close}
      title="Criar publicação"
      closeLabel="Fechar criação de publicação"
      popupClassName={postComposerPopupClassName}
    >
      {(close) => (
        <CreatePostForm variant="modal" onExit={close} onPublished={onClose} />
      )}
    </FeedRouteModal>
  )
}

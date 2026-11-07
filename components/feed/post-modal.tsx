"use client"

import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import { PostDetail } from "@/components/feed/post-detail"
import type { FeedPostData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

export function PostModal({ post }: { post: FeedPostData }) {
  const router = useRouter()
  const hasSingleMedia = post.media.length === 1

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-overlay backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6">
          <Dialog.Popup
            className={cn(
              "relative h-svh w-screen overflow-hidden bg-background shadow-2xl outline-none lg:w-[min(96vw,92rem)] lg:rounded-2xl",
              hasSingleMedia
                ? "lg:h-auto lg:max-h-[min(92svh,58rem)]"
                : "lg:h-[min(92svh,58rem)]"
            )}
          >
            <Dialog.Title className="sr-only">
              Publicação de {post.author.name}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar publicação"
              className="absolute top-3 right-3 z-20 flex size-10 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
            <PostDetail post={post} modal />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

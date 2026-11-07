"use client"

import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import { CreatePostForm } from "@/components/feed/create-post-form"

export function CreatePostModal() {
  const router = useRouter()

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-overlay backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 lg:p-6">
          <Dialog.Popup className="relative h-svh w-screen overflow-y-auto bg-background shadow-2xl outline-none md:h-auto md:max-h-[86svh] md:w-[min(90vw,46rem)] md:rounded-2xl">
            <Dialog.Title className="sr-only">Criar publicação</Dialog.Title>
            <Dialog.Close
              aria-label="Fechar criação de publicação"
              className="absolute top-3 right-3 z-20 flex size-10 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-sm transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
            <CreatePostForm
              variant="modal"
              onCancel={() => router.back()}
              onComplete={() => router.back()}
            />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

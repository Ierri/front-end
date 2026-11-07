"use client"

import type { ReactNode } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type FeedRouteModalProps = {
  title: string
  closeLabel: string
  popupClassName?: string
  children: ReactNode | ((close: () => void) => ReactNode)
}

export function FeedRouteModal({
  title,
  closeLabel,
  popupClassName,
  children,
}: FeedRouteModalProps) {
  const router = useRouter()
  const close = () => router.back()

  return (
    <Dialog.Root
      defaultOpen
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-overlay backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 lg:p-6">
          <Dialog.Popup
            className={cn(
              "relative h-svh w-screen bg-background shadow-2xl outline-none md:rounded-2xl",
              popupClassName
            )}
          >
            <Dialog.Title className="sr-only">{title}</Dialog.Title>
            <Dialog.Close
              aria-label={closeLabel}
              className="absolute top-3 right-4 z-20 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </Dialog.Close>
            {typeof children === "function" ? children(close) : children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

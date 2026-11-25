"use client"

import type { ReactNode } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export const postComposerPopupClassName =
  "overflow-hidden [&:has([data-stack-picker-open])]:[filter:blur(4px)_brightness(0.55)] md:h-auto md:max-h-[86svh] md:w-[min(90vw,46rem)]"

type FeedRouteModalProps = {
  onClose?: () => void
  closeHref?: string
  open?: boolean
  elevated?: boolean
  title: string
  closeLabel: string
  popupClassName?: string
  children: ReactNode | ((close: () => void) => ReactNode)
}

export function FeedRouteModal({
  onClose,
  closeHref,
  open,
  elevated = false,
  title,
  closeLabel,
  popupClassName,
  children,
}: FeedRouteModalProps) {
  const router = useRouter()
  const close =
    onClose ??
    (() => {
      if (closeHref) router.replace(closeHref)
      else router.back()
    })

  return (
    <Dialog.Root
      open={open}
      defaultOpen={open === undefined ? true : undefined}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 bg-overlay backdrop-blur-[2px]",
            elevated ? "z-[110]" : "z-[90]"
          )}
        />
        <Dialog.Viewport
          className={cn(
            "fixed inset-0 flex items-center justify-center p-0 md:p-4 lg:p-6",
            elevated ? "z-[120]" : "z-[100]"
          )}
        >
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

"use client"

import { Dialog } from "@base-ui/react/dialog"

import { Button } from "@/components/ui/button"

type AuthRequiredDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  onContinue,
}: AuthRequiredDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-overlay backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none">
            <Dialog.Title className="text-xl font-semibold">
              Entre para participar
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              Faça login ou crie sua conta para publicar, votar, comentar e
              salvar projetos.
            </Dialog.Description>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Dialog.Close
                render={
                  <Button type="button" variant="ghost">
                    Agora não
                  </Button>
                }
              />
              <Button type="button" onClick={onContinue}>
                Entrar ou criar conta
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

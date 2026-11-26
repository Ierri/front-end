"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import { LoaderCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { CreatePostForm } from "@/components/feed/create-post-form"
import {
  FeedRouteModal,
  postComposerPopupClassName,
} from "@/components/feed/feed-route-modal"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  recordPostDelete,
  recordPostEdit,
} from "@/lib/feed/post-mutation-store"
import type { FeedPostData, FeedVisibility } from "@/lib/feed/types"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import {
  publicationsService,
  type PublicationMediaEdit,
} from "@/services/publications"

type PostOwnerMenuProps = {
  post: FeedPostData
  onDeleted?: () => void
  className?: string
}

export function PostOwnerMenu({
  post,
  onDeleted,
  className,
}: PostOwnerMenuProps) {
  const router = useRouter()
  const { status, user, refreshSession, requireAuth } = useAuth()

  const canManage =
    post.source === "api" &&
    status === "authenticated" &&
    Boolean(user?.id) &&
    user?.id === post.author.id

  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const mountedRef = useRef(true)
  const deletingRef = useRef(false)
  const pendingAuthPromptRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pendingAuthPromptRef.current = false
    }
  }, [])

  useEffect(() => {
    if (pendingAuthPromptRef.current && status === "unauthenticated") {
      pendingAuthPromptRef.current = false
      requireAuth()
    }
  }, [requireAuth, status])

  if (!canManage) return null

  function handleAuthFailure(caught: unknown): string | null {
    if (!isAuthApiError(caught)) return null
    if (mountedRef.current) {
      if (status === "unauthenticated") {
        requireAuth()
      } else {
        pendingAuthPromptRef.current = true
        void refreshSession()
      }
    }
    return "Sua sessão expirou. Entre novamente para continuar."
  }

  function handleOpenEdit() {
    setMenuOpen(false)
    setEditOpen(true)
  }

  function handleOpenDelete() {
    setMenuOpen(false)
    setDeleteError("")
    setDeleteOpen(true)
  }

  async function submitEdit(
    content: string,
    visibility: FeedVisibility,
    stackIds: string[] | undefined,
    media: PublicationMediaEdit[] | undefined,
    signal: AbortSignal
  ) {
    try {
      const updated = await publicationsService.update(post.id, {
        signal,
        stackIds,
        media,
        ...(content !== post.content.trim() ? { content } : {}),
        ...(visibility !== (post.visibility ?? "publico")
          ? { visibility }
          : {}),
      })
      recordPostEdit(post.id, {
        content: updated.content,
        visibility: updated.visibility ?? visibility,
        editedAt: updated.editedAt ?? null,
        stacks: updated.stacks,
        media: updated.media,
      })
      if (mountedRef.current) setEditOpen(false)
      router.refresh()
    } catch (error) {
      if (signal.aborted) return
      const authMessage = handleAuthFailure(error)
      if (authMessage) throw new Error(authMessage)
      throw error
    }
  }

  async function handleConfirmDelete() {
    if (deletingRef.current) return
    deletingRef.current = true
    setIsDeleting(true)
    setDeleteError("")

    try {
      await publicationsService.remove(post.id)
      recordPostDelete(post.id)
      if (mountedRef.current) {
        setDeleteOpen(false)
      }
      onDeleted?.()
      router.refresh()
    } catch (caught) {
      const authMessage = handleAuthFailure(caught)
      if (mountedRef.current) {
        setDeleteError(
          authMessage ??
            (caught instanceof Error
              ? caught.message
              : "Não foi possível excluir a publicação.")
        )
      }
    } finally {
      deletingRef.current = false
      if (mountedRef.current) {
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger
          aria-label="Opções da publicação"
          className={cn(
            "relative z-10 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
            className
          )}
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={6}
          positionerClassName="z-[105]"
          className="w-48 gap-1 p-1.5"
        >
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Pencil
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            Editar publicação
          </button>
          <button
            type="button"
            onClick={handleOpenDelete}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Excluir publicação
          </button>
        </PopoverContent>
      </Popover>

      <FeedRouteModal
        open={editOpen}
        onClose={() => {
          if (!isSaving) setEditOpen(false)
        }}
        title="Editar publicação"
        closeLabel="Fechar edição de publicação"
        popupClassName={postComposerPopupClassName}
        elevated
      >
        {editOpen && (
          <CreatePostForm
            variant="modal"
            onExit={() => setEditOpen(false)}
            edit={{ post, onSave: submitEdit, onSavingChange: setIsSaving }}
          />
        )}
      </FeedRouteModal>

      <Dialog.Root
        open={deleteOpen}
        onOpenChange={(nextOpen) => {
          if (isDeleting) return
          setDeleteOpen(nextOpen)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[110] bg-overlay backdrop-blur-[2px]" />
          <Dialog.Viewport className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <Dialog.Popup className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none">
              <Dialog.Title className="text-xl font-semibold">
                Excluir publicação?
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                Esta ação não pode ser desfeita. A publicação será removida do
                feed e do seu perfil.
              </Dialog.Description>

              {deleteError && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  {deleteError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => void handleConfirmDelete()}
                >
                  {isDeleting ? (
                    <>
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                      />
                      Excluindo…
                    </>
                  ) : (
                    "Excluir"
                  )}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

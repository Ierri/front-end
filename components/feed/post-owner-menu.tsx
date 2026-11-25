"use client"

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { Dialog } from "@base-ui/react/dialog"
import { useRouter } from "next/navigation"
import {
  Globe2,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  recordPostDelete,
  recordPostEdit,
} from "@/lib/feed/post-mutation-store"
import type { FeedPostData, FeedVisibility } from "@/lib/feed/types"
import { cn } from "@/lib/utils"
import { isAuthApiError } from "@/services/api"
import { publicationsService } from "@/services/publications"

type PostOwnerMenuProps = {
  post: FeedPostData
  onDeleted?: () => void
  className?: string
}

const visibilityOptions: Array<{
  value: FeedVisibility
  label: string
  icon: typeof Globe2
}> = [
  { value: "publico", label: "Público", icon: Globe2 },
  { value: "seguidores", label: "Apenas seguidores", icon: Users },
]

export function PostOwnerMenu({
  post,
  onDeleted,
  className,
}: PostOwnerMenuProps) {
  const router = useRouter()
  const textareaId = useId()
  const { status, user, refreshSession, requireAuth } = useAuth()

  const canManage =
    post.source === "api" &&
    status === "authenticated" &&
    Boolean(user?.id) &&
    user?.id === post.author.id

  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [draftContent, setDraftContent] = useState(post.content)
  const [draftVisibility, setDraftVisibility] = useState<FeedVisibility>(
    post.visibility ?? "publico"
  )
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState("")

  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const mountedRef = useRef(true)
  const savingRef = useRef(false)
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

  const initialVisibility: FeedVisibility = post.visibility ?? "publico"
  const trimmedDraft = draftContent.trim()
  const contentChanged = trimmedDraft !== post.content.trim()
  const visibilityChanged = draftVisibility !== initialVisibility
  const hasChanges = contentChanged || visibilityChanged

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
    setDraftContent(post.content)
    setDraftVisibility(post.visibility ?? "publico")
    setEditError("")
    setEditOpen(true)
  }

  function handleOpenDelete() {
    setMenuOpen(false)
    setDeleteError("")
    setDeleteOpen(true)
  }

  async function submitEdit() {
    if (savingRef.current) return
    if (!trimmedDraft) {
      setEditError("A descrição da publicação não pode ficar vazia.")
      return
    }
    if (!hasChanges) {
      setEditOpen(false)
      return
    }

    savingRef.current = true
    setIsSaving(true)
    setEditError("")

    try {
      const updated = await publicationsService.update(post.id, {
        ...(contentChanged ? { content: trimmedDraft } : {}),
        ...(visibilityChanged ? { visibility: draftVisibility } : {}),
      })
      recordPostEdit(post.id, {
        content: updated.content,
        visibility: updated.visibility ?? draftVisibility,
        editedAt: updated.editedAt ?? new Date().toISOString(),
      })
      if (mountedRef.current) {
        setEditOpen(false)
      }
      router.refresh()
    } catch (caught) {
      const authMessage = handleAuthFailure(caught)
      if (mountedRef.current) {
        setEditError(
          authMessage ??
            (caught instanceof Error
              ? caught.message
              : "Não foi possível salvar as alterações da publicação.")
        )
      }
    } finally {
      savingRef.current = false
      if (mountedRef.current) {
        setIsSaving(false)
      }
    }
  }

  function handleEditFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitEdit()
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault()
      void submitEdit()
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

      <Dialog.Root
        open={editOpen}
        onOpenChange={(nextOpen) => {
          if (isSaving) return
          setEditOpen(nextOpen)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[110] bg-overlay backdrop-blur-[2px]" />
          <Dialog.Viewport className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <Dialog.Popup className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none">
              <Dialog.Title className="text-xl font-semibold">
                Editar publicação
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
                Atualize a descrição ou a visibilidade do seu projeto.
              </Dialog.Description>

              <form onSubmit={handleEditFormSubmit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={textareaId}>Descrição</Label>
                  <Textarea
                    id={textareaId}
                    value={draftContent}
                    onChange={(event) => setDraftContent(event.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    rows={5}
                    disabled={isSaving}
                    placeholder="Conte sobre sua interface, decisões de design e aprendizados…"
                    className="min-h-28 resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Visibilidade
                  </span>
                  <div
                    role="group"
                    aria-label="Visibilidade da publicação"
                    className="grid grid-cols-2 gap-2"
                  >
                    {visibilityOptions.map((option) => {
                      const Icon = option.icon
                      const selected = draftVisibility === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={isSaving}
                          aria-pressed={selected}
                          onClick={() => setDraftVisibility(option.value)}
                          className={cn(
                            "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 motion-reduce:transition-none",
                            selected
                              ? "border-primary/50 bg-accent text-accent-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon aria-hidden="true" className="size-3.5" />
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {editError && (
                  <p role="alert" className="text-xs text-destructive">
                    {editError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={() => setEditOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving || !trimmedDraft || !hasChanges}
                  >
                    {isSaving ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-4 animate-spin motion-reduce:animate-none"
                        />
                        Salvando…
                      </>
                    ) : (
                      "Salvar alterações"
                    )}
                  </Button>
                </div>
              </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

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

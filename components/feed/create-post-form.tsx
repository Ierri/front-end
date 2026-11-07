"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import {
  CreatePostMediaPicker,
  type SelectedPostMedia,
} from "@/components/feed/create-post-media-picker"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { currentFeedUser } from "@/lib/feed/mock-data"
import { cn } from "@/lib/utils"

type CreatePostFormProps = {
  variant?: "page" | "modal"
  onExit?: () => void
}

function isSupportedMedia(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/")
}

function releasePreviewUrls(media: SelectedPostMedia[]) {
  media.forEach((item) => URL.revokeObjectURL(item.previewUrl))
}

export function CreatePostForm({
  variant = "page",
  onExit,
}: CreatePostFormProps) {
  const router = useRouter()
  const mediaTriggerRef = useRef<HTMLButtonElement>(null)
  const mediaRef = useRef<SelectedPostMedia[]>([])
  const completionTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<SelectedPostMedia[]>([])
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      releasePreviewUrls(mediaRef.current)
      mediaRef.current = []
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
    }
  }, [])

  function replaceMedia(nextMedia: SelectedPostMedia[]) {
    mediaRef.current = nextMedia
    setMedia(nextMedia)
  }

  function addFiles(files: File[]) {
    if (isSubmitting) return

    const supportedFiles = files.filter(isSupportedMedia)
    setError(
      supportedFiles.length === files.length
        ? ""
        : "Alguns arquivos foram ignorados. Selecione apenas imagens ou vídeos."
    )

    if (!supportedFiles.length) return

    const additions = supportedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    replaceMedia([...mediaRef.current, ...additions])
  }

  function removeMedia(id: string) {
    const item = mediaRef.current.find((entry) => entry.id === id)
    if (item) URL.revokeObjectURL(item.previewUrl)
    replaceMedia(mediaRef.current.filter((entry) => entry.id !== id))
    setError("")
  }

  function clearMedia() {
    releasePreviewUrls(mediaRef.current)
    replaceMedia([])
  }

  function exitComposer() {
    if (onExit) onExit()
    else router.push("/feed")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!media.length) {
      setError("Adicione pelo menos uma imagem ou um vídeo para publicar.")
      mediaTriggerRef.current?.focus()
      return
    }

    setError("")
    setIsSubmitting(true)
    setStatus("Publicação criada para demonstração.")

    completionTimerRef.current = setTimeout(() => {
      clearMedia()
      setContent("")
      exitComposer()
    }, 700)
  }

  return (
    <form
      noValidate
      aria-label="Criar publicação"
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
      className={cn(
        "min-h-0 bg-background",
        variant === "page" && "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <section className="min-w-0 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <FeedUserAvatar
            src={currentFeedUser.avatar}
            name={currentFeedUser.name}
            size="large"
          />
          <div>
            <h1 className="text-lg leading-tight font-semibold">
              Criar publicação
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Compartilhe sua interface
            </p>
          </div>
        </div>

        <Label htmlFor="post-content" className="sr-only">
          Texto da publicação
        </Label>
        <div className="mt-6 rounded-xl bg-muted p-5 transition-colors focus-within:ring-2 focus-within:ring-ring/50">
          <Textarea
            id="post-content"
            name="content"
            value={content}
            disabled={isSubmitting}
            placeholder="Conte um pouco sobre o projeto... (opcional)"
            onChange={(event) => setContent(event.target.value)}
            className={cn(
              "resize-none rounded-none border-0 bg-transparent p-0 text-base leading-7 shadow-none focus-visible:ring-0 dark:bg-transparent",
              variant === "modal" ? "min-h-44" : "min-h-64"
            )}
          />
        </div>

        <CreatePostMediaPicker
          media={media}
          error={error}
          disabled={isSubmitting}
          variant={variant}
          triggerRef={mediaTriggerRef}
          onFilesSelected={addFiles}
          onRemove={removeMedia}
        />
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
          {status}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={exitComposer}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </footer>
    </form>
  )
}

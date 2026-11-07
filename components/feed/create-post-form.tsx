"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { Camera, ImageIcon, Trash2, Video } from "lucide-react"

import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { currentFeedUser } from "@/lib/feed/mock-data"
import { cn } from "@/lib/utils"

type SelectedMedia = {
  id: string
  file: File
  previewUrl: string
}

type CreatePostFormProps = {
  variant?: "page" | "modal"
  onCancel?: () => void
  onComplete?: () => void
}

function isSupportedMedia(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/")
}

export function CreatePostForm({
  variant = "page",
  onCancel,
  onComplete,
}: CreatePostFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<SelectedMedia[]>([])
  const completionTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<SelectedMedia[]>([])
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    mediaRef.current = media
  }, [media])

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current)
    }
  }, [])

  function addFiles(files: FileList | File[]) {
    const selectedFiles = Array.from(files)
    const supportedFiles = selectedFiles.filter(isSupportedMedia)

    if (supportedFiles.length !== selectedFiles.length) {
      setError(
        "Alguns arquivos foram ignorados. Selecione apenas imagens ou vídeos."
      )
    } else {
      setError("")
    }

    if (!supportedFiles.length) return

    setMedia((current) => [
      ...current,
      ...supportedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ])
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  function removeMedia(id: string) {
    setMedia((current) => {
      const item = current.find((entry) => entry.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return current.filter((entry) => entry.id !== id)
    })
    setError("")
  }

  function closeComposer() {
    if (onCancel) onCancel()
    else router.push("/feed")
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    if (!media.length) {
      setError("Adicione pelo menos uma imagem ou um vídeo para publicar.")
      inputRef.current?.focus()
      return
    }

    setError("")
    setIsSubmitting(true)
    setStatus("Publicação criada para demonstração.")

    completionTimerRef.current = setTimeout(() => {
      media.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setMedia([])
      setContent("")
      if (onComplete) onComplete()
      else router.push("/feed")
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

        <div className="mt-5">
          <div className="mb-3">
            <h2 className="font-heading text-sm font-semibold">Mídia</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Adicione imagens ou vídeos do seu projeto.
            </p>
          </div>

          <input
            ref={inputRef}
            id="post-media"
            name="media"
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={isSubmitting}
            aria-describedby={error ? "post-media-error" : "post-media-help"}
            aria-invalid={!!error}
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="flex gap-3 overflow-x-auto pb-2">
            <div
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(event.relatedTarget as Node)
                ) {
                  setIsDragging(false)
                }
              }}
              onDrop={handleDrop}
              className={cn(
                "shrink-0 rounded-2xl border-2 border-dashed border-input bg-secondary/50 transition-colors",
                variant === "modal" ? "size-28" : "size-32",
                isDragging && "border-ring bg-accent"
              )}
            >
              <Label
                htmlFor="post-media"
                className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center outline-none focus-within:ring-2 focus-within:ring-ring"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
                  <Camera aria-hidden="true" className="size-5" />
                </span>
                <span
                  id="post-media-help"
                  className="text-xs leading-4 font-medium"
                >
                  Adicionar mídia
                </span>
              </Label>
            </div>

            {media.length > 0 && (
              <ul aria-label="Mídias selecionadas" className="flex gap-3">
                {media.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "group relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted",
                      variant === "modal" ? "size-28" : "size-32"
                    )}
                  >
                    {item.file.type.startsWith("image/") ? (
                      // A URL local existe somente durante a pré-visualização.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={`Prévia de ${item.file.name}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.previewUrl}
                        aria-label={`Prévia de ${item.file.name}`}
                        muted
                        playsInline
                        className="size-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-2 left-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm">
                      {item.file.type.startsWith("image/") ? (
                        <ImageIcon aria-hidden="true" className="size-3.5" />
                      ) : (
                        <Video aria-hidden="true" className="size-3.5" />
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={isSubmitting}
                      aria-label={`Remover ${item.file.name}`}
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-2 right-2 rounded-full bg-background/95 shadow-sm"
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <p
              id="post-media-error"
              role="alert"
              className="mt-2 text-sm leading-5 font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </div>
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
            onClick={closeComposer}
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

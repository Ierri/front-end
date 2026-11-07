"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Globe2 } from "lucide-react"

import {
  CreatePostMediaPicker,
  type SelectedPostMedia,
} from "@/components/feed/create-post-media-picker"
import { FeedUserAvatar } from "@/components/feed/feed-user-avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getPostMediaKind, type PostMediaKind } from "@/lib/feed/media"
import { currentFeedUser } from "@/lib/feed/mock-data"
import { cn } from "@/lib/utils"

type CreatePostFormProps = {
  variant?: "page" | "modal"
  onExit?: () => void
}

let mediaIdSequence = 0

function createMediaId() {
  mediaIdSequence += 1
  return `post-media-${Date.now()}-${mediaIdSequence}`
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

    const supportedFiles: Array<{ file: File; kind: PostMediaKind }> = []
    for (const file of files) {
      const kind = getPostMediaKind(file)
      if (kind) supportedFiles.push({ file, kind })
    }
    setError(
      supportedFiles.length === files.length
        ? ""
        : "Alguns arquivos foram ignorados. Selecione apenas imagens ou vídeos."
    )

    if (!supportedFiles.length) return

    const additions = supportedFiles.map(({ file, kind }) => ({
      id: createMediaId(),
      file,
      kind,
      previewUrl: URL.createObjectURL(file),
    }))
    replaceMedia([...mediaRef.current, ...additions])
  }

  function selectCover(id: string) {
    if (isSubmitting) return
    const selected = mediaRef.current.find((item) => item.id === id)
    if (!selected) return
    replaceMedia([
      selected,
      ...mediaRef.current.filter((item) => item.id !== id),
    ])
  }

  function removeMedia(id: string) {
    if (isSubmitting) return
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
        "flex min-h-0 flex-col bg-background",
        variant === "modal"
          ? "h-full md:max-h-[86svh]"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <header className="shrink-0 border-b border-border px-5 py-5 sm:px-6">
        <h1 className="pr-12 text-lg font-semibold">Criar publicação</h1>
        <p className="mt-1 pr-12 text-sm text-muted-foreground">
          Mostre o que você está criando.
        </p>
      </header>

      <section className="min-h-0 min-w-0 space-y-6 overflow-y-auto p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <FeedUserAvatar
            src={currentFeedUser.avatar}
            name={currentFeedUser.name}
            size="large"
          />
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold">
              {currentFeedUser.name}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe2 aria-hidden="true" className="size-3.5" />
              Publicação pública
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3">
            <Label
              htmlFor="post-content"
              className="font-heading text-sm font-semibold"
            >
              Sobre o projeto
            </Label>
            <p
              id="post-content-help"
              className="mt-1 text-xs leading-5 text-muted-foreground"
            >
              Uma boa descrição ajuda a comunidade a dar feedback.
            </p>
          </div>
          <div className="rounded-xl border border-input bg-muted/40 p-4 transition-colors focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20">
            <Textarea
              id="post-content"
              name="content"
              rows={3}
              value={content}
              disabled={isSubmitting}
              aria-describedby="post-content-help"
              placeholder="O que você criou? Conte a ideia, os desafios ou em que gostaria de receber feedback."
              onChange={(event) => setContent(event.target.value)}
              className="field-sizing-content max-h-60 min-h-24 resize-none overflow-y-auto rounded-none border-0 bg-transparent p-0 text-base leading-7 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
          {content.length > 0 && (
            <div className="mt-2 text-right text-xs leading-5 text-muted-foreground">
              <span className="tabular-nums">
                {content.length}{" "}
                {content.length === 1 ? "caractere" : "caracteres"}
              </span>
            </div>
          )}
        </div>

        <CreatePostMediaPicker
          media={media}
          error={error}
          disabled={isSubmitting}
          variant={variant}
          triggerRef={mediaTriggerRef}
          onFilesSelected={addFiles}
          onRemove={removeMedia}
          onSelectCover={selectCover}
        />
      </section>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-5 py-4 sm:px-6">
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-4"
            disabled={isSubmitting}
            onClick={exitComposer}
          >
            Cancelar
          </Button>
          <Button type="submit" className="h-10 px-5" disabled={isSubmitting}>
            {isSubmitting ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </footer>
    </form>
  )
}

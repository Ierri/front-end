"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Globe2 } from "lucide-react"

import {
  CreatePostMediaPicker,
  type SelectedPostMedia,
} from "@/components/feed/create-post-media-picker"
import { CreatePostStacks } from "@/components/feed/create-post-stacks"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getPostMediaKind, type PostMediaKind } from "@/lib/feed/media"
import type { FeedPostData, FeedVisibility } from "@/lib/feed/types"
import { cn } from "@/lib/utils"
import {
  publicationsService,
  type PublicationMediaEdit,
} from "@/services/publications"

type CreatePostFormProps = {
  variant?: "page" | "modal"
  onExit?: () => void
  onPublished?: () => void
  edit?: {
    post: FeedPostData
    onSave: (
      content: string,
      visibility: FeedVisibility,
      stackIds: string[] | undefined,
      media: PublicationMediaEdit[] | undefined,
      signal: AbortSignal
    ) => Promise<void>
    onSavingChange: (saving: boolean) => void
  }
}

let mediaIdSequence = 0
const maxMediaCount = 10
const maxMediaSize = 25_000_000
const maxTotalMediaSize = 200_000_000
const uploadConcurrency = 3

function createMediaId() {
  mediaIdSequence += 1
  return `post-media-${Date.now()}-${mediaIdSequence}`
}

function releasePreviewUrls(media: SelectedPostMedia[]) {
  media.forEach((item) => {
    if (item.file) URL.revokeObjectURL(item.previewUrl)
  })
}

async function uploadMedia(
  files: File[],
  signal: AbortSignal,
  onProgress: (completed: number) => void
) {
  const references = new Array<string>(files.length)
  let nextIndex = 0
  let completed = 0
  async function worker() {
    while (nextIndex < files.length) {
      const index = nextIndex
      nextIndex += 1
      const uploaded = await publicationsService.upload(files[index], signal)
      references[index] = uploaded.referencia
      completed += 1
      onProgress(completed)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(uploadConcurrency, files.length) }, () =>
      worker()
    )
  )
  return references
}

export function CreatePostForm({
  variant = "page",
  onExit,
  onPublished,
  edit,
}: CreatePostFormProps) {
  const router = useRouter()
  const contentId = useId()
  const title = edit ? "Editar publicação" : "Criar publicação"
  const mediaTriggerRef = useRef<HTMLButtonElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const [stackPickerOpen, setStackPickerOpen] = useState(false)
  const [stackIds, setStackIds] = useState<string[]>(
    () => edit?.post.stacks?.map(({ id }) => id) ?? []
  )
  const [content, setContent] = useState(edit?.post.content ?? "")
  const [visibility, setVisibility] = useState<FeedVisibility>(
    edit?.post.visibility ?? "publico"
  )
  const [media, setMedia] = useState<SelectedPostMedia[]>(
    () =>
      edit?.post.media.map((item) => ({
        id: item.id,
        name: item.alt,
        size: item.sizeBytes ?? 0,
        kind: item.type,
        previewUrl: item.src,
      })) ?? []
  )
  const mediaRef = useRef(media)
  const [error, setError] = useState("")
  const [contentError, setContentError] = useState("")
  const [requestError, setRequestError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      releasePreviewUrls(mediaRef.current)
      requestRef.current?.abort()
    }
  }, [])

  const stackChanged = Boolean(
    edit &&
    stackIds.join(",") !==
      (edit.post.stacks ?? []).map(({ id }) => id).join(",")
  )
  const mediaChanged = Boolean(
    edit &&
    media.map(({ id }) => id).join(",") !==
      edit.post.media.map(({ id }) => id).join(",")
  )
  const hasEditChanges = Boolean(
    edit &&
    (stackChanged ||
      mediaChanged ||
      content.trim() !== edit.post.content.trim() ||
      visibility !== (edit.post.visibility ?? "publico"))
  )

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
    const rejectedByType = supportedFiles.length !== files.length
    const acceptedBySize = supportedFiles.filter(
      ({ file }) => file.size <= maxMediaSize
    )
    const availableSlots = Math.max(0, maxMediaCount - mediaRef.current.length)
    const accepted = acceptedBySize.slice(0, availableSlots)

    if (rejectedByType) {
      setError("Use apenas JPEG, PNG, WebP, MP4 ou WebM.")
    } else if (acceptedBySize.length !== supportedFiles.length) {
      setError("Cada arquivo pode ter no máximo 25 MB.")
    } else if (accepted.length !== acceptedBySize.length) {
      setError("Você pode adicionar no máximo 10 mídias.")
    } else {
      setError("")
    }

    if (!accepted.length) return

    const additions = accepted.map(({ file, kind }) => ({
      id: createMediaId(),
      file,
      name: file.name,
      size: file.size,
      kind,
      previewUrl: URL.createObjectURL(file),
    }))
    const nextMedia = [...mediaRef.current, ...additions]
    if (
      nextMedia.reduce((total, item) => total + item.size, 0) >
      maxTotalMediaSize
    ) {
      releasePreviewUrls(additions)
      setError("O conjunto de mídias pode ter no máximo 200 MB.")
      return
    }
    replaceMedia(nextMedia)
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
    if (item?.file) URL.revokeObjectURL(item.previewUrl)
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setContentError(
        edit
          ? "A descrição da publicação não pode ficar vazia."
          : "Conte um pouco sobre o projeto antes de publicar."
      )
      document.getElementById(contentId)?.focus()
      return
    }

    if (!media.length) {
      setError("Adicione pelo menos uma imagem ou um vídeo.")
      mediaTriggerRef.current?.focus()
      return
    }

    const files = media.flatMap((item) => (item.file ? [item.file] : []))
    if (edit) {
      if (!hasEditChanges || requestRef.current) return
      const controller = new AbortController()
      requestRef.current = controller
      setIsSubmitting(true)
      edit.onSavingChange(true)
      setContentError("")
      setRequestError("")
      setUploadProgress(0)
      try {
        const references = await uploadMedia(
          files,
          controller.signal,
          setUploadProgress
        )
        let nextReference = 0
        const mediaEdit = mediaChanged
          ? media.map((item) =>
              item.file
                ? { referencia: references[nextReference++] }
                : { id: item.id }
            )
          : undefined
        await edit.onSave(
          trimmedContent,
          visibility,
          stackChanged ? stackIds : undefined,
          mediaEdit,
          controller.signal
        )
      } catch (error) {
        if (!controller.signal.aborted) {
          setRequestError(
            error instanceof Error
              ? error.message
              : "Não foi possível salvar as alterações da publicação."
          )
        }
      } finally {
        requestRef.current = null
        edit.onSavingChange(false)
        if (!controller.signal.aborted) {
          setIsSubmitting(false)
          setUploadProgress(0)
          controller.abort()
        }
      }
      return
    }

    setError("")
    setContentError("")
    setRequestError("")
    setUploadProgress(0)
    setIsSubmitting(true)

    const controller = new AbortController()
    requestRef.current = controller
    try {
      const references = await uploadMedia(
        files,
        controller.signal,
        setUploadProgress
      )
      const post = await publicationsService.create({
        content: trimmedContent,
        mediaReferences: references,
        stackIds,
        signal: controller.signal,
      })
      clearMedia()
      setContent("")
      setStackIds([])
      onPublished?.()
      router.push(`/feed/post/${post.id}`)
      router.refresh()
    } catch (submitError) {
      if (controller.signal.aborted) return
      setRequestError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível publicar. Tente novamente."
      )
      setIsSubmitting(false)
      setUploadProgress(0)
      controller.abort()
    } finally {
      if (!controller.signal.aborted) {
        setIsSubmitting(false)
        setUploadProgress(0)
      }
    }
  }

  return (
    <form
      noValidate
      aria-label={title}
      aria-busy={isSubmitting}
      data-stack-picker-open={stackPickerOpen ? "" : undefined}
      style={
        variant === "page" && stackPickerOpen
          ? { filter: "blur(4px) brightness(0.55)" }
          : undefined
      }
      onSubmit={handleSubmit}
      className={cn(
        "flex min-h-0 flex-col bg-background",
        variant === "modal"
          ? "h-full md:max-h-[86svh]"
          : "overflow-hidden rounded-2xl border border-border"
      )}
    >
      <header className="shrink-0 border-b border-border px-5 py-5 sm:px-6">
        <h1 className="pr-12 text-lg font-semibold">{title}</h1>
      </header>

      <section className="min-h-0 min-w-0 space-y-6 overflow-y-auto p-5 sm:p-6">
        <div>
          <div className="mb-3">
            <Label
              htmlFor={contentId}
              className="font-heading text-sm font-semibold"
            >
              Sobre o projeto
            </Label>
          </div>
          <div className="rounded-xl border border-input bg-muted/40 p-4 transition-colors focus-within:border-ring focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20">
            <Textarea
              id={contentId}
              name="content"
              rows={3}
              value={content}
              disabled={isSubmitting}
              aria-invalid={Boolean(contentError)}
              aria-describedby={contentError ? `${contentId}-error` : undefined}
              placeholder="Descreva o projeto e diga em que gostaria de receber feedback."
              onKeyDown={(event) => {
                if (
                  edit &&
                  (event.metaKey || event.ctrlKey) &&
                  event.key === "Enter"
                ) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              onChange={(event) => {
                setContent(event.target.value)
                setContentError("")
              }}
              className="field-sizing-content max-h-60 min-h-24 resize-none overflow-y-auto rounded-none border-0 bg-transparent p-0 text-base leading-7 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
          {contentError && (
            <p
              id={`${contentId}-error`}
              role="alert"
              className="mt-2 text-sm text-destructive"
            >
              {contentError}
            </p>
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
        <CreatePostStacks
          selected={stackIds}
          onChange={setStackIds}
          onOpenChange={setStackPickerOpen}
          elevated={Boolean(edit)}
          disabled={isSubmitting}
        />
        {requestError && (
          <p
            id="post-request-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {requestError}
          </p>
        )}
      </section>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-5 py-4 sm:px-6">
        {edit ? (
          <Select
            value={visibility}
            disabled={isSubmitting}
            items={[
              { value: "publico", label: "Publicação pública" },
              { value: "seguidores", label: "Apenas seguidores" },
            ]}
            onValueChange={(value) => {
              if (value === "publico" || value === "seguidores") {
                setVisibility(value)
              }
            }}
          >
            <SelectTrigger
              aria-label="Visibilidade da publicação"
              className="data-[size=default]:h-10"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              positionerClassName="z-[130]"
            >
              <SelectItem value="publico">Publicação pública</SelectItem>
              <SelectItem value="seguidores">Apenas seguidores</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe2 aria-hidden="true" className="size-3.5" />
            Publicação pública
          </span>
        )}
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
          <Button
            type="submit"
            className="h-10 px-5"
            disabled={isSubmitting || (Boolean(edit) && !hasEditChanges)}
          >
            {edit
              ? isSubmitting
                ? "Salvando…"
                : "Salvar alterações"
              : isSubmitting
                ? uploadProgress < media.length
                  ? `Enviando ${uploadProgress} de ${media.length}…`
                  : "Publicando…"
                : "Publicar"}
          </Button>
        </div>
      </footer>
    </form>
  )
}

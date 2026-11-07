"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from "react"
import { Camera, ImageIcon, Trash2, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PostMediaKind } from "@/lib/feed/media"
import { cn } from "@/lib/utils"

export type SelectedPostMedia = {
  id: string
  file: File
  kind: PostMediaKind
  previewUrl: string
}

type CreatePostMediaPickerProps = {
  media: SelectedPostMedia[]
  error: string
  disabled: boolean
  variant: "page" | "modal"
  triggerRef: RefObject<HTMLButtonElement | null>
  onFilesSelected: (files: File[]) => void
  onRemove: (id: string) => void
}

export function CreatePostMediaPicker({
  media,
  error,
  disabled,
  variant,
  triggerRef,
  onFilesSelected,
  onRemove,
}: CreatePostMediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function selectFiles(files: FileList | null) {
    if (disabled || !files?.length) return
    onFilesSelected(Array.from(files))
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFiles(event.target.files)
    event.target.value = ""
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (!disabled) onFilesSelected(Array.from(event.dataTransfer.files))
  }

  return (
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
        accept="image/*,video/*,.heic,.heif,.mov,.m4v"
        multiple
        disabled={disabled}
        tabIndex={-1}
        onChange={handleFileChange}
        className="sr-only"
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-describedby={error ? "post-media-error" : "post-media-help"}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDragging(false)
            }
          }}
          onDrop={handleDrop}
          className={cn(
            "flex shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-secondary/50 p-3 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            variant === "modal" ? "size-28" : "size-32",
            isDragging && "border-ring bg-accent"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-foreground">
            <Camera aria-hidden="true" className="size-5" />
          </span>
          <span id="post-media-help" className="text-xs leading-4 font-medium">
            Adicionar mídia
          </span>
        </button>

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
                {item.kind === "image" ? (
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
                  {item.kind === "image" ? (
                    <ImageIcon aria-hidden="true" className="size-3.5" />
                  ) : (
                    <Video aria-hidden="true" className="size-3.5" />
                  )}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={`Remover ${item.file.name}`}
                  onClick={() => onRemove(item.id)}
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
  )
}

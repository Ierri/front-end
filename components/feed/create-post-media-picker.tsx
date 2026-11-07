"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from "react"
import { Camera, ImagePlus, Trash2, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  onSelectCover: (id: string) => void
}

export function CreatePostMediaPicker({
  media,
  error,
  disabled,
  variant,
  triggerRef,
  onFilesSelected,
  onRemove,
  onSelectCover,
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
    <TooltipProvider>
      <div>
        <div className="mb-3">
          <h2 className="flex items-center gap-1 font-heading text-sm font-semibold">
            Mídia
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
            <span className="sr-only">(obrigatória)</span>
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {media.length
              ? "Escolha a capa que vai apresentar seu projeto no feed."
              : "Adicione imagens ou vídeos do seu projeto."}
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

        <div className="flex items-start gap-3 overflow-x-auto pb-2">
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
              media.length === 0
                ? variant === "modal"
                  ? "min-h-28 w-full"
                  : "min-h-32 w-full"
                : variant === "modal"
                  ? "size-28"
                  : "size-32",
              isDragging && "border-ring bg-accent"
            )}
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
          </button>

          {media.length > 0 && (
            <ul aria-label="Mídias selecionadas" className="flex gap-3">
              {media.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "group shrink-0",
                    variant === "modal" ? "w-28" : "w-32"
                  )}
                >
                  <div className="relative isolate aspect-square overflow-hidden rounded-xl bg-muted">
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
                    {index !== 0 && (
                      <Tooltip>
                        <TooltipTrigger
                          render={<Button variant="outline" size="icon-sm" />}
                          type="button"
                          disabled={disabled}
                          aria-label={`Definir ${item.file.name} como capa`}
                          onClick={() => onSelectCover(item.id)}
                          className="absolute bottom-2 left-2 rounded-full bg-background/60 shadow-sm backdrop-blur-md hover:bg-background/80 dark:bg-background/60 dark:hover:bg-background/80"
                        >
                          <ImagePlus aria-hidden="true" className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>Definir como capa</TooltipContent>
                      </Tooltip>
                    )}
                    {index === 0 && (
                      <span className="pointer-events-none absolute top-2 left-2 flex h-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] leading-none font-semibold text-white dark:text-primary-foreground">
                        Capa
                      </span>
                    )}
                    {item.kind === "video" && (
                      <span
                        className={cn(
                          "pointer-events-none absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/60 text-foreground shadow-sm backdrop-blur-md"
                        )}
                      >
                        <Video aria-hidden="true" className="size-3.5" />
                      </span>
                    )}
                    <Tooltip>
                      <TooltipTrigger
                        render={<Button variant="outline" size="icon-sm" />}
                        type="button"
                        disabled={disabled}
                        aria-label={`Remover ${item.file.name}`}
                        onClick={() => onRemove(item.id)}
                        className="absolute right-2 bottom-2 rounded-full bg-background/60 shadow-sm backdrop-blur-md hover:bg-background/80 dark:bg-background/60 dark:hover:bg-background/80"
                      >
                        <Trash2 />
                      </TooltipTrigger>
                      <TooltipContent>Remover mídia</TooltipContent>
                    </Tooltip>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {media[0]
            ? `Capa da publicação: ${media[0].file.name}`
            : "Nenhuma mídia selecionada."}
        </p>

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
    </TooltipProvider>
  )
}

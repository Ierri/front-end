import Image from "next/image"

import type { FeedMediaData } from "@/lib/feed/types"
import { cn } from "@/lib/utils"

type PostMediaGalleryProps = {
  media: FeedMediaData[]
  className?: string
  priority?: boolean
}

export function PostMediaGallery({
  media,
  className,
  priority = false,
}: PostMediaGalleryProps) {
  return (
    <section
      aria-label={`Galeria da publicação, ${media.length} ${
        media.length === 1 ? "mídia" : "mídias"
      }`}
      className={cn("space-y-3 bg-muted p-3", className)}
    >
      {media.map((item, index) => (
        <figure
          key={item.id}
          className="relative aspect-video overflow-hidden rounded-xl bg-background"
        >
          {item.type === "image" ? (
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={priority && index === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          ) : (
            <video
              src={item.src}
              poster={item.poster}
              controls
              preload="metadata"
              aria-label={item.alt}
              className="size-full object-cover"
            />
          )}
        </figure>
      ))}
    </section>
  )
}

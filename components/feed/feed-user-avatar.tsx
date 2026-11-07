import Image from "next/image"

import { cn } from "@/lib/utils"

type FeedUserAvatarProps = {
  src: string
  name: string
  size?: "default" | "large"
  priority?: boolean
}

const avatarSizes = {
  default: { pixels: 40, className: "size-10" },
  large: { pixels: 44, className: "size-11" },
} as const

export function FeedUserAvatar({
  src,
  name,
  size = "default",
  priority = false,
}: FeedUserAvatarProps) {
  const avatarSize = avatarSizes[size]

  return (
    <Image
      src={src}
      alt={`Foto de perfil fictícia de ${name}`}
      width={avatarSize.pixels}
      height={avatarSize.pixels}
      className={cn(
        avatarSize.className,
        "shrink-0 rounded-full object-cover ring-1 ring-border"
      )}
      priority={priority}
    />
  )
}

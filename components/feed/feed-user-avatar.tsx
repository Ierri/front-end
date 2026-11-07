import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { cn } from "@/lib/utils"

type FeedUserAvatarProps = {
  src: string
  name: string
  size?: "small" | "default" | "large" | "story"
  priority?: boolean
}

const avatarSizes = {
  story: { pixels: 64, className: "size-16" },
  small: { pixels: 32, className: "size-8" },
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
    <Avatar className={cn(avatarSize.className, "shrink-0 ring-1 ring-border")}>
      <AvatarImage
        src={src}
        alt={`Foto de perfil fictícia de ${name}`}
        loading={priority ? "eager" : "lazy"}
      />
      <AvatarFallback>
        {name
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")}
      </AvatarFallback>
    </Avatar>
  )
}

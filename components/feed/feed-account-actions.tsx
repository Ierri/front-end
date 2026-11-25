"use client"

import Link from "next/link"
import { LogIn } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"

import { useAuth } from "@/components/auth/auth-provider"
import { NotificationMenu } from "@/components/feed/notification-menu"
import { ProfileMenu } from "@/components/feed/profile-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function FeedAccountActions() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { status } = useAuth()

  if (status === "loading") {
    return (
      <span
        aria-label="Verificando sessão"
        className="size-10 animate-pulse rounded-full bg-muted motion-reduce:animate-none"
      />
    )
  }

  if (status === "authenticated") {
    return (
      <>
        <NotificationMenu />
        <ProfileMenu />
      </>
    )
  }

  const query = searchParams.toString()
  const returnTo = query ? `${pathname}?${query}` : pathname

  return (
    <Link
      href={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
      aria-label="Entrar na sua conta"
      className="inline-flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <Avatar className="size-10">
        <AvatarFallback>
          <LogIn aria-hidden="true" className="size-5" />
        </AvatarFallback>
      </Avatar>
    </Link>
  )
}

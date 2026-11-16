"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { useAuth } from "@/components/auth/auth-provider"
import { NotificationMenu } from "@/components/feed/notification-menu"
import { ProfileMenu } from "@/components/feed/profile-menu"

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
      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      Entrar
    </Link>
  )
}

"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth/auth-provider"
import { safeReturnTo } from "@/lib/auth/return-to"

export function ProtectedRoute({
  children,
  returnTo,
}: {
  children: ReactNode
  returnTo: string
}) {
  const router = useRouter()
  const { status } = useAuth()
  const destination = safeReturnTo(returnTo)

  useEffect(() => {
    if (status === "unauthenticated" || status === "error") {
      router.replace(`/auth?returnTo=${encodeURIComponent(destination)}`)
      return
    }

    if (status !== "loading") return

    const timeout = window.setTimeout(() => {
      router.replace(`/auth?returnTo=${encodeURIComponent(destination)}`)
    }, 12_000)

    return () => window.clearTimeout(timeout)
  }, [destination, router, status])

  if (status !== "authenticated") {
    return (
      <p
        role="status"
        className="p-8 text-center text-sm text-muted-foreground"
      >
        {status === "loading"
          ? "Verificando sua sessão…"
          : "Redirecionando para entrar…"}
      </p>
    )
  }

  return children
}

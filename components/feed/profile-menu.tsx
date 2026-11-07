"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { authService } from "@/services/auth"
import type { AuthUser } from "@/services/auth.types"

export function ProfileMenu() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    authService
      .me()
      .then((session) => {
        if (active) setUser(session)
      })
      .catch((error: unknown) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Não foi possível verificar sua sessão."
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [attempt])

  async function logout() {
    if (leaving) return
    setLeaving(true)
    setError("")
    try {
      await authService.logout()
      setUser(null)
      router.replace("/auth")
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível sair. Tente novamente."
      )
      setLeaving(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Abrir menu do perfil"
        className="flex cursor-pointer items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Avatar className="size-10">
          {user?.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={`Foto de ${user.name}`} />
          )}
          <AvatarFallback>
            {user ? (
              user.name
                .split(" ")
                .filter(Boolean)
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
            ) : (
              <UserRound aria-hidden="true" className="size-5" />
            )}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-72 max-w-[calc(100vw-2rem)] p-4"
        aria-busy={loading || leaving}
      >
        <PopoverHeader>
          <PopoverTitle>
            {loading ? "Verificando sessão…" : (user?.name ?? "Sua conta")}
          </PopoverTitle>
          <PopoverDescription>
            {user
              ? "Acesse seu perfil e suas publicações salvas."
              : "Entre para compartilhar e interagir com a comunidade."}
          </PopoverDescription>
        </PopoverHeader>
        {error && (
          <p role="alert" className="text-xs leading-5 text-destructive">
            {error}
          </p>
        )}
        {!loading && user && (
          <div className="-mx-2 space-y-1">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-2 py-2.5"
            >
              <UserRound aria-hidden="true" className="size-4" />
              Meu perfil
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-2 py-2.5"
            >
              <Bookmark aria-hidden="true" className="size-4" />
              Salvos
            </Button>
            <div className="mx-2 my-2 border-t border-border" />
            <Button
              type="button"
              variant="destructive"
              disabled={leaving}
              onClick={logout}
              className="h-10 w-full justify-center gap-2 rounded-lg"
            >
              {leaving ? "Saindo…" : "Sair da conta"}
            </Button>
          </div>
        )}
        {!loading &&
          !user &&
          (error ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError("")
                setLoading(true)
                setAttempt((value) => value + 1)
              }}
            >
              Tentar novamente
            </Button>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Entrar
            </Link>
          ))}
      </PopoverContent>
    </Popover>
  )
}

"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bookmark, UserRound } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function ProfileMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout: endSession } = useAuth()
  const [open, setOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState("")
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const isProfileActive = pathname === "/profile"
  const isSavedActive = pathname === "/profile/saved"

  function handleNavigateClick(event: MouseEvent<HTMLAnchorElement>) {
    if (leaving) {
      event.preventDefault()
      return
    }
    setOpen(false)
  }

  async function logout() {
    if (leaving) return
    setLeaving(true)
    setError("")
    try {
      await endSession()
      if (!mountedRef.current) return
      setOpen(false)
      router.replace("/auth")
      router.refresh()
    } catch (caught) {
      if (!mountedRef.current) return
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível sair. Tente novamente."
      )
      setLeaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        aria-busy={leaving}
      >
        <PopoverHeader>
          <PopoverTitle>{user?.name ?? "Sua conta"}</PopoverTitle>
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
        {user && (
          <div className="-mx-2 space-y-1">
            <Link
              href="/profile"
              aria-current={isProfileActive ? "page" : undefined}
              aria-disabled={leaving || undefined}
              tabIndex={leaving ? -1 : undefined}
              onClick={handleNavigateClick}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-auto w-full justify-start gap-3 px-2 py-2.5",
                isProfileActive
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
                  : "hover:bg-foreground/10 dark:hover:bg-foreground/10",
                leaving && "pointer-events-none opacity-50"
              )}
            >
              <UserRound aria-hidden="true" className="size-4" />
              Meu perfil
            </Link>
            <Link
              href="/profile/saved"
              aria-current={isSavedActive ? "page" : undefined}
              aria-disabled={leaving || undefined}
              tabIndex={leaving ? -1 : undefined}
              onClick={handleNavigateClick}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-auto w-full justify-start gap-3 px-2 py-2.5",
                isSavedActive
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent"
                  : "hover:bg-foreground/10 dark:hover:bg-foreground/10",
                leaving && "pointer-events-none opacity-50"
              )}
            >
              <Bookmark aria-hidden="true" className="size-4" />
              Salvos
            </Link>
            <div className="mx-2 my-2 border-t border-border" />
            <Button
              type="button"
              variant="destructive"
              disabled={leaving}
              onClick={logout}
              className="h-10 w-full justify-center gap-2 rounded-lg hover:bg-destructive/20 dark:hover:bg-destructive/30"
            >
              {leaving ? "Saindo…" : "Sair da conta"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

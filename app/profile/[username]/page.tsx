"use client"

import { useCallback, useEffect, useState } from "react"
import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import Link from "next/link"
import { useParams } from "next/navigation"
import { LoaderCircle, LockKeyhole, RefreshCw, UserMinus, UserRound, UserRoundPlus, UserRoundX } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { FeedHeader } from "@/components/feed/feed-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ProfileName } from "@/components/profile/profile-name"
import { useProfileColor } from "@/components/profile/use-profile-color"
import { ProfileProjectGrid } from "@/components/profile/profile-project-grid"
import type { FeedPostData } from "@/lib/feed/types"
import { ApiError } from "@/services/api"
import { publicationsService } from "@/services/publications"
import { profilesService, type Profile } from "@/services/profiles"

function initials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const { user, status, requireAuth } = useAuth()
  const [followBusy, setFollowBusy] = useState(false)
  const [followError, setFollowError] = useState("")
  const profileColor = useProfileColor(profile?.avatarUrl)
  const [projects, setProjects] = useState<FeedPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [projectsError, setProjectsError] = useState("")

  const loadProfile = useCallback(async ({ background = false } = {}) => {
    if (!username) return
    if (!background) {
      setLoading(true)
      setError("")
    }
    setProjectsError("")
    try {
      const current = await profilesService.byUsername(username)
      setProfile(current)
      if (current.visibilidadePerfil === "privado" && !current.contadores) {
        setProjects([])
        return
      }
      try {
        const page = await publicationsService.list({ authorId: current.id })
        setProjects(page.items)
      } catch (caught) {
        setProjectsError(caught instanceof Error ? caught.message : "Não foi possível carregar as publicações.")
      }
    } catch (caught) {
      if (background) throw caught
      if (caught instanceof ApiError && caught.code === "USER_NOT_FOUND") {
        setError("Este perfil não existe ou não está disponível.")
      } else {
        setError(caught instanceof Error ? caught.message : "Não foi possível carregar este perfil.")
      }
    } finally {
      if (!background) setLoading(false)
    }
  }, [username])

  useEffect(() => {
    if (!username) return
    const task = window.setTimeout(() => void loadProfile(), 0)
    return () => window.clearTimeout(task)
  }, [loadProfile, username])

  const retryProjects = useCallback(async () => {
    if (!profile) return
    setProjectsError("")
    try {
      const page = await publicationsService.list({ authorId: profile.id })
      setProjects(page.items)
    } catch (caught) {
      setProjectsError(caught instanceof Error ? caught.message : "Não foi possível carregar as publicações.")
    }
  }, [profile])

  const following = profile?.relacao?.enviada ?? "nenhuma"

  const followLabel = followBusy
    ? "Atualizando…"
    : following === "aceita"
      ? "Deixar de seguir"
      : following === "pendente"
        ? "Cancelar solicitação"
        : "Seguir"

  const FollowIcon = followBusy
    ? LoaderCircle
    : following === "aceita"
      ? UserMinus
      : following === "pendente"
        ? UserRoundX
        : UserRoundPlus

  async function toggleFollow() {
    if (!profile || followBusy || !requireAuth()) return
    setFollowBusy(true)
    setFollowError("")
    try {
      await profilesService.setFollowing(profile.id, following === "nenhuma")
      await loadProfile({ background: true })
    } catch (caught) {
      setFollowError(caught instanceof Error ? caught.message : "Não foi possível atualizar o seguimento.")
    } finally {
      setFollowBusy(false)
    }
  }

  const isPrivate = profile?.visibilidadePerfil === "privado" && !profile.contadores

  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {loading ? (
          <div role="status" className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-5 animate-spin" />Carregando perfil…</div>
        ) : error ? (
          <div role="alert" className="flex min-h-72 flex-col items-center justify-center text-center"><p className="text-sm text-muted-foreground">{error}</p><Link href="/feed" className="mt-4 text-sm font-medium text-accent-foreground hover:underline">Voltar ao feed</Link></div>
        ) : profile ? (
          <>
            <section className="relative isolate border-b border-border py-8 sm:py-12"
              style={profileColor ? { backgroundImage: `linear-gradient(to right, var(--background), transparent 18%, transparent 82%, var(--background)), linear-gradient(to bottom, color-mix(in srgb, ${profileColor} 18%, var(--background)), var(--background))` } : undefined}>
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
                <Avatar className="size-24 shrink-0 ring-4 ring-secondary sm:size-32"><AvatarImage src={profile.avatarUrl ?? undefined} alt={`Foto de ${profile.nome}`} /><AvatarFallback className="text-2xl font-semibold">{initials(profile.nome) || <UserRound className="size-8" />}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                  <p className="mb-1 text-sm font-medium text-primary">@{profile.username}</p>
                  <ProfileName name={profile.nome} isPrivate={profile.visibilidadePerfil === "privado"} technologyCount={isPrivate ? undefined : (profile.stacks?.length ?? 0)} />
                    </div>
                    {status !== "loading" && user?.id !== profile.id && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={<Button size="icon-lg" variant={following === "nenhuma" ? "default" : "outline"} />}
                            type="button"
                            aria-label={followLabel}
                            disabled={followBusy}
                            onClick={() => void toggleFollow()}
                          >
                            <FollowIcon aria-hidden="true" className={followBusy ? "animate-spin motion-reduce:animate-none" : undefined} />
                          </TooltipTrigger>
                          <TooltipContent>{followLabel}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {followError && <p role="alert" className="mt-2 text-sm text-destructive">{followError}</p>}
                  {isPrivate ? (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground"><LockKeyhole className="size-5 shrink-0" /><p>Este perfil é privado. As publicações e informações adicionais não estão disponíveis.</p></div>
                  ) : (
                    <>
                      <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">{profile.biografia || "Este criador ainda não adicionou uma biografia."}</p>
                      <ProfileStackBadges stacks={profile.stacks} sortByCategory />
                      <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">{[{ label: "Projetos", value: profile.contadores?.publicacoes ?? projects.length }, { label: "Seguidores", value: profile.contadores?.seguidores ?? 0 }, { label: "Seguindo", value: profile.contadores?.seguindo ?? 0 }].map((stat) => <div key={stat.label} className="flex items-baseline gap-2"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="font-heading text-lg font-semibold tabular-nums">{stat.value}</dd></div>)}</dl>
                    </>
                  )}
                </div>
              </div>
            </section>
            {!isPrivate ? <section aria-label={`Publicações de ${profile.nome}`} className="pt-8"><h2 className="mb-6 font-heading text-2xl font-semibold">Projetos</h2>{projectsError ? <div role="alert" className="py-10 text-center"><p className="text-sm text-destructive">{projectsError}</p><Button variant="outline" className="mt-4" onClick={() => void retryProjects()}><RefreshCw />Tentar novamente</Button></div> : <ProfileProjectGrid posts={projects} />}</section> : null}
          </>
        ) : null}
      </main>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { BriefcaseBusiness, Code2, Globe2, LoaderCircle, LockKeyhole, RefreshCw, UserRound } from "lucide-react"

import { FeedHeader } from "@/components/feed/feed-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  const [projects, setProjects] = useState<FeedPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [projectsError, setProjectsError] = useState("")

  const loadProfile = useCallback(async () => {
    if (!username) return
    setLoading(true)
    setError("")
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
      if (caught instanceof ApiError && caught.code === "USER_NOT_FOUND") {
        setError("Este perfil não existe ou não está disponível.")
      } else {
        setError(caught instanceof Error ? caught.message : "Não foi possível carregar este perfil.")
      }
    } finally {
      setLoading(false)
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
            <section className="border-b border-border py-8 sm:py-12">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
                <Avatar className="size-24 shrink-0 ring-4 ring-secondary sm:size-32"><AvatarImage src={profile.avatarUrl ?? undefined} alt={`Foto de ${profile.nome}`} /><AvatarFallback className="text-2xl font-semibold">{initials(profile.nome) || <UserRound className="size-8" />}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm font-medium text-accent-foreground">@{profile.username}</p>
                  <h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl">{profile.nome}</h1>
                  {isPrivate ? (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground"><LockKeyhole className="size-5 shrink-0" /><p>Este perfil é privado. As publicações e informações adicionais não estão disponíveis.</p></div>
                  ) : (
                    <>
                      <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-base">{profile.biografia || "Este criador ainda não adicionou uma biografia."}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><Globe2 className="size-4" />Perfil público</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4" />{profile.stacks?.length ?? 0} tecnologias</span></div>
                      <section className="mt-6" aria-label="Tecnologias"><h2 className="mb-3 text-sm font-semibold">Stacks e tecnologias</h2>{profile.stacks?.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{profile.stacks.map((stack) => <li key={stack.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"><span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-accent-foreground">{stack.iconeUrl ? <Image src={stack.iconeUrl} alt="" width={24} height={24} unoptimized className="size-6 object-contain" /> : <Code2 className="size-5" />}</span><span className="truncate text-sm font-semibold">{stack.nome}</span></li>)}</ul> : <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">Nenhuma tecnologia informada.</p>}</section>
                      <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4 border-t border-border pt-5">{[{ label: "Projetos", value: profile.contadores?.publicacoes ?? projects.length }, { label: "Seguidores", value: profile.contadores?.seguidores ?? 0 }, { label: "Seguindo", value: profile.contadores?.seguindo ?? 0 }].map((stat) => <div key={stat.label} className="flex items-baseline gap-2"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="font-heading text-lg font-semibold tabular-nums">{stat.value}</dd></div>)}</dl>
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

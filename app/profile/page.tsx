"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bookmark, BriefcaseBusiness, Code2, Globe2, LoaderCircle, MapPin, PencilLine, Plus, RefreshCw, UserRound } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { FeedHeader } from "@/components/feed/feed-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileProjectGrid } from "@/components/profile/profile-project-grid"
import { publicationsService } from "@/services/publications"
import { profilesService, type Profile } from "@/services/profiles"
import type { FeedPostData } from "@/lib/feed/types"

function initials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
}

function ProfilePageContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<FeedPostData[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [error, setError] = useState("")
  const [projectsError, setProjectsError] = useState("")

  const loadProjects = useCallback(async (authorId: string, nextCursor?: string | null) => {
    setProjectsLoading(true)
    setProjectsError("")
    try {
      const page = await publicationsService.list({ authorId, cursor: nextCursor })
      setProjects((current) => nextCursor ? [...current, ...page.items.filter((item) => !current.some((known) => known.id === item.id))] : page.items)
      setCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (caught) {
      setProjectsError(caught instanceof Error ? caught.message : "Não foi possível carregar as publicações.")
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const data = await profilesService.me()
      setProfile(data)
      await loadProjects(data.id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível carregar seu perfil.")
    } finally {
      setLoading(false)
    }
  }, [loadProjects])

  useEffect(() => {
    const task = window.setTimeout(() => void loadProfile(), 0)
    return () => window.clearTimeout(task)
  }, [loadProfile])

  const stats = [
    { label: "Projetos", value: profile?.contadores?.publicacoes ?? projects.length },
    { label: "Seguidores", value: profile?.contadores?.seguidores ?? 0 },
    { label: "Seguindo", value: profile?.contadores?.seguindo ?? 0 },
  ]

  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {loading ? (
          <div role="status" className="flex min-h-72 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-5 animate-spin" />Carregando perfil…</div>
        ) : error ? (
          <div role="alert" className="flex min-h-72 flex-col items-center justify-center text-center"><p className="text-sm text-destructive">{error}</p><Button className="mt-4" variant="outline" onClick={() => { setLoading(true); setError(""); void loadProfile() }}><RefreshCw />Tentar novamente</Button></div>
        ) : profile ? (
          <>
            <div className="border-b border-border py-8 sm:py-12">
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
                <Avatar className="size-24 shrink-0 ring-4 ring-secondary sm:size-32"><AvatarImage src={profile.avatarUrl ?? undefined} alt={`Foto de ${profile.nome}`} /><AvatarFallback className="text-2xl font-semibold">{initials(profile.nome) || <UserRound className="size-8" />}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="mb-1 text-sm font-medium text-accent-foreground">@{profile.username}</p><h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl">{profile.nome}</h1></div>
                    <div className="flex flex-wrap items-center gap-2"><Link href="/profile/saved" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"><Bookmark aria-hidden="true" className="size-4 text-accent-foreground" />Salvos</Link><Link href="/profile/edit" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"><PencilLine aria-hidden="true" className="size-4 text-accent-foreground" />Editar perfil</Link></div>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{profile.biografia || "Adicione uma biografia para apresentar seu trabalho."}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><Globe2 className="size-4" />Perfil {profile.visibilidadePerfil === "privado" ? "privado" : "público"}</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness className="size-4" />{profile.stacks?.length ?? 0} tecnologias</span></div>
                  <section className="mt-6" aria-label="Tecnologias"><h2 className="mb-3 text-sm font-semibold">Stacks e tecnologias</h2>{profile.stacks?.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{profile.stacks.map((stack) => <li key={stack.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"><span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent text-accent-foreground">{stack.iconeUrl ? <Image src={stack.iconeUrl} alt="" width={24} height={24} unoptimized className="size-6 object-contain" /> : <Code2 className="size-5" />}</span><span className="truncate text-sm font-semibold">{stack.nome}</span></li>)}</ul> : <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">Você ainda não adicionou tecnologias ao perfil.</p>}</section>
                  <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4 border-t border-border pt-5">{stats.map((stat) => <div key={stat.label} className="flex items-baseline gap-2"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="font-heading text-lg font-semibold tabular-nums">{stat.value}</dd></div>)}</dl>
                </div>
              </div>
            </div>
            <section aria-label="Publicações" className="pt-7 sm:pt-9"><Tabs defaultValue="projects" className="gap-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><TabsList variant="line" aria-label="Seções do perfil" className="h-11 w-full justify-start gap-6 border-b border-border p-0 sm:w-auto"><TabsTrigger value="projects" className="h-full flex-none rounded-none px-1 text-sm">Projetos</TabsTrigger><TabsTrigger value="about" className="h-full flex-none rounded-none px-1 text-sm">Sobre</TabsTrigger></TabsList><Link href="/feed/post/new" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"><Plus className="size-4" />Novo projeto</Link></div><TabsContent value="projects" className="mt-0 space-y-6">{projectsError && !projects.length ? <div role="alert" className="py-10 text-center"><p className="text-sm text-destructive">{projectsError}</p><Button variant="outline" className="mt-4" onClick={() => void loadProjects(profile.id)}><RefreshCw />Tentar novamente</Button></div> : projectsLoading && !projects.length ? <div role="status" className="flex min-h-48 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-4 animate-spin" />Carregando publicações…</div> : <><ProfileProjectGrid posts={projects} />{projectsError ? <p role="alert" className="text-center text-sm text-destructive">{projectsError}</p> : null}{hasMore ? <div className="flex justify-center"><Button variant="outline" disabled={projectsLoading} onClick={() => void loadProjects(profile.id, cursor)}>{projectsLoading ? <LoaderCircle className="animate-spin" /> : null}Carregar mais</Button></div> : null}</>}</TabsContent><TabsContent value="about" className="mt-0"><section className="max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"><MapPin className="size-5" /></span><div><p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Perfil profissional</p><h2 className="font-heading text-xl font-semibold">Sobre {profile.nome}</h2></div></div><p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">{profile.biografia || "Ainda não há uma biografia cadastrada."}</p></section></TabsContent></Tabs></section>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return <ProtectedRoute returnTo="/profile"><ProfilePageContent /></ProtectedRoute>
}

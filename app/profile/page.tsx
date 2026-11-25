"use client"

import { useCallback, useEffect, useState } from "react"
import { ProfileStackBadges } from "@/components/profile/profile-stack-badges"
import { CreatePostTrigger } from "@/components/feed/create-post-trigger"
import Link from "next/link"
import { Bookmark, LoaderCircle, Plus, RefreshCw, UserRound } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { FeedHeader } from "@/components/feed/feed-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { ProfileName } from "@/components/profile/profile-name"
import { useProfileColor } from "@/components/profile/use-profile-color"
import { ProfileProjectGrid } from "@/components/profile/profile-project-grid"
import { publicationsService } from "@/services/publications"
import { profilesService, type Profile } from "@/services/profiles"
import type { FeedPostData } from "@/lib/feed/types"

function initials(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()
}

function ProfilePageContent() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const profileColor = useProfileColor(profile?.avatarUrl)
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

  const addProject = (
    <CreatePostTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"><Plus aria-hidden="true" className="size-4" />Adicionar projeto</CreatePostTrigger>
  )

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
            <div className="relative isolate border-b border-border py-8 sm:py-12"
              style={profileColor ? { backgroundImage: `linear-gradient(to right, var(--background), transparent 18%, transparent 82%, var(--background)), linear-gradient(to bottom, color-mix(in srgb, ${profileColor} 18%, var(--background)), var(--background))` } : undefined}>
              <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
                <Avatar className="size-24 shrink-0 ring-4 ring-secondary sm:size-32"><AvatarImage src={profile.avatarUrl ?? undefined} alt={`Foto de ${profile.nome}`} /><AvatarFallback className="text-2xl font-semibold">{initials(profile.nome) || <UserRound className="size-8" />}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="mb-1 text-sm font-medium text-primary">@{profile.username}</p><ProfileName name={profile.nome} isPrivate={profile.visibilidadePerfil === "privado"} technologyCount={profile.stacks?.length ?? 0} /></div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href="/profile/saved" className={buttonVariants({ variant: "outline", className: "h-10 rounded-xl px-4 font-semibold" })}><Bookmark aria-hidden="true" className="size-4 text-accent-foreground" />Salvos</Link>
                      <EditProfileDialog onSaved={setProfile} />
                    </div>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{profile.biografia || "Adicione uma biografia para apresentar seu trabalho."}</p>
                  <ProfileStackBadges stacks={profile.stacks} sortByCategory />
                  <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">{stats.map((stat) => <div key={stat.label} className="flex items-baseline gap-2"><dt className="text-sm text-muted-foreground">{stat.label}</dt><dd className="font-heading text-lg font-semibold tabular-nums">{stat.value}</dd></div>)}</dl>
                </div>
              </div>
            </div>
            <section aria-labelledby="profile-projects" className="space-y-6 pt-7 sm:pt-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="profile-projects" className="font-heading text-2xl font-semibold">Projetos</h2>
                {projects.length > 0 && addProject}
              </div>
              {projectsError && !projects.length ? <div role="alert" className="py-10 text-center"><p className="text-sm text-destructive">{projectsError}</p><Button variant="outline" className="mt-4" onClick={() => void loadProjects(profile.id)}><RefreshCw />Tentar novamente</Button></div> : projectsLoading && !projects.length ? <div role="status" className="flex min-h-48 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-4 animate-spin" />Carregando publicações…</div> : <><ProfileProjectGrid posts={projects} emptyAction={addProject} />{projectsError ? <p role="alert" className="text-center text-sm text-destructive">{projectsError}</p> : null}{hasMore ? <div className="flex justify-center"><Button variant="outline" disabled={projectsLoading} onClick={() => void loadProjects(profile.id, cursor)}>{projectsLoading ? <LoaderCircle className="animate-spin" /> : null}Carregar mais</Button></div> : null}</>}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return <ProtectedRoute returnTo="/profile"><ProfilePageContent /></ProtectedRoute>
}

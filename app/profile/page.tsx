"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Camera,
  CirclePlus,
  Code2,
  Heart,
  Globe2,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PencilLine,
  Plus,
  UserRound,
} from "lucide-react"
import type { TechnologyKey } from "@/lib/feed/types"

import { FeedHeader } from "@/components/feed/feed-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { authService } from "@/services/auth"
import type { AuthUser } from "@/services/auth.types"
import {
  defaultDemoProfile,
  readDemoProfile,
  type DemoProfile,
} from "@/lib/profile/demo-profile"
import { TechnologyIconList } from "@/components/feed/technology-icon-list"
import { feedPosts } from "@/lib/feed/mock-data"

const projectTitles: Record<string, string> = {
  "analytics-studio": "Analytics Studio",
  "wellness-mobile": "Wellness Mobile",
  "commerce-system": "Commerce System",
}

const demoProjects = feedPosts.slice(0, 3).map((post) => ({
  title: projectTitles[post.id] ?? post.id,
  image: post.media[0]?.src ?? "",
  alt: `Projeto ${projectTitles[post.id] ?? post.id}`,
  score: post.score,
  comments: post.comments.length,
  content: post.content,
}))

const demoStats = [
  { label: "Projetos", value: "3" },
  { label: "Seguidores", value: "128" },
  { label: "Seguindo", value: "46" },
]
const unavailableStats = [
  { label: "Projetos", value: "—" },
  { label: "Seguidores", value: "—" },
  { label: "Seguindo", value: "—" },
]
const socialLinks = [
  { key: "website", label: "Site", icon: Globe2 },
  { key: "github", label: "GitHub", icon: Code2 },
  { key: "linkedin", label: "LinkedIn", icon: BriefcaseBusiness },
  { key: "instagram", label: "Instagram", icon: Camera },
] as const
const technologyLabels: Record<TechnologyKey, string> = {
  web: "Desenvolvimento web",
  typescript: "TypeScript",
  database: "Banco de dados",
  mobile: "Mobile",
  react: "React",
  design: "Design",
  "interface-design": "Design de interfaces",
  cloud: "Cloud",
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoProfile, setDemoProfile] = useState<DemoProfile>(defaultDemoProfile)

  useEffect(() => {
    let active = true
    authService
      .me()
      .then((session) => {
        if (active) {
          setUser(session)
          if (!session) setDemoProfile(readDemoProfile())
        }
      })
      .catch(() => {
        // Preview mode keeps the profile reviewable while the API is unavailable.
        if (active) {
          setUser(null)
          setDemoProfile(readDemoProfile())
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="border-b border-border py-8 sm:py-12">
          {loading ? (
            <div
              aria-label="Carregando perfil"
              className="flex min-h-56 items-center justify-center"
            >
              <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-8">
              <div className="relative size-24 shrink-0 sm:size-32">
                <Avatar className="size-full ring-4 ring-secondary">
                  <AvatarImage
                    src={user?.avatarUrl ?? demoProfile.avatarUrl}
                    alt={`Foto de ${user?.name ?? demoProfile.name}`}
                  />
                  <AvatarFallback className="text-2xl font-semibold sm:text-3xl">
                    {initials(user?.name ?? demoProfile.name) || (
                      <UserRound className="size-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href="/feed/post/new"
                  aria-label="Criar nova publicação"
                  title="Criar nova publicação"
                  className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:size-9"
                >
                  <CirclePlus className="size-4 sm:size-[18px]" />
                </Link>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium text-accent-foreground">
                        @{user?.username ?? demoProfile.username}
                      </p>
                    <h1 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">
                      {user?.name ?? demoProfile.name}
                    </h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  {user ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      title="A edição de perfil ainda não está disponível na API."
                      className="h-10 w-full gap-2 rounded-xl px-4 sm:w-auto"
                    >
                      <PencilLine aria-hidden="true" className="size-4 text-accent-foreground" />
                      Editar perfil
                    </Button>
                  ) : (
                    <Link
                      href="/profile/edit"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-accent-foreground/30 hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-auto"
                    >
                      <PencilLine aria-hidden="true" className="size-4 text-accent-foreground" />
                      Editar perfil
                    </Link>
                  )}
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {user?.bio || demoProfile.bio}
                </p>
                {!user && demoProfile.highlightEnabled && demoProfile.highlight.trim() ? (
                  <p className="mt-3 inline-flex rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-foreground">
                    {demoProfile.highlight}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
                  {!user && demoProfile.location ? (
                    <span className="inline-flex items-center gap-2">
                      <Globe2 aria-hidden="true" className="size-4" />
                      {demoProfile.location}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Globe2 aria-hidden="true" className="size-4" />
                      {user ? "Links sociais indisponíveis" : "Adicione sua localização"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <BriefcaseBusiness aria-hidden="true" className="size-4" />
                    {user ? "Tecnologias indisponíveis" : "Tecnologias"}
                  </span>
                </div>

                {!user && demoProfile.technologies.length ? (
                  <TechnologyIconList
                    technologies={demoProfile.technologies}
                    ownerName={demoProfile.name}
                    className="mt-4"
                  />
                ) : null}

                <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4 border-t border-border pt-5">
                  {(user ? unavailableStats : demoStats).map((stat) => (
                    <div key={stat.label} className="flex items-baseline gap-2">
                      <dt className="text-sm text-muted-foreground">
                        {stat.label}
                      </dt>
                      <dd className="font-heading text-lg font-semibold tabular-nums">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>

        <section aria-label="Portfólio do criador" className="pt-7 sm:pt-9">
          <Tabs defaultValue="projects" className="gap-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <TabsList
                variant="line"
                aria-label="Seções do perfil"
                className="h-11 w-full justify-start gap-6 border-b border-border p-0 sm:w-auto"
              >
                <TabsTrigger
                  value="projects"
                  className="h-full flex-none rounded-none px-1 text-sm after:bottom-0 after:bg-primary data-active:text-foreground"
                >
                  Projetos
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="h-full flex-none rounded-none px-1 text-sm after:bottom-0 after:bg-primary data-active:text-foreground"
                >
                  Sobre
                </TabsTrigger>
              </TabsList>
              {user ? (
                <Button
                  type="button"
                  disabled
                  variant="outline"
                  title="A publicação de projetos ainda não está disponível na API."
                  className="gap-2"
                >
                  <Plus aria-hidden="true" />
                  Novo projeto
                </Button>
              ) : null}
            </div>

            <TabsContent value="projects" className="mt-0">
              {!user ? (
                <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {demoProjects.map((project) => (
                    <article key={project.title} className="group min-w-0">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={project.image}
                          alt={project.alt}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-3 pt-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">{project.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Projeto de interface
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {project.content}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart aria-hidden="true" className="size-3.5" />
                          {project.score}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle aria-hidden="true" className="size-3.5" />
                          {project.comments}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-12 text-center">
                <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                  <BriefcaseBusiness aria-hidden="true" className="size-6" />
                </div>
                <h2 className="text-xl font-semibold">
                  {user ? "Seu portfólio começa aqui" : "Projetos do criador"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {user
                    ? "Você ainda não tem projetos publicados. Quando o catálogo de projetos estiver conectado, suas criações aparecerão aqui."
                    : "Os projetos deste perfil aparecerão aqui quando estiverem disponíveis."}
                </p>
                {user ? (
                  <Button
                    type="button"
                    disabled
                    className="mt-5 gap-2"
                    title="A publicação de projetos ainda não está disponível na API."
                  >
                    <Plus aria-hidden="true" />
                    Publicar primeiro projeto
                  </Button>
                ) : null}
              </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.8fr)]">
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <UserRound aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Perfil profissional
                      </p>
                      <h2 className="font-heading text-xl font-semibold">
                        Sobre {user?.name ?? demoProfile.name}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
                    {user?.bio || demoProfile.bio}
                  </p>

                  <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPin aria-hidden="true" className="mt-0.5 size-4 text-accent-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Localização</p>
                        <p className="mt-1 text-sm font-medium">
                          {!user && demoProfile.location ? demoProfile.location : "Não informada"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BriefcaseBusiness aria-hidden="true" className="mt-0.5 size-4 text-accent-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Atuação</p>
                        <p className="mt-1 text-sm font-medium">
                          {user ? "Criador" : "Design de produto"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-border pt-5">
                    <h3 className="text-sm font-semibold">Stacks e tecnologias</h3>
                    {!user && demoProfile.technologies.length ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {demoProfile.technologies.map((technology) => (
                          <li
                            key={technology}
                            className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                          >
                            {technologyLabels[technology]}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Nenhuma tecnologia informada.
                      </p>
                    )}
                  </div>
                </section>

                <aside className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Globe2 aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Links
                      </p>
                      <h2 className="font-heading text-xl font-semibold">
                        Conecte-se
                      </h2>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {!user ? (
                      socialLinks.map(({ key, label, icon: SocialIcon }) => {
                        const href = demoProfile[key]
                        if (!href) return null
                        return (
                          <a
                            key={key}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center gap-3 rounded-xl border border-border px-3.5 py-3 transition-colors hover:border-accent-foreground/30 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            <SocialIcon aria-hidden="true" className="size-4 text-accent-foreground" />
                            <span className="flex-1 text-sm font-medium">{label}</span>
                            <span className="text-xs text-muted-foreground transition-colors group-hover:text-accent-foreground">
                              Acessar
                            </span>
                          </a>
                        )
                      })
                    ) : (
                      <p className="rounded-xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
                        Este perfil ainda não tem links sociais cadastrados.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}

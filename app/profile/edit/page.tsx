"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, LoaderCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { FeedHeader } from "@/components/feed/feed-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  defaultDemoProfile,
  readDemoProfile,
  writeDemoProfile,
  type DemoProfile,
} from "@/lib/profile/demo-profile"
import type { TechnologyKey } from "@/lib/feed/types"

const technologyOptions: { value: TechnologyKey; label: string }[] = [
  { value: "interface-design", label: "Design de interfaces" },
  { value: "design", label: "Design" },
  { value: "web", label: "Desenvolvimento web" },
  { value: "mobile", label: "Mobile" },
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "database", label: "Banco de dados" },
  { value: "cloud", label: "Cloud" },
]

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<DemoProfile>(defaultDemoProfile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setProfile(readDemoProfile())
  }, [])

  function update<K extends keyof DemoProfile>(key: K, value: DemoProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function toggleTechnology(technology: TechnologyKey) {
    setProfile((current) => ({
      ...current,
      technologies: current.technologies.includes(technology)
        ? current.technologies.filter((item) => item !== technology)
        : [...current.technologies, technology],
    }))
  }

  function updatePhoto(file?: File) {
    setError("")
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.")
      return
    }
    if (file.size > 1024 * 1024) {
      setError("A imagem precisa ter até 1 MB para ser salva neste navegador.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") update("avatarUrl", reader.result)
    }
    reader.onerror = () => setError("Não foi possível carregar essa imagem.")
    reader.readAsDataURL(file)
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      writeDemoProfile(profile)
      router.push("/profile")
    } catch {
      setError("Não foi possível salvar neste navegador. Tente novamente.")
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar ao perfil
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Editar perfil
            </h1>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-foreground">
              <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
              @{profile.username}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Atualize as informações que aparecem no perfil de Rafael Lima.
          </p>
        </div>

        <form onSubmit={save} className="space-y-8">
          <section className="rounded-2xl border border-border p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Informações básicas</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-3 sm:col-span-2">
                <Label htmlFor="profile-photo">Foto do perfil</Label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Image
                    src={profile.avatarUrl}
                    alt={`Foto de perfil de ${profile.name}`}
                    width={80}
                    height={80}
                    unoptimized
                    className="size-20 rounded-full border border-border object-cover"
                  />
                  <div className="space-y-2">
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(event) => updatePhoto(event.target.files?.[0])}
                      className="h-10 max-w-md file:mr-3 file:rounded-md file:bg-secondary file:px-3 file:py-1 file:text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP ou GIF · até 1 MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome</Label>
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(event) => update("name", event.target.value)}
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-username">Username</Label>
                <Input
                  id="profile-username"
                  value={profile.username}
                  onChange={(event) =>
                    update("username", event.target.value.replace(/^@/, ""))
                  }
                  maxLength={30}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Será exibido como @{profile.username || "username"}.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-bio">Biografia</Label>
                <Textarea
                  id="profile-bio"
                  value={profile.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  maxLength={240}
                  rows={4}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {profile.bio.length}/240
                </p>
              </div>
              <div className="space-y-3 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <input
                    id="profile-highlight-enabled"
                    type="checkbox"
                    checked={profile.highlightEnabled}
                    onChange={(event) =>
                      update("highlightEnabled", event.target.checked)
                    }
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <div>
                    <Label htmlFor="profile-highlight-enabled">
                      Exibir frase em destaque no perfil
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uma frase curta aparece logo abaixo da biografia.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-highlight">Frase em destaque</Label>
                  <Input
                    id="profile-highlight"
                    value={profile.highlight}
                    onChange={(event) => update("highlight", event.target.value)}
                    maxLength={100}
                    disabled={!profile.highlightEnabled}
                    placeholder="Escreva uma frase curta para o seu perfil"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {profile.highlight.length}/100
                  </p>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-location">Localização</Label>
                <Input
                  id="profile-location"
                  value={profile.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="Cidade, país (opcional)"
                  maxLength={80}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Links sociais</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Adicione endereços completos, incluindo https://.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {([
                ["website", "Site pessoal", "https://seusite.com"],
                ["github", "GitHub", "https://github.com/usuario"],
                ["linkedin", "LinkedIn", "https://linkedin.com/in/usuario"],
                ["instagram", "Instagram", "https://instagram.com/usuario"],
              ] as const).map(([key, label, placeholder]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`profile-${key}`}>{label}</Label>
                  <Input
                    id={`profile-${key}`}
                    type="url"
                    value={profile[key]}
                    onChange={(event) => update(key, event.target.value)}
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Stacks e tecnologias</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Selecione as áreas que quer destacar no perfil.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {technologyOptions.map((technology) => (
                <label
                  key={technology.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={profile.technologies.includes(technology.value)}
                    onChange={() => toggleTechnology(technology.value)}
                    className="size-4 accent-primary"
                  />
                  {technology.label}
                </label>
              ))}
            </div>
          </section>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/profile"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              Cancelar
            </Link>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              Salvar alterações
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            <Check aria-hidden="true" className="mr-1 inline size-3" />
            Os dados ficam salvos apenas neste navegador.
          </p>
        </form>
      </main>
    </div>
  )
}

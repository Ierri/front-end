"use client"

import { useState, useSyncExternalStore, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { FeedHeader } from "@/components/feed/feed-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { technologyCatalog } from "@/components/feed/technology-icon-list"
import { stackIconCatalog, stackIconOptions, type StackIconKey } from "@/lib/profile/stack-icons"
import {
  readDemoProfile,
  writeDemoProfile,
  type CustomProfileStack,
  type DemoProfile,
} from "@/lib/profile/demo-profile"
import type { TechnologyKey } from "@/lib/feed/types"

const technologyOptions: TechnologyKey[] = [
  "interface-design",
  "design",
  "web",
  "mobile",
  "react",
  "typescript",
  "database",
  "cloud",
]

const subscribeToHydration = () => () => {}
const getClientHydrationSnapshot = () => true
const getServerHydrationSnapshot = () => false

export default function EditProfilePage() {
  const router = useRouter()
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  )
  const [profile, setProfile] = useState<DemoProfile>(readDemoProfile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [stackError, setStackError] = useState("")
  const [newStackName, setNewStackName] = useState("")
  const [newStackDescription, setNewStackDescription] = useState("")
  const [newStackIcon, setNewStackIcon] = useState<StackIconKey>("code")

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

  function addCustomStack() {
    const name = newStackName.trim()
    if (!name) {
      setStackError("Digite o nome da stack que deseja adicionar.")
      return
    }
    if (
      profile.customStacks.some(
        (stack) => stack.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      )
    ) {
      setStackError("Essa stack já foi adicionada.")
      return
    }

    const stack: CustomProfileStack = {
      id: `custom-${Date.now()}`,
      name,
      description: newStackDescription.trim(),
      icon: newStackIcon,
    }
    setProfile((current) => ({
      ...current,
      customStacks: [...current.customStacks, stack],
    }))
    setNewStackName("")
    setNewStackDescription("")
    setNewStackIcon("code")
    setStackError("")
  }

  function removeCustomStack(id: string) {
    setProfile((current) => ({
      ...current,
      customStacks: current.customStacks.filter((stack) => stack.id !== id),
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

  if (!hydrated) {
    return (
      <div className="min-h-svh bg-background">
        <FeedHeader />
        <main className="mx-auto flex min-h-72 w-full max-w-4xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <LoaderCircle
            aria-label="Carregando perfil"
            className="size-6 animate-spin text-muted-foreground"
          />
        </main>
      </div>
    )
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
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Stacks e tecnologias</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Escolha as áreas que quer destacar no perfil.
                </p>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                {profile.technologies.length + profile.customStacks.length} item
                {profile.technologies.length + profile.customStacks.length === 1
                  ? ""
                  : "s"} selecionado
                {profile.technologies.length + profile.customStacks.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold">Exibição no perfil</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Escolha como suas stacks aparecem para quem visita seu perfil.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={profile.stackDisplay === "minimal"}
                  onClick={() => update("stackDisplay", "minimal")}
                  className={`rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${profile.stackDisplay === "minimal" ? "border-primary/50 bg-accent/50" : "border-border hover:bg-secondary/70"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">Minimalista</span>
                    {profile.stackDisplay === "minimal" ? (
                      <CheckCircle2 aria-hidden="true" className="size-4 text-accent-foreground" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Mostra apenas os ícones, como na versão compacta anterior.
                  </span>
                  <span aria-hidden="true" className="mt-3 flex items-center gap-3 text-muted-foreground">
                    {profile.technologies.slice(0, 4).map((technology) => {
                      const Icon = technologyCatalog[technology].icon
                      return <Icon key={technology} className="size-4" />
                    })}
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={profile.stackDisplay === "detailed"}
                  onClick={() => update("stackDisplay", "detailed")}
                  className={`rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${profile.stackDisplay === "detailed" ? "border-primary/50 bg-accent/50" : "border-border hover:bg-secondary/70"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">Em destaque</span>
                    {profile.stackDisplay === "detailed" ? (
                      <CheckCircle2 aria-hidden="true" className="size-4 text-accent-foreground" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Mostra cartões com nome e descrição de cada stack.
                  </span>
                  <span aria-hidden="true" className="mt-3 inline-flex rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium">
                    {profile.technologies[0]
                      ? technologyCatalog[profile.technologies[0]].label
                      : "Sua stack"}
                  </span>
                </button>
              </div>
            </div>

            <ul
              aria-label="Selecione stacks e tecnologias"
              className="mt-6 grid gap-3 sm:grid-cols-2"
            >
              {technologyOptions.map((technology) => {
                const selected = profile.technologies.includes(technology)
                const {
                  icon: Icon,
                  label,
                  description,
                } = technologyCatalog[technology]

                return (
                  <li key={technology}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleTechnology(technology)}
                      className={`flex min-h-20 w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${selected ? "border-primary/50 bg-accent/60" : "border-border bg-card hover:bg-secondary/70"}`}
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {description}
                        </span>
                      </span>
                      <CheckCircle2
                        aria-hidden="true"
                        className={`size-5 shrink-0 ${selected ? "text-accent-foreground" : "text-border"}`}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-sm font-semibold">Adicionar uma stack própria</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Crie um item personalizado e escolha um ícone para representá-lo.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="custom-stack-name">Nome da stack</Label>
                  <Input
                    id="custom-stack-name"
                    value={newStackName}
                    onChange={(event) => setNewStackName(event.target.value)}
                    maxLength={40}
                    placeholder="Ex.: Figma, Vue, Acessibilidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-stack-description">Descrição (opcional)</Label>
                  <Input
                    id="custom-stack-description"
                    value={newStackDescription}
                    onChange={(event) => setNewStackDescription(event.target.value)}
                    maxLength={70}
                    placeholder="Uma breve descrição"
                  />
                </div>
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-medium">Ícone</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stackIconOptions.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={label}
                      aria-pressed={newStackIcon === key}
                      title={label}
                      onClick={() => setNewStackIcon(key)}
                      className={`flex size-10 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${newStackIcon === key ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </button>
                  ))}
                </div>
              </fieldset>

              {stackError ? (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {stackError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={addCustomStack}
                className="mt-4 gap-2"
              >
                <Plus aria-hidden="true" className="size-4" />
                Adicionar stack
              </Button>

              {profile.customStacks.length ? (
                <ul aria-label="Stacks próprias adicionadas" className="mt-5 space-y-2">
                  {profile.customStacks.map((stack) => {
                    const Icon = stackIconCatalog[stack.icon]
                    return (
                      <li
                        key={stack.id}
                        className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3"
                      >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{stack.name}</span>
                          {stack.description ? (
                            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                              {stack.description}
                            </span>
                          ) : null}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover ${stack.name}`}
                          onClick={() => removeCustomStack(stack.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
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

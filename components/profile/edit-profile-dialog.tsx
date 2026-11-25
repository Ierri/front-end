"use client"

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import Image from "next/image"
import { ProfileStackIcon } from "@/components/profile/profile-stack-icon"
import {
  Camera,
  Check,
  LoaderCircle,
  PencilLine,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { Dialog } from "@base-ui/react/dialog"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  profilesService,
  type Profile,
  type ProfileStack,
} from "@/services/profiles"

type EditProfileDialogProps = {
  onSaved: (profile: Profile) => void
}

export function EditProfileDialog({ onSaved }: EditProfileDialogProps) {
  const { refreshSession } = useAuth()
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [technologies, setTechnologies] = useState<ProfileStack[]>([])
  const [stackPickerOpen, setStackPickerOpen] = useState(false)
  const [stackQuery, setStackQuery] = useState("")
  const filteredTechnologies = technologies.filter(({ nome }) =>
    nome
      .toLocaleLowerCase("pt-BR")
      .includes(stackQuery.trim().toLocaleLowerCase("pt-BR"))
  )
  const [selectedStackIds, setSelectedStackIds] = useState<string[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState("")
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const avatarPreviewRef = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    let active = true
    Promise.all([profilesService.me(), profilesService.listTechnologies()])
      .then(([current, catalog]) => {
        if (!active) return
        setProfile(current)
        setSelectedStackIds(
          current.stackIds ?? current.stacks?.map((stack) => stack.id) ?? []
        )
        setTechnologies(catalog)
      })
      .catch((caught: unknown) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "Não foi possível carregar os dados do perfil."
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open])

  useEffect(
    () => () => {
      if (avatarPreviewRef.current)
        URL.revokeObjectURL(avatarPreviewRef.current)
    },
    []
  )

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("Escolha uma imagem JPG, PNG ou WEBP.")
      return
    }
    if (file.size > 5_000_000) {
      setAvatarError("A imagem deve ter no máximo 5 MB.")
      return
    }
    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current)
    const preview = URL.createObjectURL(file)
    avatarPreviewRef.current = preview
    setAvatarPreview(preview)
    setAvatarFile(file)
    setAvatarError("")
  }

  function update<
    K extends "nome" | "username" | "biografia" | "visibilidadePerfil",
  >(key: K, value: NonNullable<Profile[K]>) {
    setProfile((current) => (current ? { ...current, [key]: value } : current))
  }

  function toggleStack(id: string) {
    setSelectedStackIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return
    setSaving(true)
    setError("")
    try {
      if (avatarFile) await profilesService.uploadAvatar(avatarFile)
      await profilesService.update({
        nome: profile.nome.trim(),
        username: profile.username.trim().replace(/^@/, "").toLowerCase(),
        biografia: profile.biografia?.trim() || null,
        visibilidadePerfil: profile.visibilidadePerfil ?? "publico",
      })
      await profilesService.replaceStacks(selectedStackIds)
      const updated = await profilesService.me()
      await refreshSession()
      onSaved(updated)
      setSaving(false)
      setOpen(false)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar as alterações."
      )
      setSaving(false)
    }
  }

  function changeOpen(next: boolean) {
    if (saving) return
    if (next) {
      setLoading(true)
      setError("")
      setAvatarFile(null)
      setAvatarError("")
      if (avatarPreviewRef.current)
        URL.revokeObjectURL(avatarPreviewRef.current)
      avatarPreviewRef.current = null
      setAvatarPreview(null)
      setProfile(null)
      setSelectedStackIds([])
      setTechnologies([])
      setStackQuery("")
    }
    if (!next) setStackPickerOpen(false)
    setOpen(next)
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger
        render={
          <Button
            variant="outline"
            className="h-10 rounded-xl px-4 font-semibold"
          />
        }
      >
        <PencilLine
          aria-hidden="true"
          className="size-4 text-accent-foreground"
        />
        Editar perfil
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-overlay backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <Dialog.Popup
            aria-busy={saving}
            style={stackPickerOpen ? { filter: "blur(4px) brightness(0.55)" } : undefined}
            className="relative flex max-h-[calc(100svh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background outline-none sm:max-h-[94svh]"
          >
            <Dialog.Title className="sr-only">Editar perfil</Dialog.Title>
            <Dialog.Description className="sr-only">
              Atualize as informações que aparecem no seu perfil.
            </Dialog.Description>
            <Dialog.Close
              disabled={saving}
              aria-label="Fechar edição de perfil"
              className="absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
            {loading ? (
              <div
                role="status"
                className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"
              >
                <LoaderCircle className="mr-2 size-5 animate-spin" />
                Carregando perfil…
              </div>
            ) : error && !profile ? (
              <div
                role="alert"
                className="py-12 text-center text-sm text-destructive"
              >
                {error}
              </div>
            ) : profile ? (
              <>
                <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
                  <div className="relative isolate min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain">
                    <fieldset
                      disabled={saving}
                      className="min-w-0 space-y-6 p-5 sm:p-6"
                    >
                      <section className="space-y-4">
                        <h2 className="text-lg font-semibold">
                          Informações básicas
                        </h2>
                        <div className="grid gap-5">
                          <div className="grid grid-cols-[minmax(0,1fr)_6rem] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_8rem] sm:gap-8">
                            <div className="min-w-0 space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="profile-name">Nome</Label>
                                <Input
                                  id="profile-name"
                                  value={profile.nome}
                                  onChange={(event) =>
                                    update("nome", event.target.value)
                                  }
                                  placeholder="Como você quer ser chamado"
                                  maxLength={100}
                                  required
                                  className="h-10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="profile-username">
                                  Username
                                </Label>
                                <Input
                                  id="profile-username"
                                  value={profile.username}
                                  onChange={(event) =>
                                    update(
                                      "username",
                                      event.target.value.replace(/^@/, "")
                                    )
                                  }
                                  placeholder="seu_usuario"
                                  minLength={3}
                                  maxLength={30}
                                  pattern="[A-Za-z0-9_]+"
                                  required
                                  className="h-10"
                                  aria-describedby="profile-username-help"
                                />
                                <p
                                  id="profile-username-help"
                                  className="text-xs text-muted-foreground"
                                >
                                  Seu perfil aparece como @
                                  {profile.username || "seu_usuario"}.
                                </p>
                              </div>
                            </div>
                            <div className="flex min-w-0 flex-col items-center gap-2">
                              <p className="text-sm font-medium">
                                Foto do perfil
                              </p>
                              <input
                                ref={avatarInputRef}
                                id="profile-photo"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={selectAvatar}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                aria-label="Escolher foto do perfil"
                                aria-describedby="profile-photo-help"
                                className="group relative size-24 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed sm:size-28"
                              >
                                <span className="flex size-full items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                                  {avatarPreview || profile.avatarUrl ? (
                                    <Image
                                      src={avatarPreview ?? profile.avatarUrl!}
                                      alt={`Foto de ${profile.nome}`}
                                      width={112}
                                      height={112}
                                      unoptimized
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <UserRound
                                      aria-hidden="true"
                                      className="size-9 text-muted-foreground"
                                      strokeWidth={1.5}
                                    />
                                  )}
                                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-overlay text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                                    <Camera
                                      aria-hidden="true"
                                      className="size-5"
                                    />
                                    <span className="text-xs font-medium">
                                      Trocar foto
                                    </span>
                                  </span>
                                </span>
                              </button>
                              <p
                                id="profile-photo-help"
                                className="text-center text-xs leading-5 text-muted-foreground"
                              >
                                JPG, PNG ou WEBP
                              </p>
                            </div>
                          </div>
                          {avatarError ? (
                            <p
                              role="alert"
                              className="text-sm text-destructive"
                            >
                              {avatarError}
                            </p>
                          ) : null}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="profile-bio">Biografia</Label>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {profile.biografia?.length ?? 0}/500
                              </span>
                            </div>
                            <Textarea
                              id="profile-bio"
                              value={profile.biografia ?? ""}
                              onChange={(event) =>
                                update("biografia", event.target.value)
                              }
                              maxLength={500}
                              rows={6}
                              className="min-h-44"
                              placeholder="Conte um pouco sobre você, seu trabalho e os projetos que gosta de criar."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profile-visibility">
                              Visibilidade do perfil
                            </Label>
                            <Select
                              value={profile.visibilidadePerfil ?? "publico"}
                              onValueChange={(value) => {
                                if (value === "publico" || value === "privado")
                                  update("visibilidadePerfil", value)
                              }}
                              items={[
                                { label: "Público", value: "publico" },
                                { label: "Privado", value: "privado" },
                              ]}
                              disabled={saving}
                            >
                              <SelectTrigger
                                id="profile-visibility"
                                className="w-full px-4 py-3 data-[size=default]:h-auto"
                              >
                                <SelectValue placeholder="Escolha a visibilidade" />
                              </SelectTrigger>
                              <SelectContent
                                className="p-1.5"
                                positionerClassName="z-[130]"
                              >
                                <SelectItem
                                  value="publico"
                                  className="py-1.5 pl-2"
                                >
                                  Público
                                </SelectItem>
                                <SelectItem
                                  value="privado"
                                  className="py-1.5 pl-2"
                                >
                                  Privado
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Perfis privados ficam visíveis apenas para você e
                              seguidores aceitos.
                            </p>
                          </div>
                        </div>
                      </section>
                      <section className="space-y-4">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <h2 className="text-lg font-semibold">
                            Stacks e tecnologias
                          </h2>
                          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                            {selectedStackIds.length}/20 selecionadas
                          </span>
                        </div>
                        <ul
                          aria-label="Stacks selecionadas"
                          className="flex flex-wrap items-center gap-2"
                        >
                          {technologies
                            .filter((technology) =>
                              selectedStackIds.includes(technology.id)
                            )
                            .map((technology) => (
                              <li
                                key={technology.id}
                                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm"
                              >
                                <ProfileStackIcon stack={technology} selected />
                                {technology.nome}
                              </li>
                            ))}
                          <li>
                            <Dialog.Root
                              open={stackPickerOpen}
                              onOpenChange={(next) => {
                                setStackPickerOpen(next)
                                if (next) setStackQuery("")
                              }}
                            >
                              <Dialog.Trigger
                                render={
                                  <Button
                                    type="button"
                                    size="icon-lg"
                                    variant="outline"
                                  />
                                }
                                aria-label="Adicionar stacks e tecnologias"
                              >
                                <Plus aria-hidden="true" />
                              </Dialog.Trigger>
                              <Dialog.Portal>
                                <Dialog.Backdrop className="fixed inset-0 z-[110] bg-overlay" />
                                <Dialog.Viewport className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                                  <Dialog.Popup className="flex max-h-[min(80svh,40rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background outline-none">
                                    <header className="shrink-0 space-y-4 border-b border-border p-5">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Dialog.Title className="font-heading text-lg font-semibold">
                                          Escolher tecnologias
                                        </Dialog.Title>
                                        <span className="text-xs text-muted-foreground">
                                          {selectedStackIds.length}/20
                                          selecionadas
                                        </span>
                                      </div>
                                      <div className="relative">
                                        <Search
                                          aria-hidden="true"
                                          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                          type="search"
                                          aria-label="Pesquisar tecnologias"
                                          placeholder="Pesquisar tecnologias"
                                          value={stackQuery}
                                          onChange={(event) =>
                                            setStackQuery(event.target.value)
                                          }
                                          className="h-10 pl-9"
                                        />
                                      </div>
                                    </header>
                                    <div className="relative isolate min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                                      {filteredTechnologies.length === 0 ? (
                                        <p
                                          role="status"
                                          className="text-sm text-muted-foreground"
                                        >
                                          {technologies.length === 0
                                            ? "Nenhuma tecnologia disponível."
                                            : "Nenhuma tecnologia encontrada."}
                                        </p>
                                      ) : (
                                        <ul
                                          aria-label="Selecione stacks e tecnologias"
                                          className="grid gap-3 p-1 sm:grid-cols-2"
                                        >
                                          {filteredTechnologies.map(
                                            (technology) => {
                                              const selected =
                                                selectedStackIds.includes(
                                                  technology.id
                                                )
                                              return (
                                                <li key={technology.id}>
                                                  <button
                                                    type="button"
                                                    aria-pressed={selected}
                                                    disabled={
                                                      !selected &&
                                                      selectedStackIds.length >=
                                                        20
                                                    }
                                                    onClick={() =>
                                                      toggleStack(technology.id)
                                                    }
                                                    className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary/50 bg-accent/60" : "border-border bg-card hover:bg-secondary/70"}`}
                                                  >
                                                    <span className="flex size-9 shrink-0 items-center justify-center">
                                                      <ProfileStackIcon
                                                        stack={technology}
                                                        selected={selected}
                                                      />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                      <span className="block truncate text-sm font-semibold">
                                                        {technology.nome}
                                                      </span>
                                                      {technology.categoria ? (
                                                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                          {technology.categoria}
                                                        </span>
                                                      ) : null}
                                                    </span>
                                                    <Check
                                                      aria-hidden="true"
                                                      className={`size-5 shrink-0 ${selected ? "text-primary" : "text-transparent"}`}
                                                    />
                                                  </button>
                                                </li>
                                              )
                                            }
                                          )}
                                        </ul>
                                      )}
                                    </div>
                                    <footer className="flex shrink-0 justify-end border-t border-border p-4">
                                      <Dialog.Close
                                        render={<Button type="button" />}
                                      >
                                        Concluir
                                      </Dialog.Close>
                                    </footer>
                                  </Dialog.Popup>
                                </Dialog.Viewport>
                              </Dialog.Portal>
                            </Dialog.Root>
                          </li>
                        </ul>
                      </section>
                      {error ? (
                        <p role="alert" className="text-sm text-destructive">
                          {error}
                        </p>
                      ) : null}
                    </fieldset>
                  </div>
                  <footer className="relative z-10 flex shrink-0 flex-col-reverse justify-end gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:px-6">
                    <Dialog.Close
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          disabled={saving}
                        />
                      }
                    >
                      Cancelar
                    </Dialog.Close>
                    <Button
                      type="submit"
                      disabled={saving || selectedStackIds.length > 20}
                      className="gap-2"
                    >
                      {saving ? "Salvando…" : "Salvar alterações"}
                    </Button>
                  </footer>
                </form>
              </>
            ) : null}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

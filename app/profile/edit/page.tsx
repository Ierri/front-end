"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Code2, LoaderCircle, Save } from "lucide-react"
import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { FeedHeader } from "@/components/feed/feed-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { profilesService, type Profile, type ProfileStack } from "@/services/profiles"

function EditProfileContent() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [technologies, setTechnologies] = useState<ProfileStack[]>([])
  const [selectedStackIds, setSelectedStackIds] = useState<string[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    Promise.all([profilesService.me(), profilesService.listTechnologies()])
      .then(([current, catalog]) => {
        if (!active) return
        setProfile(current)
        setSelectedStackIds(current.stackIds ?? current.stacks?.map((stack) => stack.id) ?? [])
        setTechnologies(catalog)
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Não foi possível carregar os dados do perfil.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function update<K extends "nome" | "username" | "biografia" | "visibilidadePerfil">(key: K, value: NonNullable<Profile[K]>) {
    setProfile((current) => current ? { ...current, [key]: value } : current)
  }

  function toggleStack(id: string) {
    setSelectedStackIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
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
      router.push("/profile")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível salvar as alterações.")
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href="/profile" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar ao perfil</Link>
        {loading ? <div role="status" className="flex min-h-64 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 size-5 animate-spin" />Carregando perfil…</div> : error && !profile ? <div role="alert" className="py-12 text-center text-sm text-destructive">{error}</div> : profile ? <>
          <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Editar perfil</h1><p className="mt-3 text-sm text-muted-foreground">Atualize as informações que aparecem no seu perfil.</p></div>
          <form onSubmit={save} className="space-y-8">
            <section className="rounded-2xl border border-border p-5 sm:p-7"><h2 className="text-lg font-semibold">Informações básicas</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-photo">Foto do perfil</Label><div className="flex items-center gap-4"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">{profile.avatarUrl ? <Image src={profile.avatarUrl} alt={`Foto de ${profile.nome}`} width={80} height={80} unoptimized className="size-full object-cover" /> : <Code2 className="size-7 text-muted-foreground" />}</div><div className="space-y-2"><Input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)} className="max-w-md" /><p className="text-xs text-muted-foreground">PNG, JPG ou WEBP · mínimo 128 × 128 px · até 5 MB{avatarFile ? ` · Selecionado: ${avatarFile.name}` : ""}</p></div></div></div>
              <div className="space-y-2"><Label htmlFor="profile-name">Nome</Label><Input id="profile-name" value={profile.nome} onChange={(event) => update("nome", event.target.value)} maxLength={100} required /></div>
              <div className="space-y-2"><Label htmlFor="profile-username">Username</Label><Input id="profile-username" value={profile.username} onChange={(event) => update("username", event.target.value.replace(/^@/, ""))} minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" required /><p className="text-xs text-muted-foreground">Será exibido como @{profile.username || "username"}.</p></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-bio">Biografia</Label><Textarea id="profile-bio" value={profile.biografia ?? ""} onChange={(event) => update("biografia", event.target.value)} maxLength={500} rows={4} /><p className="text-right text-xs text-muted-foreground">{profile.biografia?.length ?? 0}/500</p></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-visibility">Visibilidade do perfil</Label><select id="profile-visibility" value={profile.visibilidadePerfil ?? "publico"} onChange={(event) => update("visibilidadePerfil", event.target.value as "publico" | "privado")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="publico">Público</option><option value="privado">Privado</option></select><p className="text-xs text-muted-foreground">Perfis privados ficam visíveis apenas para você e seguidores aceitos.</p></div>
            </div></section>
            <section className="rounded-2xl border border-border p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Stacks e tecnologias</h2><p className="mt-2 text-sm text-muted-foreground">Selecione até 20 tecnologias cadastradas na plataforma.</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{selectedStackIds.length}/20 selecionadas</span></div><ul aria-label="Selecione stacks e tecnologias" className="mt-6 grid gap-3 sm:grid-cols-2">{technologies.map((technology) => { const selected = selectedStackIds.includes(technology.id); return <li key={technology.id}><button type="button" aria-pressed={selected} disabled={!selected && selectedStackIds.length >= 20} onClick={() => toggleStack(technology.id)} className={`flex min-h-16 w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-primary/50 bg-accent/60" : "border-border bg-card hover:bg-secondary/70"}`}><span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">{technology.iconeUrl ? <Image src={technology.iconeUrl} alt="" width={24} height={24} unoptimized className="size-6 object-contain" /> : <Code2 className="size-5 text-muted-foreground" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{technology.nome}</span>{technology.categoria ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{technology.categoria}</span> : null}</span><Check aria-hidden="true" className={`size-5 shrink-0 ${selected ? "text-accent-foreground" : "text-transparent"}`} /></button></li>})}</ul>{technologies.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Nenhuma tecnologia disponível no catálogo.</p> : null}</section>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row"><Link href="/profile" className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">Cancelar</Link><Button type="submit" disabled={saving || selectedStackIds.length > 20} className="gap-2">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar alterações</Button></div>
            <p className="text-center text-xs text-muted-foreground">As alterações são salvas na sua conta.</p>
          </form>
        </> : null}
      </main>
    </div>
  )
}

export default function EditProfilePage() {
  return <ProtectedRoute returnTo="/profile/edit"><EditProfileContent /></ProtectedRoute>
}

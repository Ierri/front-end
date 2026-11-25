"use client"

import { Dialog } from "@base-ui/react/dialog"
import { useState } from "react"

import { ProfileStackIcon } from "@/components/profile/profile-stack-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { profilesService, type ProfileStack } from "@/services/profiles"

export function CreatePostStacks({
  selected,
  onChange,
  disabled,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}) {
  const [catalog, setCatalog] = useState<ProfileStack[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const search = query.trim().toLocaleLowerCase("pt-BR")
  const groups = new Map<string, ProfileStack[]>()
  for (const stack of catalog ?? []) {
    const category = stack.categoria?.trim() || "Outras"
    if (
      !`${stack.nome} ${category}`.toLocaleLowerCase("pt-BR").includes(search)
    )
      continue
    const entries = groups.get(category) ?? []
    entries.push(stack)
    groups.set(category, entries)
  }
  const categories = [...groups].sort(([a], [b]) => {
    if (a === "Outras") return 1
    if (b === "Outras") return -1
    return a.localeCompare(b, "pt-BR")
  })

  async function load() {
    if (loading) return
    setLoading(true)
    setError("")
    try {
      setCatalog(await profilesService.listTechnologies())
    } catch {
      setError("Não foi possível carregar as tecnologias.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open && !catalog) void load()
      }}
    >
      <Dialog.Trigger
        type="button"
        disabled={disabled}
        className="flex w-full items-center gap-2 rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        Tecnologias do projeto
        <span className="font-normal text-muted-foreground">
          {selected.length ? `${selected.length}/20` : "Opcional"}
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-overlay backdrop-blur-sm" />
        <Dialog.Viewport className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <Dialog.Popup className="flex max-h-[min(80dvh,36rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-background outline-none">
            <header className="shrink-0 space-y-3 border-b border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Dialog.Title className="font-heading text-lg font-semibold">
                  Tecnologias do projeto
                </Dialog.Title>
                <span className="text-xs text-muted-foreground">
                  {selected.length}/20 selecionadas
                </span>
              </div>
              <Input
                type="search"
                aria-label="Pesquisar tecnologias"
                placeholder="Pesquisar tecnologias"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </header>
            <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4">
              {loading && (
                <p role="status" className="text-sm">
                  Carregando tecnologias…
                </p>
              )}
              {error && (
                <div className="flex flex-wrap items-center gap-2">
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => void load()}
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
              {catalog &&
                (categories.length ? (
                  categories.map(([category, stacks]) => (
                    <section key={category} className="space-y-2">
                      <h3 className="text-sm font-semibold">{category}</h3>
                      <ul className="flex flex-wrap gap-2 p-1">
                        {stacks.map((stack) => {
                          const active = selected.includes(stack.id)
                          return (
                            <li key={stack.id}>
                              <Button
                                type="button"
                                variant={active ? "secondary" : "outline"}
                                aria-pressed={active}
                                disabled={
                                  disabled || (!active && selected.length >= 20)
                                }
                                onClick={() =>
                                  onChange(
                                    active
                                      ? selected.filter((id) => id !== stack.id)
                                      : [...selected, stack.id]
                                  )
                                }
                              >
                                <ProfileStackIcon
                                  stack={stack}
                                  selected={active}
                                />
                                {stack.nome}
                              </Button>
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  ))
                ) : (
                  <p role="status" className="text-sm text-muted-foreground">
                    Nenhuma tecnologia encontrada.
                  </p>
                ))}
            </div>
            <footer className="flex shrink-0 justify-end border-t border-border p-4">
              <Dialog.Close render={<Button type="button" />}>
                Concluir
              </Dialog.Close>
            </footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

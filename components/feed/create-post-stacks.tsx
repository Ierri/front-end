"use client"

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
  const results = catalog?.filter(({ nome }) =>
    nome.toLowerCase().includes(query.trim().toLowerCase())
  )

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
    <details
      className="rounded-xl border border-border px-4 py-3"
      onToggle={(event) => {
        if (event.currentTarget.open && !catalog && !error) void load()
      }}
    >
      <summary className="cursor-pointer text-sm font-semibold">
        Tecnologias do projeto
        <span className="ml-2 font-normal text-muted-foreground">
          {selected.length ? `${selected.length}/20` : "Opcional"}
        </span>
      </summary>
      <div className="mt-3 space-y-3">
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
        {results && (
          <>
            <Input
              type="search"
              aria-label="Pesquisar tecnologias"
              placeholder="Pesquisar tecnologias"
              value={query}
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault()
              }}
            />
            {results.length ? (
              <ul className="flex max-h-40 flex-wrap gap-2 overflow-y-auto p-1">
                {results.map((stack) => {
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
                        <ProfileStackIcon stack={stack} selected={active} />
                        {stack.nome}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                Nenhuma tecnologia encontrada.
              </p>
            )}
          </>
        )}
      </div>
    </details>
  )
}

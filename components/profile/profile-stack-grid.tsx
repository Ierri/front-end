import { technologyCatalog } from "@/components/feed/technology-icon-list"
import type { TechnologyKey } from "@/lib/feed/types"
import type { CustomProfileStack } from "@/lib/profile/demo-profile"
import { stackIconCatalog } from "@/lib/profile/stack-icons"

export function ProfileStackGrid({
  technologies,
  customStacks = [],
  ownerName,
  display = "detailed",
}: {
  technologies: TechnologyKey[]
  customStacks?: CustomProfileStack[]
  ownerName: string
  display?: "minimal" | "detailed"
}) {
  const items = [
    ...technologies.map((technology) => ({
      id: technology,
      label: technologyCatalog[technology].label,
      description: technologyCatalog[technology].description,
      Icon: technologyCatalog[technology].icon,
    })),
    ...customStacks.map((stack) => ({
      id: stack.id,
      label: stack.name,
      description: stack.description,
      Icon: stackIconCatalog[stack.icon],
    })),
  ]

  if (!items.length) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
        {ownerName} ainda não adicionou tecnologias ao perfil.
      </p>
    )
  }

  if (display === "minimal") {
    return (
      <ul
        aria-label={`Stacks e tecnologias de ${ownerName}`}
        className="flex flex-wrap items-center gap-2.5"
      >
        {items.map(({ id, label, Icon }) => (
          <li key={id} title={label}>
            <Icon role="img" aria-label={label} className="size-4 text-muted-foreground" />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul
      aria-label={`Stacks e tecnologias de ${ownerName}`}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {items.map(({ id, Icon, label, description }) => {
        return (
          <li
            key={id}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/70"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                {description}
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

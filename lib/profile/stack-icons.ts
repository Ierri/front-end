import {
  Braces,
  Cloud,
  Code2,
  Component,
  Database,
  Globe2,
  Layers,
  PanelsTopLeft,
  Palette,
  Server,
  Smartphone,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type StackIconKey =
  | "code"
  | "braces"
  | "palette"
  | "database"
  | "mobile"
  | "cloud"
  | "component"
  | "layout"
  | "globe"
  | "layers"
  | "server"
  | "terminal"
  | "tools"

export const stackIconOptions: {
  key: StackIconKey
  label: string
  icon: LucideIcon
}[] = [
  { key: "code", label: "Código", icon: Code2 },
  { key: "braces", label: "Linguagem", icon: Braces },
  { key: "palette", label: "Design", icon: Palette },
  { key: "database", label: "Banco de dados", icon: Database },
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "component", label: "Componentes", icon: Component },
  { key: "layout", label: "Interface", icon: PanelsTopLeft },
  { key: "globe", label: "Web", icon: Globe2 },
  { key: "layers", label: "Camadas", icon: Layers },
  { key: "server", label: "Servidor", icon: Server },
  { key: "terminal", label: "Terminal", icon: Terminal },
  { key: "tools", label: "Ferramentas", icon: Wrench },
]

export const stackIconCatalog = Object.fromEntries(
  stackIconOptions.map(({ key, icon }) => [key, icon])
) as Record<StackIconKey, LucideIcon>

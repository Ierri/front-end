import type { TechnologyKey } from "@/lib/feed/types"
import { currentFeedUser } from "@/lib/feed/mock-data"

export type DemoProfile = {
  name: string
  username: string
  avatarUrl: string
  bio: string
  highlight: string
  highlightEnabled: boolean
  location: string
  website: string
  github: string
  linkedin: string
  instagram: string
  socialLinksConfigured: boolean
  technologies: TechnologyKey[]
}

export const defaultDemoProfile: DemoProfile = {
  name: currentFeedUser.name,
  username: "rafalimma",
  avatarUrl: currentFeedUser.avatar,
  bio: "Designer de produto focado em experiências digitais claras, acessíveis e cheias de personalidade. Compartilho processos, interfaces e experimentos.",
  highlight: "Design que transforma ideias em experiências.",
  highlightEnabled: true,
  location: "São Paulo, Brasil",
  website: "https://www.youtube.com/",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  instagram: "https://www.instagram.com/",
  socialLinksConfigured: true,
  technologies: ["interface-design", "react", "typescript"],
}

const storageKey = "ierri-demo-profile"

export function readDemoProfile(): DemoProfile {
  if (typeof window === "undefined") return defaultDemoProfile

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultDemoProfile

    const parsed: unknown = JSON.parse(saved)
    if (!parsed || typeof parsed !== "object") return defaultDemoProfile

    const value = parsed as Partial<DemoProfile>
    const legacySocialLinks = value.socialLinksConfigured === undefined
    const socialLinksAreEmpty =
      !value.website && !value.github && !value.linkedin && !value.instagram
    const bio =
      value.bio ===
      "Perfil demonstrativo do Ierri. As informações e os projetos desta prévia são fictícios e servem apenas para visualizar a página."
        ? defaultDemoProfile.bio
        : (value.bio ?? defaultDemoProfile.bio)
    return {
      ...defaultDemoProfile,
      ...value,
      bio,
      highlight: value.highlight ?? defaultDemoProfile.highlight,
      highlightEnabled:
        value.highlightEnabled ?? defaultDemoProfile.highlightEnabled,
      ...(legacySocialLinks && socialLinksAreEmpty
        ? {
            website: defaultDemoProfile.website,
            github: defaultDemoProfile.github,
            linkedin: defaultDemoProfile.linkedin,
            instagram: defaultDemoProfile.instagram,
          }
        : {}),
      socialLinksConfigured: true,
      technologies: Array.isArray(value.technologies)
        ? value.technologies
        : defaultDemoProfile.technologies,
    }
  } catch {
    return defaultDemoProfile
  }
}

export function writeDemoProfile(profile: DemoProfile) {
  window.localStorage.setItem(storageKey, JSON.stringify(profile))
}

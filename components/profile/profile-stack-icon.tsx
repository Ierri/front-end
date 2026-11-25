import Image from "next/image"
import { Code2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ProfileStack } from "@/services/profiles"

const bundledIcons = new Set([
  "angular",
  "astro",
  "bootstrap",
  "c",
  "cplusplus",
  "css",
  "cypress",
  "dart",
  "django",
  "docker",
  "dotnet",
  "elixir",
  "express",
  "fastapi",
  "figma",
  "firebase",
  "flask",
  "flutter",
  "git",
  "go",
  "grafana",
  "graphql",
  "html",
  "javascript",
  "jest",
  "kotlin",
  "kubernetes",
  "laravel",
  "lua",
  "mariadb",
  "mongodb",
  "mysql",
  "nestjs",
  "next-js",
  "nginx",
  "node-js",
  "nuxt",
  "php",
  "postgresql",
  "prisma",
  "python",
  "r",
  "react-native",
  "react",
  "redis",
  "ruby",
  "rubyonrails",
  "rust",
  "sass",
  "spring-boot",
  "sqlite",
  "supabase",
  "svelte",
  "swift",
  "tailwind-css",
  "terraform",
  "typescript",
  "vite",
  "vitest",
  "vue",
])

export function ProfileStackIcon({
  stack,
  selected = false,
}: {
  stack: ProfileStack
  selected?: boolean
}) {
  if (bundledIcons.has(stack.slug)) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "size-5 shrink-0 bg-current [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]",
          selected ? "text-primary" : "text-foreground dark:text-white"
        )}
        style={{ maskImage: `url("/technologies/${stack.slug}.svg")` }}
      />
    )
  }

  return stack.iconeUrl ? (
    <Image
      src={stack.iconeUrl}
      alt=""
      width={24}
      height={24}
      unoptimized
      className="size-5 object-contain opacity-90 brightness-0 dark:opacity-100 dark:invert"
    />
  ) : (
    <Code2
      aria-hidden="true"
      className={cn("size-5", selected ? "text-primary" : "text-foreground")}
    />
  )
}

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { AuthForm } from "@/components/auth/auth-form"
import { pageMetadata } from "@/lib/metadata"

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/auth",
    title: "Entre na comunidade | Ierri",
    description:
      "Seu próximo projeto merece ser visto. Entre no Ierri ou crie sua conta para compartilhar interfaces e trocar ideias com a comunidade.",
  }),
  title: "Entre na comunidade",
  robots: { index: false, follow: true },
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Ierri, página inicial"
      className="inline-flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <Image
        src="/brand/ierri/logos/svg/ierri-symbol-primary.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="dark:hidden"
      />
      <Image
        src="/brand/ierri/logos/svg/ierri-symbol-inverse.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="hidden dark:block"
      />
      <span className="font-heading text-2xl font-bold tracking-tight">
        ierri
      </span>
    </Link>
  )
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { returnTo } = await searchParams

  return (
    <div className="isolate grid min-h-svh bg-background text-foreground lg:grid-cols-3">
      <aside className="relative isolate hidden flex-col justify-between border-r border-border bg-background p-8 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(40%_80%_at_10%_0%,color-mix(in_srgb,var(--foreground)_5%,transparent),transparent)] before:content-[''] lg:flex">
        <Link
          href="/"
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <ArrowLeft className="size-4" /> Início
        </Link>
        <div className="py-16">
          <h2 className="max-w-sm text-3xl leading-[1.2] font-semibold tracking-tight [text-shadow:0_0_18px_color-mix(in_srgb,var(--foreground)_22%,transparent),0_0_42px_color-mix(in_srgb,var(--foreground)_8%,transparent)] xl:text-4xl">
            Boas interfaces merecem ser{" "}
            <span className="bg-primary box-decoration-clone px-1.5 text-primary-foreground [text-shadow:none]">
              compartilhadas.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Um espaço para mostrar o que você cria, trocar perspectivas e
            descobrir o que vem a seguir.
          </p>
        </div>
        <div>
          <p className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Share<span className="text-primary">.</span> Review
            <span className="text-primary">.</span> Inspire
            <span className="text-primary">.</span>
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            Sua próxima ideia começa com uma conexão.
          </p>
        </div>
      </aside>
      <div className="relative isolate flex min-h-svh flex-col bg-background before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(40%_100%_at_49%_0%,color-mix(in_srgb,var(--foreground)_5%,transparent),transparent)] before:content-[''] lg:col-span-2">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_50%_0%,#000_25%,transparent_100%)] text-muted-foreground"
        >
          <defs>
            <pattern
              id="auth-grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M80 0H0V80"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.26"
                strokeDasharray="3 5"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
        <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-6 sm:px-10 sm:py-8 lg:justify-center">
          <Brand />
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring lg:hidden"
          >
            <ArrowLeft className="size-3.5" /> Início
          </Link>
        </header>
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:py-16">
          <section
            aria-label="Acesso à comunidade Ierri"
            className="w-full max-w-[336px] py-6 sm:px-2"
          >
            <AuthForm returnTo={returnTo} />
          </section>
        </main>
        <footer className="relative z-10 px-6 py-7 text-center text-xs leading-relaxed text-muted-foreground sm:px-10">
          Ao continuar, você concorda com os{" "}
          <a
            href="/termos"
            className="underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Termos de Serviço
          </a>{" "}
          e a{" "}
          <a
            href="/privacidade"
            className="underline underline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Política de Privacidade
          </a>{" "}
        </footer>
      </div>
    </div>
  )
}

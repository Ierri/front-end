"use client"

import { useState, type FormEvent } from "react"
import { AtSign, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth/service"
import type { EmailLookupResult } from "@/lib/auth/types"
import { emailSchema } from "@/lib/validations/auth"

export function EmailForm({
  initialEmail,
  onContinue,
}: {
  initialEmail: string
  onContinue: (email: string, result: EmailLookupResult) => void
}) {
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState("")
  const [requestError, setRequestError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    const input = event.currentTarget.elements.namedItem(
      "email"
    ) as HTMLInputElement
    const validation = emailSchema.safeParse({ email })
    setRequestError("")
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      input.focus()
      return
    }
    setError("")
    setIsSubmitting(true)
    try {
      const result = await authService.checkEmail(validation.data)
      onContinue(validation.data.email, result)
    } catch {
      setRequestError("O acesso por e-mail ainda não está disponível.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl leading-tight tracking-tight">
          Entre ou crie sua conta
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Faça parte da comunidade criativa do Ierri.
        </p>
      </div>
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full gap-2 bg-secondary dark:bg-secondary"
          disabled
        >
          <span
            aria-hidden="true"
            className="text-xl leading-none font-semibold"
          >
            G
          </span>
          Continuar com Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full gap-2 bg-secondary dark:bg-secondary"
          disabled
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-current"
          >
            <path d="M12 3 23 22H1Z" />
          </svg>
          Continuar com Vercel
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full gap-2 bg-secondary dark:bg-secondary"
          disabled
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 fill-current"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Continuar com GitHub
        </Button>
      </div>
      <div className="my-7 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OU
        <span className="h-px flex-1 bg-border" />
      </div>
      <form
        noValidate
        aria-label="Continuar com e-mail"
        aria-busy={isSubmitting}
        onSubmit={handleEmailSubmit}
        className="space-y-2"
      >
        <Label htmlFor="auth-email" className="sr-only">
          E-mail
        </Label>
        <div className="relative">
          <AtSign
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="auth-email"
            name="email"
            value={email}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Digite seu endereço de e-mail"
            disabled={isSubmitting}
            required
            maxLength={254}
            aria-invalid={!!error}
            aria-describedby={error ? "auth-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              setError("")
              setRequestError("")
            }}
            className="h-9 bg-secondary pr-3 pl-8 text-sm dark:bg-secondary"
          />
        </div>
        {error && (
          <p
            id="auth-email-error"
            className="text-sm leading-relaxed font-medium text-destructive"
          >
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-9 w-full">
          {isSubmitting ? "Aguarde…" : "Continuar com e-mail"}
        </Button>
      </form>
      {requestError && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground"
        >
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{requestError}</p>
        </div>
      )}
    </>
  )
}

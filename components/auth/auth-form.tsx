"use client"

import { useEffect, useState } from "react"
import { CredentialsForm } from "./credentials-form"
import { EmailForm } from "./email-form"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"
import type { AuthUser, EmailLookupResult } from "@/services/auth.types"

type AuthFlow =
  | { step: "email"; email: string }
  | ({ step: "credentials"; email: string } & EmailLookupResult)

export function AuthForm() {
  const [session, setSession] = useState<AuthUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState("")
  const [leaving, setLeaving] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    authService
      .me()
      .then((user) => {
        if (active) setSession(user)
      })
      .catch((error: unknown) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Não foi possível verificar sua sessão."
          )
      })
      .finally(() => {
        if (active) setChecking(false)
      })
    return () => {
      active = false
    }
  }, [attempt])
  const [flow, setFlow] = useState<AuthFlow>({ step: "email", email: "" })

  if (checking)
    return (
      <p role="status" className="text-center text-sm text-muted-foreground">
        Verificando sua sessão…
      </p>
    )

  if (error && !session)
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button
          className="w-full"
          onClick={() => {
            setError("")
            setChecking(true)
            setAttempt((value) => value + 1)
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )

  if (session)
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl">Bom ter você aqui, {session.name}!</h1>
        <p role="status" className="text-sm text-muted-foreground">
          Você está conectado como {session.email}.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          className="w-full"
          variant="outline"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true)
            setError("")
            try {
              await authService.logout()
              setSession(null)
              setFlow({ step: "email", email: "" })
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Não foi possível sair."
              )
            } finally {
              setLeaving(false)
            }
          }}
        >
          {leaving ? "Saindo…" : "Sair da conta"}
        </Button>
      </div>
    )

  if (flow.step === "email") {
    return (
      <EmailForm
        initialEmail={flow.email}
        onContinue={(email, result) =>
          setFlow({ step: "credentials", email, ...result })
        }
      />
    )
  }

  return (
    <CredentialsForm
      key={flow.nextStep}
      onAuthenticated={(result) => setSession(result.user)}
      mode={flow.nextStep}
      email={flow.email}
      user={flow.nextStep === "login" ? flow.user : undefined}
      onBack={() => setFlow({ step: "email", email: flow.email })}
    />
  )
}

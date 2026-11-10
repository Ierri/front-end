"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CredentialsForm } from "./credentials-form"
import { EmailForm } from "./email-form"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { safeReturnTo } from "@/lib/auth/return-to"
import type { EmailLookupResult } from "@/services/auth.types"

type AuthFlow =
  | { step: "email"; email: string }
  | ({ step: "credentials"; email: string } & EmailLookupResult)

export function AuthForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter()
  const {
    status,
    user: session,
    error: sessionError,
    refreshSession,
    setAuthenticated,
    logout,
  } = useAuth()
  const [actionError, setActionError] = useState("")
  const [leaving, setLeaving] = useState(false)
  const [flow, setFlow] = useState<AuthFlow>({ step: "email", email: "" })
  const error = actionError || sessionError

  if (status === "loading")
    return (
      <p role="status" className="text-center text-sm text-muted-foreground">
        Verificando sua sessão…
      </p>
    )

  if (status === "error")
    return (
      <div className="space-y-4">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <Button className="w-full" onClick={() => void refreshSession()}>
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
            setActionError("")
            try {
              await logout()
              setFlow({ step: "email", email: "" })
            } catch (caught) {
              setActionError(
                caught instanceof Error
                  ? caught.message
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
      onAuthenticated={(result) => {
        setAuthenticated(result.user)
        router.replace(safeReturnTo(returnTo))
      }}
      mode={flow.nextStep}
      email={flow.email}
      user={flow.nextStep === "login" ? flow.user : undefined}
      onBack={() => setFlow({ step: "email", email: flow.email })}
    />
  )
}

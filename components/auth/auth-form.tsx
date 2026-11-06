"use client"

import { useState } from "react"
import { CredentialsForm } from "./credentials-form"
import { EmailForm } from "./email-form"
import type { EmailLookupResult } from "@/lib/auth/types"

type AuthFlow =
  | { step: "email"; email: string }
  | ({ step: "credentials"; email: string } & EmailLookupResult)

export function AuthForm() {
  const [flow, setFlow] = useState<AuthFlow>({ step: "email", email: "" })

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
      mode={flow.nextStep}
      email={flow.email}
      user={flow.nextStep === "login" ? flow.user : undefined}
      onBack={() => setFlow({ step: "email", email: flow.email })}
    />
  )
}

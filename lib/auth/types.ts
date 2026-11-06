import type { z } from "zod"
import type {
  emailSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validations/auth"

export type EmailValues = z.output<typeof emailSchema>
export type LoginValues = z.output<typeof loginSchema>
export type RegistrationValues = z.output<typeof registerSchema>
// Confirmation belongs to form validation, not the registration request.
export type RegistrationPayload = Omit<RegistrationValues, "confirmPassword">

export type AuthUserPreview = {
  name: string
  initials: string
}

export type EmailLookupResult =
  { nextStep: "login"; user: AuthUserPreview } | { nextStep: "register" }

export type AuthResult = { message: string }

// Frontend interface. The eventual HTTP adapter must map the actual API contract.
export interface AuthService {
  checkEmail(values: EmailValues): Promise<EmailLookupResult>
  login(values: LoginValues): Promise<AuthResult>
  register(values: RegistrationPayload): Promise<AuthResult>
}

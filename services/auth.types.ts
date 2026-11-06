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

export type AuthUser = {
  id: string
  name: string
  email: string
  username: string
  bio?: string
  avatarUrl?: string
  createdAt: string
}

export type AuthResult = { message: string; user: AuthUser }

// Frontend interface mapped to the API by the HTTP adapter.
export interface AuthService {
  me(): Promise<AuthUser | null>
  logout(): Promise<void>
  checkEmail(values: EmailValues): Promise<EmailLookupResult>
  login(values: LoginValues): Promise<AuthResult>
  register(values: RegistrationPayload): Promise<AuthResult>
}

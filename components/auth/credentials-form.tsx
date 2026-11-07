"use client"

import { useState, type FormEvent } from "react"
import { ArrowLeft, Eye, EyeOff, Info } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth"
import { ApiError } from "@/services/api"
import type { AuthResult, AuthUserPreview } from "@/services/auth.types"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import {
  focusFirstInvalidField,
  getFieldErrors,
} from "@/lib/validations/form-errors"

export function CredentialsForm({
  mode,
  user,
  email,
  onBack,
  onAuthenticated,
}: {
  mode: "login" | "register"
  user?: AuthUserPreview
  email: string
  onAuthenticated: (result: AuthResult) => void
  onBack: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestError, setRequestError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegistering = mode === "register"

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    setRequestError("")
    const validation = isRegistering
      ? { mode: "register" as const, ...registerSchema.safeParse(values) }
      : { mode: "login" as const, ...loginSchema.safeParse(values) }
    if (!validation.success) {
      const fieldErrors = getFieldErrors(validation.error)
      setErrors(fieldErrors)
      focusFirstInvalidField(form, fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)
    try {
      const result =
        validation.mode === "register"
          ? await authService.register({
              name: validation.data.name,
              email: validation.data.email,
              password: validation.data.password,
            })
          : await authService.login(validation.data)
      onAuthenticated(result)
      form.reset()
      setShowPassword(false)
      setShowConfirmation(false)
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldErrors = Object.fromEntries(
          error.details.map(({ field, message }) => [field, message])
        )
        setErrors(fieldErrors)
        focusFirstInvalidField(form, fieldErrors)
      }
      setRequestError(
        error instanceof Error
          ? error.message
          : isRegistering
            ? "Não foi possível criar sua conta. Tente novamente."
            : "Não foi possível entrar. Confira seus dados e tente novamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl leading-tight tracking-tight">
          {isRegistering ? "Seu espaço começa aqui" : "Bom ter você de volta"}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {isRegistering
            ? "Crie sua conta para compartilhar suas ideias."
            : "Digite sua senha para continuar."}
        </p>
      </div>
      <div className="mb-5 flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {!isRegistering && (
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-primary font-heading text-sm font-bold text-primary-foreground">
                {user?.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            {!isRegistering && (
              <p className="truncate text-sm font-semibold">{user?.name}</p>
            )}
            <p className="truncate text-xs text-muted-foreground" title={email}>
              {email}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="link"
          size="xs"
          className="shrink-0 hover:text-primary"
          disabled={isSubmitting}
          onClick={onBack}
        >
          Alterar
        </Button>
      </div>
      <form
        noValidate
        aria-label={isRegistering ? "Cadastro" : "Login"}
        aria-busy={isSubmitting}
        onSubmit={handleCredentialsSubmit}
        onChange={() => {
          setErrors({})
          setRequestError("")
        }}
        className="space-y-4"
      >
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="sr-only">
            {isRegistering ? "Dados para cadastro" : "Dados de acesso"}
          </legend>
          <input
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            readOnly
            hidden
          />
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Seu nome</Label>
              <Input
                id="auth-name"
                name="name"
                autoComplete="name"
                placeholder="Como podemos chamar você?"
                required
                maxLength={100}
                autoFocus
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "auth-name-error" : undefined}
                className="h-9 bg-secondary dark:bg-secondary"
              />
              {errors.name && (
                <p
                  id="auth-name-error"
                  className="text-sm leading-relaxed font-medium text-destructive"
                >
                  {errors.name}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="auth-password">
              {isRegistering ? "Crie sua senha" : "Senha"}
            </Label>
            <div className="relative">
              <Input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  isRegistering ? "new-password" : "current-password"
                }
                placeholder={
                  isRegistering ? "Pelo menos 8 caracteres" : "Digite sua senha"
                }
                required
                minLength={isRegistering ? 8 : undefined}
                autoFocus={!isRegistering}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "auth-password-error" : undefined
                }
                className="h-9 bg-secondary pr-10 dark:bg-secondary"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 size-9 text-muted-foreground"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && (
              <p
                id="auth-password-error"
                className="text-sm leading-relaxed font-medium text-destructive"
              >
                {errors.password}
              </p>
            )}
          </div>
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm-password">Confirme sua senha</Label>
              <div className="relative">
                <Input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  required
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "auth-confirm-error" : undefined
                  }
                  className="h-9 bg-secondary pr-10 dark:bg-secondary"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 size-9 text-muted-foreground"
                  aria-label={
                    showConfirmation
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  aria-pressed={showConfirmation}
                  onClick={() => setShowConfirmation(!showConfirmation)}
                >
                  {showConfirmation ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="auth-confirm-error"
                  className="text-sm leading-relaxed font-medium text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9 shrink-0"
              aria-label="Voltar"
              onClick={onBack}
            >
              <ArrowLeft />
            </Button>
            <Button type="submit" className="h-9 flex-1">
              {isSubmitting
                ? "Aguarde…"
                : isRegistering
                  ? "Criar conta"
                  : "Entrar"}
            </Button>
          </div>
        </fieldset>
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

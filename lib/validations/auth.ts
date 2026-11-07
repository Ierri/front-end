import { z } from "zod"

const email = z
  .string()
  .trim()
  .max(254, "O e-mail deve ter no máximo 254 caracteres.")
  .pipe(z.email("Digite um e-mail válido."))
  .transform((value) => value.toLowerCase())

export const emailSchema = z.object({ email })

export const loginSchema = emailSchema.extend({
  password: z
    .string()
    .min(1, "Digite sua senha para entrar.")
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "A senha deve ter no máximo 72 bytes."
    ),
})

export const registerSchema = emailSchema
  .extend({
    name: z
      .string()
      .trim()
      .min(1, "Digite seu nome para continuar.")
      .max(100, "Seu nome deve ter no máximo 100 caracteres."),
    password: z
      .string()
      .min(1, "Crie uma senha para sua conta.")
      .min(8, "Sua senha precisa ter pelo menos 8 caracteres.")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "A senha deve ter no máximo 72 bytes."
      ),
    confirmPassword: z
      .string()
      .min(1, "Digite sua senha novamente para confirmar."),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "As senhas não coincidem. Digite a mesma senha nos dois campos.",
    }
  )

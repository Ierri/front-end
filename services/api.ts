import { z } from "zod"

const defaultApiUrl = "https://hml-api-ierri.eulucas.com.br"
const objectIdPattern = /^[a-f\d]{24}$/i
const authErrorCodes = new Set([
  "AUTH_REQUIRED",
  "TOKEN_REQUIRED",
  "INVALID_TOKEN",
])

const failureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.object({ field: z.string(), message: z.string() })),
  }),
})

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details: { field: string; message: string }[] = []
  ) {
    super(message)
  }
}

export function isAuthApiError(error: unknown): boolean {
  return error instanceof ApiError && authErrorCodes.has(error.code)
}

export function assertObjectId(value: string): string {
  const normalized = value.trim()
  if (!objectIdPattern.test(normalized)) {
    throw new ApiError("Identificador inválido.", "VALIDATION_ERROR")
  }
  return normalized
}

export function assertLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ApiError("Limite inválido.", "VALIDATION_ERROR")
  }
  return limit
}

export function safeAvatarUrl(url: string | null | undefined): string {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href
    }
  } catch {
    return ""
  }
  return ""
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
    headers?: Record<string, string>
    signal?: AbortSignal
    timeoutMs?: number
  } = {}
): Promise<{ message: string; data: T }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || defaultApiUrl
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? 10000)
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal
  const requestBody: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
  const headers = new Headers(options.headers)
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  let response: Response
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: requestBody,
      cache: "no-store",
      credentials: "include",
      signal,
    })
  } catch {
    throw new ApiError(
      "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      "NETWORK_ERROR"
    )
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError(
      "O serviço retornou uma resposta inválida. Tente novamente.",
      "INVALID_RESPONSE"
    )
  }
  const failure = failureSchema.safeParse(payload)
  if (failure.success) {
    throw new ApiError(
      failure.data.error.message,
      failure.data.error.code,
      failure.data.error.details
    )
  }
  const result = z
    .object({ success: z.literal(true), message: z.string(), data: schema })
    .safeParse(payload)
  if (!response.ok || !result.success)
    throw new ApiError(
      "Não foi possível concluir a solicitação. Tente novamente.",
      "INVALID_RESPONSE"
    )
  return result.data
}

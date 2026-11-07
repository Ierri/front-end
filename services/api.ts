import { z } from "zod"

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

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
  } = {}
): Promise<{ message: string; data: T }> {
  let response: Response
  try {
    response = await fetch(
      `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")}${path}`,
      {
        method: options.method ?? "GET",
        headers: { "Content-Type": "application/json" },
        body:
          options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
        credentials: "include",
        signal: AbortSignal.timeout(10000),
      }
    )
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

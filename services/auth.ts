import { z } from "zod"
import type { AuthService } from "./auth.types"
import { apiRequest, ApiError } from "./api"

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
})
const resultSchema = z.object({ user: userSchema })
export const authService: AuthService = {
  async checkEmail(values) {
    try {
      const { data } = await apiRequest(
        "/auth/check-email",
        z.object({
          user: z.object({ name: z.string(), initials: z.string() }),
        }),
        { method: "POST", body: values }
      )
      return { nextStep: "login", user: data.user }
    } catch (error) {
      if (error instanceof ApiError && error.code === "USER_NOT_FOUND")
        return { nextStep: "register" }
      throw error
    }
  },
  async login(values) {
    const result = await apiRequest("/auth/login", resultSchema, {
      method: "POST",
      body: values,
    })
    return { message: result.message, user: result.data.user }
  },
  async register(values) {
    const result = await apiRequest("/auth/register", resultSchema, {
      method: "POST",
      body: values,
    })
    return { message: result.message, user: result.data.user }
  },
  async me() {
    try {
      return (await apiRequest("/auth/me", userSchema)).data
    } catch (error) {
      if (
        error instanceof ApiError &&
        ["AUTH_REQUIRED", "TOKEN_REQUIRED", "INVALID_TOKEN"].includes(
          error.code
        )
      )
        return null
      throw error
    }
  },
  async logout() {
    await apiRequest("/auth/logout", z.null(), { method: "POST", body: {} })
  },
}

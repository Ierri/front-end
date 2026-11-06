import type { AuthService } from "./types"

// Replace these operations with the real API adapter when the backend is available.
async function authenticationUnavailable(): Promise<never> {
  throw new Error("O serviço de autenticação ainda não está disponível.")
}

export const authService: AuthService = {
  checkEmail: authenticationUnavailable,
  login: authenticationUnavailable,
  register: authenticationUnavailable,
}

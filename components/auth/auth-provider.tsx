"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog"
import { safeReturnTo } from "@/lib/auth/return-to"
import { authService } from "@/services/auth"
import type { AuthUser } from "@/services/auth.types"

export type AuthStatus =
  "loading" | "authenticated" | "unauthenticated" | "error"

type RequireAuthOptions = { returnTo?: string }

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  error: string
  refreshSession: () => Promise<void>
  setAuthenticated: (user: AuthUser) => void
  logout: () => Promise<void>
  requireAuth: (options?: RequireAuthOptions) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function currentLocation() {
  if (typeof window === "undefined") return "/feed"
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const mountedRef = useRef(true)
  const requestRef = useRef<Promise<void> | null>(null)
  const sessionRevisionRef = useRef(0)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState("")
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptReturnTo, setPromptReturnTo] = useState("/feed")

  const refreshSession = useCallback(async () => {
    if (requestRef.current) return requestRef.current
    const sessionRevision = sessionRevisionRef.current

    const request = (async () => {
      try {
        const session = await authService.me()
        if (
          !mountedRef.current ||
          sessionRevision !== sessionRevisionRef.current
        )
          return
        setUser(session)
        setError("")
        setStatus(session ? "authenticated" : "unauthenticated")
        if (session) setPromptOpen(false)
      } catch (caught) {
        if (
          !mountedRef.current ||
          sessionRevision !== sessionRevisionRef.current
        )
          return
        setUser(null)
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível verificar sua sessão."
        )
        setStatus("error")
      } finally {
        if (sessionRevision === sessionRevisionRef.current)
          requestRef.current = null
      }
    })()

    requestRef.current = request
    return request
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void refreshSession()
    const handleFocus = () => void refreshSession()
    window.addEventListener("focus", handleFocus)
    return () => {
      mountedRef.current = false
      window.removeEventListener("focus", handleFocus)
    }
  }, [refreshSession])

  const setAuthenticated = useCallback((nextUser: AuthUser) => {
    sessionRevisionRef.current += 1
    requestRef.current = null
    setUser(nextUser)
    setError("")
    setStatus("authenticated")
    setPromptOpen(false)
  }, [])

  const logout = useCallback(async () => {
    sessionRevisionRef.current += 1
    requestRef.current = null
    await authService.logout()
    setUser(null)
    setError("")
    setStatus("unauthenticated")
  }, [])

  const requireAuth = useCallback(
    (options?: RequireAuthOptions) => {
      if (status === "authenticated") return true
      setPromptReturnTo(
        safeReturnTo(options?.returnTo ?? currentLocation(), "/feed")
      )
      setPromptOpen(true)
      return false
    },
    [status]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      error,
      refreshSession,
      setAuthenticated,
      logout,
      requireAuth,
    }),
    [error, logout, refreshSession, requireAuth, setAuthenticated, status, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthRequiredDialog
        open={promptOpen}
        onOpenChange={setPromptOpen}
        onContinue={() => {
          setPromptOpen(false)
          router.push(`/auth?returnTo=${encodeURIComponent(promptReturnTo)}`)
        }}
      />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider")
  return context
}

const DEFAULT_RETURN_TO = "/feed"

export function safeReturnTo(
  value: string | null | undefined,
  fallback = DEFAULT_RETURN_TO
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return fallback

  try {
    const url = new URL(value, "https://ierri.local")
    if (url.origin !== "https://ierri.local" || url.pathname === "/auth")
      return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

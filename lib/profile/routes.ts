const USERNAME_SEGMENT_PATTERN = /^[A-Za-z0-9_]{1,128}$/
const RESERVED_PROFILE_SEGMENTS = new Set(["edit", "saved"])

export function profileHref(username?: string | null): string | null {
  if (!username) return null
  const normalized = username.trim().replace(/^@/, "")
  if (!USERNAME_SEGMENT_PATTERN.test(normalized)) return null
  if (RESERVED_PROFILE_SEGMENTS.has(normalized.toLowerCase())) return null
  return `/profile/${encodeURIComponent(normalized)}`
}

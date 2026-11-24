const minuteMs = 60_000
const hourMs = 60 * minuteMs
const dayMs = 24 * hourMs

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const timestamp = date.getTime()
  if (Number.isNaN(timestamp)) return ""

  const diffMs = Date.now() - timestamp
  if (diffMs < minuteMs) return "Agora"
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)} min`
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)} h`
  if (diffMs < 7 * dayMs) return `${Math.floor(diffMs / dayMs)} d`

  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })
    .format(date)
    .replace(/\.$/, "")
}

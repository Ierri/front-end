import type { Metadata } from "next"

export const siteTitle = "Ierri - Boas interfaces merecem ser compartilhadas"
export const siteDescription =
  "Compartilhe suas interfaces, descubra projetos e troque feedbacks com designers, desenvolvedores e criadores digitais. Share. Review. Inspire."

const configuredUrl = process.env.SITE_URL || "http://localhost:3000"

// Sharing URLs always refer to the public origin, without paths or query strings.
export const siteUrl = new URL(new URL(configuredUrl).origin)

export function pageMetadata({
  path,
  title = siteTitle,
  description = siteDescription,
}: {
  path: string
  title?: string
  description?: string
}): Metadata {
  const url = new URL(path, siteUrl)
  const image = {
    url: new URL("/brand/ierri/social/open-graph-1200x630.png", siteUrl).href,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Ierri - Uma comunidade para criar, compartilhar e avaliar interfaces. Share. Review. Inspire.",
  }

  return {
    title,
    description,
    alternates: { canonical: url.href },
    openGraph: {
      type: "website",
      siteName: "Ierri",
      locale: "pt_BR",
      url: url.href,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

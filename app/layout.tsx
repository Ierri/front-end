import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const title = "Ierri - Share. Review. Inspire."
const description =
  "Compartilhe interfaces, descubra projetos e troque feedbacks com uma comunidade de designers, desenvolvedores e criadores digitais."
const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Ierri",
  title: { default: title, template: "%s | Ierri" },
  description,
  manifest: "/brand/ierri/icons/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/ierri/icons/favicon.svg", type: "image/svg+xml" },
      {
        url: "/brand/ierri/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/brand/ierri/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/brand/ierri/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Ierri",
    locale: "pt_BR",
    title,
    description,
    images: [
      {
        url: "/brand/ierri/social/open-graph-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Ierri - Interface Review. Share. Review. Inspire.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: "/brand/ierri/social/open-graph-1200x630.png",
        alt: "Ierri - Share. Review. Inspire.",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#FF4D3D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        spaceGroteskHeading.variable
      )}
    >
      <body>
        <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { pageMetadata, siteTitle, siteUrl } from "@/lib/metadata"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  ...pageMetadata({ path: "/" }),
  metadataBase: siteUrl,
  applicationName: "Ierri",
  title: { default: siteTitle, template: "%s | Ierri" },
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
        <ThemeProvider defaultTheme="light">
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

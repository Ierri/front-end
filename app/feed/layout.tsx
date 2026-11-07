import type { Metadata } from "next"

import { FeedHeader } from "@/components/feed/feed-header"

export const metadata: Metadata = {
  title: "Feed",
  description: "Descubra projetos e criadores da comunidade Ierri.",
}

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-svh bg-background">
      <FeedHeader />
      {children}
    </div>
  )
}

"use client"

import { useState, type ReactNode } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { CreatePostModal } from "@/components/feed/create-post-modal"

export function CreatePostTrigger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { requireAuth } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className={className}
        onClick={() => {
          if (requireAuth({ returnTo: "/feed/post/new" })) setOpen(true)
        }}
      >
        {children}
      </button>
      {open && <CreatePostModal onClose={() => setOpen(false)} />}
    </>
  )
}

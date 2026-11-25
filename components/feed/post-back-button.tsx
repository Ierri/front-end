"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function PostBackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push("/feed")
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Voltar
    </button>
  )
}

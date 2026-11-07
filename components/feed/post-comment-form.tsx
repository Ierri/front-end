"use client"

import { useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PostCommentForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!comment.trim()) {
      inputRef.current?.focus()
      return
    }

    setComment("")
    setStatus("Comentário enviado para demonstração.")
  }

  return (
    <form
      aria-label="Adicionar comentário"
      onSubmit={handleSubmit}
      className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-border bg-background p-4 sm:px-6"
    >
      <Label htmlFor="post-comment" className="sr-only">
        Comentário
      </Label>
      <Input
        ref={inputRef}
        id="post-comment"
        name="comment"
        value={comment}
        required
        placeholder="Escreva um comentário..."
        onChange={(event) => {
          setComment(event.target.value)
          setStatus("")
        }}
        className="h-9 flex-1 bg-muted dark:bg-muted"
      />
      <Button type="submit" className="h-9 shrink-0">
        Enviar
      </Button>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </form>
  )
}

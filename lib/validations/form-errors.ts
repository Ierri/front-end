import type { z } from "zod"

export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field === "string") errors[field] ??= issue.message
  }
  return errors
}

export function focusFirstInvalidField(
  form: HTMLFormElement,
  errors: Record<string, string>
) {
  const field = form.elements.namedItem(Object.keys(errors)[0])
  if (field instanceof HTMLElement) field.focus()
}

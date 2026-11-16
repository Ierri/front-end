export type PostMediaKind = "image" | "video"

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const IMAGE_EXTENSIONS = new Set(["jpeg", "jpg", "png", "webp"])

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"])
const VIDEO_EXTENSIONS = new Set(["mp4", "webm"])

export function getPostMediaKind(file: {
  name: string
  type: string
}): PostMediaKind | null {
  if (IMAGE_MIME_TYPES.has(file.type)) return "image"
  if (VIDEO_MIME_TYPES.has(file.type)) return "video"

  const extension = file.name.toLowerCase().split(".").pop()
  if (!extension) return null
  if (IMAGE_EXTENSIONS.has(extension)) return "image"
  if (VIDEO_EXTENSIONS.has(extension)) return "video"
  return null
}

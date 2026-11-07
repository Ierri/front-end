export type PostMediaKind = "image" | "video"

const IMAGE_EXTENSIONS = new Set([
  "avif",
  "bmp",
  "gif",
  "heic",
  "heif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
])

const VIDEO_EXTENSIONS = new Set([
  "3gp",
  "m4v",
  "mov",
  "mp4",
  "mpeg",
  "mpg",
  "ogv",
  "webm",
])

export function getPostMediaKind(file: {
  name: string
  type: string
}): PostMediaKind | null {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"

  const extension = file.name.toLowerCase().split(".").pop()
  if (!extension) return null
  if (IMAGE_EXTENSIONS.has(extension)) return "image"
  if (VIDEO_EXTENSIONS.has(extension)) return "video"
  return null
}

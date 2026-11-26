import { useEffect, useState } from "react"

const sampleSize = 48
const hueCount = 24

type ColorSample = { weight: number; red: number; green: number; blue: number }

function emptySample(): ColorSample {
  return { weight: 0, red: 0, green: 0, blue: 0 }
}

function addSample(
  sample: ColorSample,
  weight: number,
  red: number,
  green: number,
  blue: number
) {
  sample.weight += weight
  sample.red += red * weight
  sample.green += green * weight
  sample.blue += blue * weight
}

function avatarColor(pixels: Uint8ClampedArray) {
  const hues = Array.from({ length: hueCount }, emptySample)
  const average = emptySample()
  let colorfulArea = 0

  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const index = (y * sampleSize + x) * 4
      const alpha = pixels[index + 3] / 255
      const distance =
        Math.hypot((x + 0.5) / sampleSize - 0.5, (y + 0.5) / sampleSize - 0.5) *
        2
      if (alpha < 0.5 || distance >= 1) continue

      const red = pixels[index]
      const green = pixels[index + 1]
      const blue = pixels[index + 2]
      const peak = Math.max(red, green, blue)
      const chroma = peak - Math.min(red, green, blue)
      const area = (1 - distance ** 2) * alpha
      addSample(average, area, red, green, blue)
      if (chroma < 32 || peak < 64) continue

      colorfulArea += area
      const hue =
        peak === red
          ? (green - blue) / chroma
          : peak === green
            ? 2 + (blue - red) / chroma
            : 4 + (red - green) / chroma
      const position = ((hue + 6) % 6) * (hueCount / 6)
      const lower = Math.floor(position)
      const fraction = position - lower
      const weight = area * (chroma / 255) ** 1.5 * (chroma / peak)
      addSample(hues[lower], weight * (1 - fraction), red, green, blue)
      addSample(
        hues[(lower + 1) % hueCount],
        weight * fraction,
        red,
        green,
        blue
      )
    }
  }

  const dominant = hues.reduce((best, hue) =>
    hue.weight > best.weight ? hue : best
  )
  const sample = colorfulArea >= average.weight * 0.04 ? dominant : average
  if (!sample.weight) return undefined
  const rgb = [sample.red, sample.green, sample.blue].map((channel) =>
    Math.round(channel / sample.weight)
  )
  return `rgb(${rgb.join(" ")})`
}

export function useProfileColor(avatarUrl?: string | null) {
  const [palette, setPalette] = useState<{ url: string; color: string }>()

  useEffect(() => {
    if (!avatarUrl) return

    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = sampleSize
      const context = canvas.getContext("2d")
      if (!context) return

      const size = Math.min(image.naturalWidth, image.naturalHeight)
      if (!size) return
      context.drawImage(
        image,
        (image.naturalWidth - size) / 2,
        (image.naturalHeight - size) / 2,
        size,
        size,
        0,
        0,
        sampleSize,
        sampleSize
      )
      const color = avatarColor(
        context.getImageData(0, 0, sampleSize, sampleSize).data
      )
      if (color) setPalette({ url: avatarUrl, color })
    }
    image.src = avatarUrl

    return () => {
      image.onload = null
    }
  }, [avatarUrl])

  return palette?.url === avatarUrl ? palette?.color : undefined
}

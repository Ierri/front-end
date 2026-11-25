import { useEffect, useState } from "react"

export function useProfileColor(avatarUrl?: string | null) {
  const [palette, setPalette] = useState<{ url: string; color: string }>()

  useEffect(() => {
    if (!avatarUrl) return

    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 24
      const context = canvas.getContext("2d")
      if (!context) return

      context.drawImage(image, 0, 0, 24, 24)
      const pixels = context.getImageData(0, 0, 24, 24).data
      const groups = new Map<number, { weight: number; channels: number[] }>()
      const colorful = new Map<number, { weight: number; channels: number[] }>()
      let visiblePixels = 0
      let colorfulPixels = 0

      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) continue
        const channels = [pixels[i], pixels[i + 1], pixels[i + 2]]
        const [r, g, b] = channels.map((value) => value >> 5)
        const key = r * 64 + g * 8 + b
        visiblePixels++
        const max = Math.max(...channels)
        const chroma = max - Math.min(...channels)
        const isColorful = chroma >= 32 && max >= 60
        if (isColorful) colorfulPixels++
        const histogram = isColorful ? colorful : groups
        const weight = isColorful ? chroma : 1
        const group = histogram.get(key) ?? { weight: 0, channels: [0, 0, 0] }
        group.weight += weight
        channels.forEach((value, index) => {
          group.channels[index] += value * weight
        })
        histogram.set(key, group)
      }

      const histogram =
        colorfulPixels >= visiblePixels * 0.1 || groups.size === 0
          ? colorful
          : groups
      const dominant = [...histogram.values()].sort(
        (a, b) => b.weight - a.weight
      )[0]
      if (dominant) {
        const color = dominant.channels.map((value) =>
          Math.round(value / dominant.weight)
        )
        setPalette({ url: avatarUrl, color: `rgb(${color.join(" ")})` })
      }
    }
    image.src = avatarUrl

    return () => {
      image.onload = null
    }
  }, [avatarUrl])

  return palette?.url === avatarUrl ? palette?.color : undefined
}

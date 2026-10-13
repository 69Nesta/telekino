export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number
  s: number
  l: number
}

export function clamp(val: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, Math.round(Number(val) || 0)))
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const normR = clamp(r) / 255
  const normG = clamp(g) / 255
  const normB = clamp(b) / 255

  const max = Math.max(normR, normG, normB)
  const min = Math.min(normR, normG, normB)
  const d = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case normR:
        h = ((normG - normB) / d + (normG < normB ? 6 : 0)) * 60
        break
      case normG:
        h = ((normB - normR) / d + 2) * 60
        break
      case normB:
        h = ((normR - normG) / d + 4) * 60
        break
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const normH = (((h % 360) + 360) % 360) / 360
  const normS = Math.min(100, Math.max(0, s)) / 100
  const normL = Math.min(100, Math.max(0, l)) / 100

  if (normS === 0) {
    const val = Math.round(normL * 255)
    return { r: val, g: val, b: val }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let normalizedT = t
    if (normalizedT < 0) normalizedT += 1
    if (normalizedT > 1) normalizedT -= 1
    if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT
    if (normalizedT < 1 / 2) return q
    if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6
    return p
  }

  const q = normL < 0.5 ? normL * (1 + normS) : normL + normS - normL * normS
  const p = 2 * normL - q

  return {
    r: Math.round(hue2rgb(p, q, normH + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, normH) * 255),
    b: Math.round(hue2rgb(p, q, normH - 1 / 3) * 255),
  }
}

export function enhanceAmbientColor(raw: RGB): RGB {
  const clean: RGB = {
    r: clamp(raw.r),
    g: clamp(raw.g),
    b: clamp(raw.b),
  }

  const hsl = rgbToHsl(clean)

  if (hsl.l < 4) {
    return { r: 24, g: 30, b: 46 }
  }

  if (hsl.s > 4 && hsl.s < 55) {
    hsl.s = Math.min(85, Math.round(hsl.s * 1.5 + 22))
  }

  if (hsl.l < 16) {
    hsl.l = 18
  } else if (hsl.l > 62) {
    hsl.l = 55
  }

  return hslToRgb(hsl)
}

export interface ProcessedPalette {
  primary: RGB
  secondary: RGB
  tertiary: RGB
  screenBloom: RGB
  glowRgb: string
  secondaryGlowRgb: string
  tertiaryGlowRgb: string
}

export function generateHarmonicPalette(color: RGB): ProcessedPalette {
  const primary = enhanceAmbientColor(color)
  const hsl = rgbToHsl(primary)

  const secondaryHsl: HSL = {
    h: (hsl.h + 32) % 360,
    s: Math.max(35, Math.round(hsl.s * 0.88)),
    l: Math.max(14, Math.round(hsl.l * 0.9)),
  }
  const secondary = hslToRgb(secondaryHsl)

  const tertiaryHsl: HSL = {
    h: (hsl.h - 24 + 360) % 360,
    s: Math.max(40, Math.round(hsl.s * 0.95)),
    l: Math.max(8, Math.round(hsl.l * 0.35)),
  }
  const tertiary = hslToRgb(tertiaryHsl)

  const bloomHsl: HSL = {
    h: hsl.h,
    s: Math.min(100, Math.round(hsl.s * 1.05)),
    l: Math.min(70, Math.round(hsl.l * 1.15 + 4)),
  }
  const screenBloom = hslToRgb(bloomHsl)

  return {
    primary,
    secondary,
    tertiary,
    screenBloom,
    glowRgb: `${primary.r}, ${primary.g}, ${primary.b}`,
    secondaryGlowRgb: `${secondary.r}, ${secondary.g}, ${secondary.b}`,
    tertiaryGlowRgb: `${tertiary.r}, ${tertiary.g}, ${tertiary.b}`,
  }
}

export const AMBIENT_INTENSITY_CONFIG = {
  bloomOpacity: 0.42,
  orb1Opacity: 0.34,
  orb2Opacity: 0.24,
  cardGlowOpacity: 0.22,
  ambientAlpha: 0.55,
}

export const IDLE_AMBIENT_COLOR: RGB = { r: 24, g: 30, b: 46 }

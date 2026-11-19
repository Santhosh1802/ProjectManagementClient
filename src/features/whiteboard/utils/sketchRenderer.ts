import type {
  RoughnessLevel,
  RoundnessStyle,
  WhiteboardElement,
} from "../types/whiteboard.types"

/** Deterministic PRNG so hand-drawn jitter stays stable across renders. */
function mulberry32(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function jitter(rand: () => number, amplitude: number) {
  return (rand() - 0.5) * 2 * amplitude
}

/** Generates a single or double-pass sketchy line SVG path between two points. */
export function buildSketchLinePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  roughness: RoughnessLevel
): string {
  if (roughness === 0) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }

  const rand = mulberry32(seed)
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const amp = Math.min(3.5, (dist / 120) * (roughness === 2 ? 2.6 : 1.35))
  const passes = roughness === 2 ? 2 : 1
  const parts: string[] = []

  for (let p = 0; p < passes; p++) {
    const mx = (x1 + x2) / 2 + jitter(rand, amp)
    const my = (y1 + y2) / 2 + jitter(rand, amp)
    const sx = x1 + jitter(rand, amp * 0.45)
    const sy = y1 + jitter(rand, amp * 0.45)
    const ex = x2 + jitter(rand, amp * 0.45)
    const ey = y2 + jitter(rand, amp * 0.45)
    parts.push(`M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`)
  }

  return parts.join(" ")
}

/** Generates a hand-drawn rectangle path (sharp or rounded, 1 or 2 passes). */
export function buildSketchRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  roughness: RoughnessLevel,
  roundness: RoundnessStyle = "round"
): string {
  const r = roundness === "round" ? Math.min(12, w * 0.16, h * 0.16) : 0
  if (roughness === 0) {
    if (r <= 0) {
      return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`
    }
    return [
      `M ${x + r} ${y}`,
      `L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r}`,
      `L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
      `L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r}`,
      `L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`,
    ].join(" ")
  }

  const rand = mulberry32(seed)
  const passes = roughness === 2 ? 2 : 1
  const amp = roughness === 2 ? 2.2 : 1.25
  const paths: string[] = []

  for (let p = 0; p < passes; p++) {
    const j = () => jitter(rand, amp)
    if (r <= 0) {
      paths.push(
        buildSketchLinePath(x + j(), y + j(), x + w + j(), y + j(), seed + p * 11 + 1, roughness),
        buildSketchLinePath(x + w + j(), y + j(), x + w + j(), y + h + j(), seed + p * 11 + 2, roughness),
        buildSketchLinePath(x + w + j(), y + h + j(), x + j(), y + h + j(), seed + p * 11 + 3, roughness),
        buildSketchLinePath(x + j(), y + h + j(), x + j(), y + j(), seed + p * 11 + 4, roughness)
      )
    } else {
      paths.push(
        [
          `M ${(x + r + j()).toFixed(1)} ${(y + j()).toFixed(1)}`,
          `Q ${(x + w / 2 + j()).toFixed(1)} ${(y + j() * 1.4).toFixed(1)} ${(x + w - r + j()).toFixed(1)} ${(y + j()).toFixed(1)}`,
          `Q ${(x + w + j()).toFixed(1)} ${(y + j()).toFixed(1)} ${(x + w + j()).toFixed(1)} ${(y + r + j()).toFixed(1)}`,
          `Q ${(x + w + j() * 1.4).toFixed(1)} ${(y + h / 2 + j()).toFixed(1)} ${(x + w + j()).toFixed(1)} ${(y + h - r + j()).toFixed(1)}`,
          `Q ${(x + w + j()).toFixed(1)} ${(y + h + j()).toFixed(1)} ${(x + w - r + j()).toFixed(1)} ${(y + h + j()).toFixed(1)}`,
          `Q ${(x + w / 2 + j()).toFixed(1)} ${(y + h + j() * 1.4).toFixed(1)} ${(x + r + j()).toFixed(1)} ${(y + h + j()).toFixed(1)}`,
          `Q ${(x + j()).toFixed(1)} ${(y + h + j()).toFixed(1)} ${(x + j()).toFixed(1)} ${(y + h - r + j()).toFixed(1)}`,
          `Q ${(x + j() * 1.4).toFixed(1)} ${(y + h / 2 + j()).toFixed(1)} ${(x + j()).toFixed(1)} ${(y + r + j()).toFixed(1)}`,
          `Q ${(x + j()).toFixed(1)} ${(y + j()).toFixed(1)} ${(x + r + j()).toFixed(1)} ${(y + j()).toFixed(1)}`,
        ].join(" ")
      )
    }
  }

  return paths.join(" ")
}

/** Generates a hand-drawn diamond path. */
export function buildSketchDiamondPath(
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  roughness: RoughnessLevel
): string {
  const cx = x + w / 2
  const cy = y + h / 2
  if (roughness === 0) {
    return `M ${cx} ${y} L ${x + w} ${cy} L ${cx} ${y + h} L ${x} ${cy} Z`
  }

  const passes = roughness === 2 ? 2 : 1
  const parts: string[] = []
  for (let p = 0; p < passes; p++) {
    const s = seed + p * 31
    parts.push(
      buildSketchLinePath(cx, y, x + w, cy, s + 1, roughness),
      buildSketchLinePath(x + w, cy, cx, y + h, s + 2, roughness),
      buildSketchLinePath(cx, y + h, x, cy, s + 3, roughness),
      buildSketchLinePath(x, cy, cx, y, s + 4, roughness)
    )
  }
  return parts.join(" ")
}

/** Generates a hand-drawn ellipse path using segmented cubic/quadratic approximations. */
export function buildSketchEllipsePath(
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  roughness: RoughnessLevel
): string {
  const cx = x + w / 2
  const cy = y + h / 2
  const rx = Math.max(4, w / 2)
  const ry = Math.max(4, h / 2)

  if (roughness === 0) {
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`
  }

  const rand = mulberry32(seed)
  const passes = roughness === 2 ? 2 : 1
  const amp = roughness === 2 ? 2.6 : 1.4
  const steps = 20
  const paths: string[] = []

  for (let p = 0; p < passes; p++) {
    const pts: { px: number; py: number }[] = []
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const px = cx + Math.cos(angle) * rx + jitter(rand, amp)
      const py = cy + Math.sin(angle) * ry + jitter(rand, amp)
      pts.push({ px, py })
    }
    let d = `M ${pts[0].px.toFixed(1)} ${pts[0].py.toFixed(1)}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const mx = (prev.px + curr.px) / 2
      const my = (prev.py + curr.py) / 2
      d += ` Q ${prev.px.toFixed(1)} ${prev.py.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
    }
    paths.push(d + " Z")
  }

  return paths.join(" ")
}

/** Generates a hand-drawn arrowhead path at (x2, y2) pointing from (x1, y1). */
export function buildArrowheadPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  roughness: RoughnessLevel
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const len = 13
  const spread = Math.PI / 6.5

  const ax1 = x2 - len * Math.cos(angle - spread)
  const ay1 = y2 - len * Math.sin(angle - spread)
  const ax2 = x2 - len * Math.cos(angle + spread)
  const ay2 = y2 - len * Math.sin(angle + spread)

  return [
    buildSketchLinePath(x2, y2, ax1, ay1, seed + 17, roughness),
    buildSketchLinePath(x2, y2, ax2, ay2, seed + 29, roughness),
  ].join(" ")
}

/** Computes axis-aligned bounding box for any WhiteboardElement. */
export function getElementBounds(el: WhiteboardElement): {
  x: number
  y: number
  width: number
  height: number
} {
  if (el.type === "pen" && el.points && el.points.length > 0) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const pt of el.points) {
      if (pt.x < minX) minX = pt.x
      if (pt.y < minY) minY = pt.y
      if (pt.x > maxX) maxX = pt.x
      if (pt.y > maxY) maxY = pt.y
    }
    return {
      x: minX - 4,
      y: minY - 4,
      width: Math.max(16, maxX - minX + 8),
      height: Math.max(16, maxY - minY + 8),
    }
  }

  if (el.type === "arrow" || el.type === "line") {
    const x2 = el.x2 ?? el.x + 80
    const y2 = el.y2 ?? el.y
    const minX = Math.min(el.x, x2)
    const minY = Math.min(el.y, y2)
    return {
      x: minX - 6,
      y: minY - 6,
      width: Math.max(16, Math.abs(x2 - el.x) + 12),
      height: Math.max(16, Math.abs(y2 - el.y) + 12),
    }
  }

  return {
    x: el.x,
    y: el.y,
    width: Math.max(24, el.width),
    height: Math.max(24, el.height),
  }
}

export function isPointInElement(px: number, py: number, el: WhiteboardElement): boolean {
  const b = getElementBounds(el)
  return px >= b.x - 6 && px <= b.x + b.width + 6 && py >= b.y - 6 && py <= b.y + b.height + 6
}

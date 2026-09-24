/**
 * Pointer targets that follow each PNG object's silhouette.
 *
 * The object images are transparent cut-outs (a headshot, a mug with a
 * handle, a camera), so their rectangular boxes contain transparent
 * corners. The carousel's hit area is a convex polygon around the opaque
 * pixels instead, computed once per image from a small copy of its alpha
 * channel, so a click on empty space beside an object never opens it and
 * neighbouring targets never overlap. Until it is ready (or if the image
 * cannot be read), the hit area is the image box.
 */

type Point = [number, number]

/** Computed polygons, by image URL (shared by every carousel instance). */
const cache = new Map<string, string | null>()

/** Width of the sampling canvas (px); plenty for a hit shape. */
const SAMPLE = 96
/** Pixels at least this opaque count as part of the object. */
const ALPHA_MIN = 96

function cross(o: Point, a: Point, b: Point) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

/** Andrew's monotone chain. */
function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (pts.length < 3) return pts
  const lower: Point[] = []
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop()
    lower.push(p)
  }
  const upper: Point[] = []
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop()
    upper.push(p)
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

/** The silhouette polygon of a loaded image as a CSS `polygon()` in percent of its box, or null. */
function hullOf(img: HTMLImageElement): string | null {
  const w = SAMPLE
  const h = Math.max(1, Math.round((SAMPLE * img.naturalHeight) / Math.max(1, img.naturalWidth)))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, w, h)
  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, w, h).data
  } catch {
    return null
  }
  // The outermost opaque pixel of each row, as pixel corners (so the hull encloses whole pixels).
  const points: Point[] = []
  for (let y = 0; y < h; y++) {
    let first = -1
    let last = -1
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] >= ALPHA_MIN) {
        if (first < 0) first = x
        last = x
      }
    }
    if (first < 0) continue
    points.push([first, y], [first, y + 1], [last + 1, y], [last + 1, y + 1])
  }
  if (points.length < 3) return null
  const hull = convexHull(points)
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`
  return `polygon(${hull.map(([x, y]) => `${pct(x, w)} ${pct(y, h)}`).join(', ')})`
}

/**
 * Applies the silhouette of `img` (once loaded) as the clip-path of `hit`.
 * Returns a cleanup that stops waiting for the image.
 */
export function fitHitArea(img: HTMLImageElement | null, hit: HTMLElement | null): () => void {
  if (!img || !hit) return () => {}
  let cancelled = false
  const apply = () => {
    if (cancelled || !img.naturalWidth) return
    const key = img.currentSrc || img.src
    if (!cache.has(key)) cache.set(key, hullOf(img))
    const polygon = cache.get(key)
    if (polygon) hit.style.clipPath = polygon
  }
  if (img.complete && img.naturalWidth) apply()
  else img.addEventListener('load', apply, { once: true })
  return () => {
    cancelled = true
    img.removeEventListener('load', apply)
  }
}

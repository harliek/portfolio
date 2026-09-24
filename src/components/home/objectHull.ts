/**
 * Pointer targets that follow each PNG object's silhouette.
 *
 * The object images are transparent cut-outs (a headshot, a mug with a
 * handle, a monitor on a stand), so their rectangular boxes contain
 * transparent corners. The gallery's hit area is an outline around the
 * opaque pixels instead, computed once per image from a small copy of its
 * alpha channel: for each band of rows the outermost opaque pixels, joined
 * down the left side and back up the right. A click on empty space beside
 * an object (or beside a monitor's stand) never opens it, and where a
 * nearer object overlaps a farther one only the nearer one's shape takes
 * the pointer. Until it is ready (or if the image cannot be read), the hit
 * area is the image box.
 */

/** Computed polygons, by image URL (shared by every gallery instance). */
const cache = new Map<string, string | null>()

/** Width of the sampling canvas (px); plenty for a hit shape. */
const SAMPLE = 96
/** Rows per band of the outline. */
const BAND = 3
/** Pixels at least this opaque count as part of the object. */
const ALPHA_MIN = 96

/** The silhouette outline of a loaded image as a CSS `polygon()` in percent of its box, or null. */
function outlineOf(img: HTMLImageElement): string | null {
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
  // The outermost opaque pixels of each band, as pixel corners (so the outline encloses whole pixels).
  const left: Array<[number, number]> = []
  const right: Array<[number, number]> = []
  for (let y0 = 0; y0 < h; y0 += BAND) {
    const y1 = Math.min(h, y0 + BAND)
    let first = -1
    let last = -1
    for (let y = y0; y < y1; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] >= ALPHA_MIN) {
          if (first < 0 || x < first) first = x
          if (x + 1 > last) last = x + 1
        }
      }
    }
    if (first < 0) continue
    left.push([first, y0], [first, y1])
    right.push([last, y0], [last, y1])
  }
  if (left.length < 2) return null
  const points = left.concat(right.reverse())
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`
  return `polygon(${points.map(([x, y]) => `${pct(x, w)} ${pct(y, h)}`).join(', ')})`
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
    if (!cache.has(key)) cache.set(key, outlineOf(img))
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

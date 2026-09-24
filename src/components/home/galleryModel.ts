import { GALLERY } from '../../config/carousel'
import { GALLERY_ITEMS, type CarouselItem } from '../../content/carousel'
import { getImage } from '../../content/media'

/**
 * Geometry of the homepage depth gallery (see src/config/carousel.ts).
 *
 * Every object's look is derived from one value, its signed depth d (its
 * offset from the active slot, in items; a = |d|), which in turn comes from
 * the gallery's one continuous position `pos`. So the drift, the wheel's
 * acceleration, the arrow steps and a swipe all move the objects through the
 * same smooth path, and an object's place, rise, scale, turn, light, label
 * and stacking order always describe the same depth:
 *
 * - scale s(a): 1 in front, 0.67 beside it, 0.45 two away (× the object's
 *   own baseScale, which sets its size in front);
 * - y: the base rises towards the far wall as s falls (a receding floor);
 * - x: a curved rail. At each resting position (an integer `pos`) the
 *   neighbours stand a fixed gap clear of the active object and the edge
 *   objects are set at the window's edges with a share of them inside; in
 *   between, each object follows a smooth monotone curve through its own
 *   resting places, so it never stops or reverses while the travel runs;
 * - the turn away from the active slot, which leads the travel (most of an
 *   object's turn happens in the first third of each step, in the
 *   direction of travel);
 * - light, dimming, label size and opacity: knot tables over a.
 */

export type WidthClass = keyof typeof GALLERY.layout
export type LayoutParams = (typeof GALLERY.layout)[WidthClass]

/** A box in stage px: left, top, right, bottom. */
export interface Box {
  l: number
  t: number
  r: number
  b: number
}

export interface Scene {
  /** Stage size (the viewport). */
  W: number
  H: number
  /** Size factor (includes `fit`). */
  u: number
  cls: WidthClass
  p: LayoutParams
  /** The active slot's centre (px). */
  x0: number
  /** The active object's base line (px). */
  yb0: number
  /** What the objects keep clear of: the identity block's lines and the portrait (stage px). */
  keep: Box[]
  /** The whole gallery's share of its size at the window's size factor (below 1 only where an object would come too close to the identity block or the portrait). */
  fit: number
  /** Each object's layout box (px) at its largest (the front, with any phone boost) and that boost. */
  widths: Float64Array
  heights: Float64Array
  boost: Float64Array
  /** Resting places on the rail: x of the object in slot k (−4 to 4) when `pos` rests on r, at [r * SLOTS + k + 4]. */
  slotX: Float64Array
}

/** What the scene must keep clear of, in stage px (measured by DepthGallery). */
export interface SceneFrame {
  /** The identity block's lines (name, PORTFOLIO, the supporting line) and the portrait's box. */
  keep?: Box[]
  /** Height of the tallest label at full size (px). */
  label?: number
}

export interface Placement {
  /** Signed depth: offset from the active slot (items; negative = left). */
  d: number
  /** Distance from the active slot (|d|). */
  a: number
  /** Depth scale (1 = active). */
  s: number
  /** Scale of the object's layout box (the depth scale × the share of any front boost in effect). */
  k: number
  /** Turn away from the active slot (radians, for rotateY). */
  turn: number
  /** Centre x of the object's base (px). */
  x: number
  /** Base line y (px). */
  base: number
  /** Projected half-width (px). */
  hw: number
  /** Share still shown before wrapping round (1 near the front, 0 once far enough to wrap). */
  vis: number
  /** Opacity (the wrap fade and the wheel's far dimming). */
  op: number
  /** Light by depth (GALLERY.light). */
  glow: number
  dim: number
  spill: number
  shadow: number
  reflect: number
  /** Label: scale (with the depth) and title and subtitle opacity (before collision control). */
  ls: number
  lt: number
  lsub: number
  /** Stacking order. */
  z: number
}

export const newPlacement = (): Placement => ({ d: 0, a: 0, s: 1, k: 1, turn: 0, x: 0, base: 0, hw: 0, vis: 1, op: 1, glow: 0, dim: 0, spill: 0, shadow: 0, reflect: 0, ls: 1, lt: 1, lsub: 1, z: 100 })

/** The layout box of each object in front at u = 1 (px), from its baseScale (equal opaque area × baseScale²). */
export interface ObjectSize {
  w: number
  h: number
}

export function featuredSize(item: CarouselItem): ObjectSize {
  const image = getImage(item.image)
  const ratio = image.width / image.height
  const side = GALLERY.ref * GALLERY.baseScale[item.kind]
  const area = (side * side) / GALLERY.opaque[item.kind]
  const w = Math.sqrt(area * ratio)
  return { w, h: w / ratio }
}

export const FEATURED_SIZES: ObjectSize[] = GALLERY_ITEMS.map(featuredSize)
const WIDEST = Math.max(...FEATURED_SIZES.map((s) => s.w))
const N = GALLERY_ITEMS.length
/** Resting slots kept per position: −4 to 4. */
const SLOTS = 9

/**
 * The top edge of each object's silhouette: for 24 equal columns across its
 * image, the share of the image height above its first opaque pixel (alpha
 * of at least 96 of 255; 1 for a column with none). Measured from the 960px
 * files in public/media/img; the keep-out check reads the object's real
 * outline (a mug's handle, a camera's lens) instead of its box.
 */
const TOP_PROFILE: Partial<Record<CarouselItem['image'], readonly number[]>> = {
  'obj-merchandising-platform': Array.from({ length: 24 }, () => 0.006),
  'obj-cafepress-uk': [0.046, 0.035, 0.028, 0.024, 0.02, 0.018, 0.017, 0.016, 0.016, 0.016, 0.016, 0.016, 0.017, 0.019, 0.023, 0.028, 0.037, 0.069, 0.139, 0.139, 0.146, 0.169, 0.211, 0.293],
  'obj-spreadsheet-agent': [0.902, ...Array.from({ length: 22 }, (_, j) => (j === 0 || j === 21 ? 0.021 : 0.018)), 0.902],
  'obj-ai-leasing-agent': [0.025, ...Array.from({ length: 22 }, () => 0.013), 0.025],
  'obj-creative-production': [0.406, 0.333, 0.298, 0.257, 0.223, 0.222, 0.223, 0.124, 0.067, 0.029, 0.017, 0.017, 0.023, 0.022, 0.054, 0.06, 0.11, 0.16, 0.195, 0.195, 0.222, 0.222, 0.223, 0.293],
  'obj-jumpstart-finance': [0.093, 0.044, 0.028, 0.021, ...Array.from({ length: 16 }, () => 0.019), 0.021, 0.029, 0.046, 0.096],
}
const PROFILES: readonly (readonly number[])[] = GALLERY_ITEMS.map((item) => TOP_PROFILE[item.image] ?? [0])

/** The item active at a fresh opening: Merchandising Platform (Film and Campaign Work two to its left, CafePress UK beside it on the right). */
export const OPENING_POS = 0

export const widthClass = (w: number): WidthClass => (w >= 1000 ? 'desktop' : w >= 600 ? 'tablet' : 'phone')

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Offset of item index `i` from `pos` on the loop of `n`, in [−n/2, n/2). */
export function wrapOffset(i: number, pos: number, n: number) {
  let r = (((i - pos) % n) + n) % n
  if (r >= n / 2) r -= n
  return r
}

/** Positive modulo. */
export const mod = (v: number, n: number) => ((v % n) + n) % n

/** The size factor for a window (see GALLERY.size), before the keep-out fit. */
export function sizeFactor(W: number, H: number, cls: WidthClass) {
  const { min, max, heightOffset, heightSpan, fitBelow, fit } = GALLERY.size
  const byHeight = (H - heightOffset) / heightSpan
  let u = Math.min(W / 1440, byHeight)
  if (W < fitBelow) u = Math.min(byHeight, (W * (cls === 'phone' ? fit.phone : fit.tablet)) / WIDEST)
  return clamp(u, min, max)
}

/** Depth scale at distance a from the active slot (1 there; smooth through it). */
export const depthScale = (a: number, p: LayoutParams) => 1 / (1 + p.k * (Math.sqrt(a * a + p.c * p.c) - p.c))

/** Fritsch–Butland slope between two secants: monotone, 0 at an extremum. */
const slope = (a: number, b: number) => (a * b <= 0 ? 0 : (2 * a * b) / (a + b))

/** Cubic Hermite on [0, 1] from p1 (slope m1) to p2 (slope m2). */
function hermite(t: number, p1: number, p2: number, m1: number, m2: number) {
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2
}

/**
 * A knot table over a = 0, 1, 2, 3 (GALLERY.light, GALLERY.label) read at
 * a: a smooth monotone curve, flat at the active slot (so a value changes
 * smoothly as an object passes through it) and after the last knot.
 */
export function knot(v: readonly number[], a: number) {
  const n = v.length
  if (a <= 0) return v[0]
  if (a >= n - 1) return v[n - 1]
  const i = Math.floor(a)
  const d0 = i > 0 ? v[i] - v[i - 1] : 0
  const d1 = v[i + 1] - v[i]
  const d2 = i + 2 < n ? v[i + 2] - v[i + 1] : 0
  const m1 = i === 0 ? 0 : slope(d0, d1)
  const m2 = i + 1 >= n - 1 ? 0 : slope(d1, d2)
  return hermite(a - i, v[i], v[i + 1], m1, m2)
}

const DEG = Math.PI / 180
/** The turn of a resting slot k (signed, radians): away from the active slot. */
const slotTurn = (k: number, p: LayoutParams) => Math.sign(k) * p.turn[Math.min(Math.abs(k), p.turn.length - 1)] * DEG

/**
 * The turn at signed depth d (radians). Between two resting slots the turn
 * leads the travel: moving leftward (d falling; `left` = 1) an object covers
 * 1 − (1 − q)^lead of its turn at progress q, so the object leaving the
 * front turns away at once and the one arriving straightens early; moving
 * rightward (`left` = 0) the same holds in that direction. `left` between 0
 * and 1 blends the two (a change of direction eases over a few frames).
 */
export function turnAt(d: number, p: LayoutParams, left = 1) {
  const hi = Math.ceil(d)
  const q = hi - d
  if (q === 0) return slotTurn(hi, p)
  const from = slotTurn(hi, p)
  const to = slotTurn(hi - 1, p)
  const lead = (x: number) => 1 - Math.pow(1 - x, p.lead)
  const m = left * lead(q) + (1 - left) * (1 - lead(1 - q))
  return from + (to - from) * m
}

/** The box scale at distance a: the depth scale, with any phone front boost fading out beside the front. */
const boxScale = (a: number, boost: number, p: LayoutParams) => (depthScale(a, p) * (1 + (boost - 1) * (1 - smoothstep(0, 1, a)))) / boost

/**
 * How much each object may grow at the front (phones only; see
 * GALLERY.phoneBoost), from its featured size at the scene's size factor.
 */
export function frontBoost(scene: Pick<Scene, 'cls' | 'W' | 'H' | 'u'>, sizes: ObjectSize[]): number[] {
  if (scene.cls !== 'phone') return sizes.map(() => 1)
  const { max, fit, height } = GALLERY.phoneBoost
  return sizes.map((z) => clamp(Math.min((fit * scene.W) / (z.w * scene.u), (height * scene.H) / (z.h * scene.u)), 1, max))
}

/** Each object's layout box (its size in front, with the phone boost), at the scene's size factor. */
function sizeObjects(scene: Scene) {
  const boost = frontBoost(scene, FEATURED_SIZES)
  for (let i = 0; i < N; i++) {
    scene.boost[i] = boost[i]
    scene.widths[i] = FEATURED_SIZES[i].w * scene.u * boost[i]
    scene.heights[i] = FEATURED_SIZES[i].h * scene.u * boost[i]
  }
}

/**
 * The resting places on the rail for every resting position r and slot k:
 * the active object at x0; outwards, each neighbour `gap` px clear of the
 * one inside it; the edge slot at the window's edge with `reveal` of the
 * object inside (never closer than `gap2` to the neighbour); beyond, a
 * chain off screen. Widths are each object's projected width at that slot.
 */
function restPlaces(scene: Scene) {
  const { p, u, W, x0, widths, boost, slotX } = scene
  const half = (i: number, k: number) => (widths[i] * boxScale(Math.abs(k), boost[i], p) * Math.cos(slotTurn(k, p))) / 2
  const gapBefore = (k: number) => (k === 1 ? p.gap : k <= p.edge ? p.gap2 : p.gapOuter) * u
  for (let r = 0; r < N; r++) {
    const at = (k: number) => r * SLOTS + k + 4
    slotX[at(0)] = x0
    for (const side of [1, -1]) {
      for (let j = 1; j <= 4; j++) {
        const k = j * side
        const i = mod(r + k, N)
        const prev = mod(r + k - side, N)
        const hw = half(i, k)
        const chain = slotX[at(k - side)] + side * (half(prev, k - side) + gapBefore(j) + hw)
        let x = chain
        if (j === p.edge) {
          const edge = side > 0 ? W + (1 - 2 * p.reveal) * hw : -(1 - 2 * p.reveal) * hw
          x = side > 0 ? Math.max(chain, edge) : Math.min(chain, edge)
        }
        slotX[at(k)] = x
      }
    }
  }
}

/** x of item i at signed depth d: a monotone curve through its own resting places. */
function railX(i: number, d: number, scene: Scene) {
  const k0 = Math.floor(d)
  const t = d - k0
  const X = (k: number) => {
    const kk = clamp(k, -4, 4)
    return scene.slotX[mod(i - kk, N) * SLOTS + kk + 4]
  }
  const p0 = X(k0 - 1)
  const p1 = X(k0)
  const p2 = X(k0 + 1)
  const p3 = X(k0 + 2)
  return hermite(t, p1, p2, slope(p1 - p0, p2 - p1), slope(p2 - p1, p3 - p2))
}

/**
 * Places every object for `pos`. `left` is the share of leftward travel in
 * the current movement (1: the drift and the wheel; 0: a step back), `rush`
 * the wheel boost's share of its cap (0 at rest). Writes into `out`.
 */
export function place(pos: number, scene: Scene, out: Placement[], left = 1, rush = 0) {
  const { p, u, widths, boost } = scene
  const { light, label } = GALLERY
  const { turnGain, farDim } = GALLERY.wheel.depth
  for (let i = 0; i < out.length; i++) {
    const o = out[i]
    o.d = wrapOffset(i, pos, N)
    o.a = Math.abs(o.d)
    o.s = depthScale(o.a, p)
    o.k = boxScale(o.a, boost[i], p)
    o.turn = turnAt(o.d, p, left) * (1 + turnGain * rush)
    o.x = railX(i, o.d, scene)
    o.base = scene.yb0 - p.rise * u * (1 - o.s)
    o.hw = (widths[i] * o.k * Math.cos(o.turn)) / 2
    o.vis = 1 - smoothstep(p.fade[0], p.fade[1], o.a)
    o.op = o.vis * (1 - farDim * rush * smoothstep(1.2, 2, o.a))
    o.glow = knot(light.glow, o.a)
    o.dim = knot(light.dim, o.a)
    o.spill = knot(light.spill, o.a)
    o.shadow = knot(light.shadow, o.a)
    o.reflect = knot(light.reflect, o.a)
    o.ls = o.s
    o.lt = knot(label.title, o.a)
    o.lsub = knot(label.sub, o.a) * (1 - smoothstep(label.subUntil[0], label.subUntil[1], o.a))
    o.z = Math.round(100 - o.a * 10)
  }
}

/** Keep-out boxes farther than this to the side of an object's column (px) never count (keepGap). */
const REACH = 64

/**
 * The least distance (px) between object i's silhouette, at placement `o`,
 * and the keep-out boxes (the identity block's lines, the portrait):
 * straight down to a box it passes beneath, or diagonally or sideways to
 * one beside it; negative where they overlap, Infinity when none is within
 * REACH. The silhouette's top edge comes from TOP_PROFILE, through the
 * object's scale, turn and perspective (as DepthGallery writes its
 * transform); `grow` and `lift` (unscaled px) add the hover's enlargement
 * about the object's base and its rise.
 */
export function keepGap(i: number, o: Placement, scene: Scene, grow = 1, lift = 0): number {
  const boxes = scene.keep
  if (!boxes.length) return Infinity
  const w = scene.widths[i]
  const h = scene.heights[i]
  const prof = PROFILES[i]
  const cols = prof.length
  const persp = GALLERY.perspective * scene.u
  const sin = Math.sin(o.turn)
  const cos = Math.cos(o.turn)
  let least = Infinity
  for (let j = 0; j < cols; j++) {
    if (prof[j] >= 1) continue
    // The column's edges and top in the object's own px (from its base centre), then projected.
    const X0 = (j / cols - 0.5) * w * grow
    const X1 = ((j + 1) / cols - 0.5) * w * grow
    const Y = -(1 - prof[j]) * h * grow - lift
    const f0 = persp / (persp + X0 * sin)
    const f1 = persp / (persp + X1 * sin)
    const xa = o.x + o.k * X0 * cos * f0
    const xb = o.x + o.k * X1 * cos * f1
    const top = o.base + o.k * Y * Math.max(f0, f1)
    const l = Math.min(xa, xb)
    const r = Math.max(xa, xb)
    for (const box of boxes) {
      const dx = Math.max(box.l - r, l - box.r)
      if (dx >= REACH) continue
      // Beneath the box, beside it, or (the column reaching up past its bottom) overlapping it.
      const dy = top - box.b
      const below = o.base - box.t
      if (below <= 0) continue
      least = Math.min(least, dx <= 0 ? dy : dy > 0 ? Math.hypot(dx, dy) : dx)
    }
  }
  return least
}

/** Samples per item of the loop that the keep-out check walks through. */
const KEEP_STEPS = 16
const probe: Placement[] = Array.from({ length: N }, newPlacement)

/**
 * The least room (px) any shown object leaves to the keep-out boxes round
 * the whole loop (hover included, the wheel's largest turn), with the
 * object and position where it is least.
 */
export function keepReport(scene: Scene, hover = true) {
  const { lift, scale } = GALLERY.hover
  let least = Infinity
  let at = { i: -1, pos: 0 }
  const steps = N * KEEP_STEPS
  for (let s = 0; s < steps; s++) {
    place(s / KEEP_STEPS, scene, probe, 1, 1)
    for (let i = 0; i < N; i++) {
      const o = probe[i]
      if (o.op < 0.05) continue
      const g = keepGap(i, o, scene, hover ? scale : 1, hover ? lift * scene.u : 0)
      if (g < least) {
        least = g
        at = { i, pos: s / KEEP_STEPS }
      }
    }
  }
  return { least, ...at }
}

const keepRoom = (scene: Scene) => keepReport(scene).least

/**
 * The scene for a window. The active slot stands at x0 with its base at
 * yb0 (landscape: `floor.bottom` above the bottom edge, raised further if
 * the tallest label needs it; portrait windows: `floor.portrait` of the
 * height). If, anywhere round the loop, an object (hovered, at the wheel's
 * largest turn) would come closer than `size.clear` px to the identity
 * block or the portrait, the whole gallery takes a smaller size (`fit`).
 */
export function buildScene(W: number, H: number, frame: SceneFrame = {}): Scene {
  const cls = widthClass(W)
  const p = GALLERY.layout[cls]
  const u0 = sizeFactor(W, H, cls)
  const { bottom, labelMargin, portrait } = GALLERY.floor
  let yb0 = H > W ? H * (cls === 'phone' ? portrait.phone : portrait.tablet) : H - clamp(bottom.share * H, bottom.min, bottom.max)
  yb0 = Math.min(yb0, H - labelMargin - (frame.label ?? 0) - GALLERY.label.gap)
  const scene: Scene = {
    W,
    H,
    u: u0,
    cls,
    p,
    x0: p.x0 * W,
    yb0,
    keep: frame.keep ?? [],
    fit: 1,
    widths: new Float64Array(N),
    heights: new Float64Array(N),
    boost: new Float64Array(N),
    slotX: new Float64Array(N * SLOTS),
  }
  const apply = (fit: number) => {
    scene.fit = fit
    scene.u = u0 * fit
    sizeObjects(scene)
    restPlaces(scene)
  }
  apply(1)
  const { clear } = GALLERY.size
  if (scene.keep.length && keepRoom(scene) < clear) {
    let lo = 0.55
    let hi = 1
    for (let k = 0; k < 7; k++) {
      const mid = (lo + hi) / 2
      apply(mid)
      if (keepRoom(scene) >= clear) lo = mid
      else hi = mid
    }
    apply(lo)
  }
  return scene
}

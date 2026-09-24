import { GALLERY } from '../../config/carousel'
import { CAROUSEL_ITEMS, OBJECT_SIZE, type CarouselItem } from '../../content/carousel'
import { getImage } from '../../content/media'

/**
 * Geometry of the homepage depth gallery (see src/config/carousel.ts).
 *
 * Every value is derived from one continuous position `pos` (in items), so
 * scrolling, settling, stepping and the idle drift all move the objects
 * through the same smooth path:
 *
 * - distance a = |d| from the front sets the depth scale s(a) (a perspective
 *   curve: the featured object is substantially closer and larger), the
 *   base line (farther objects stand higher, towards the room's far floor
 *   line), the brightness and the fade before an object wraps round;
 * - the signed offset d sets the turn towards the viewer;
 * - the horizontal places form a chain: neighbours stand edge to edge with a
 *   small gap (per depth), at rest the featured object's neighbours tuck a
 *   little behind it, and while objects pass one another the tuck opens, so
 *   the stacking order (by depth) changes where nothing overlaps.
 */

export type WidthClass = keyof typeof GALLERY.layout

export interface LayoutParams {
  x0: number
  k: number
  c: number
  turnMax: number
  turnReach: number
  gaps: readonly number[]
  tuck: number
  bias: number
  /** Fade-out distances on the right and on the left. */
  fade: readonly number[]
  fadeLeft: readonly number[]
}

export interface Scene {
  /** Stage size (the viewport). */
  W: number
  H: number
  /** Size factor. */
  u: number
  cls: WidthClass
  p: LayoutParams
  /** Featured object's centre (px). */
  x0: number
  /** Featured object's base line (px). */
  yb0: number
  /** Where the bases of infinitely far objects would meet (just above the far floor line). */
  yh: number
}

export interface Placement {
  /** Signed offset from the featured position (items; negative = left). */
  d: number
  /** Distance from the front (|d|). */
  a: number
  /** Depth scale (1 = featured). */
  s: number
  /** Scale of the object's box (its layout size includes any front boost): the depth scale × the share of the boost in effect. */
  k: number
  /** Turn towards the viewer (radians, for rotateY). */
  turn: number
  /** Centre x of the object's base (px). */
  x: number
  /** Base line y (px). */
  base: number
  /** Projected half-width (px). */
  hw: number
  /** Share still shown before wrapping round (1 in front, 0 once far enough to wrap). */
  vis: number
  /** Opacity (distance dimming × vis). */
  op: number
}

/** The featured-size box of each object at u = 1 (px): OBJECT_SIZE × GALLERY.featured × the per-kind balance. */
export interface ObjectSize {
  w: number
  h: number
}

export function featuredSize(item: CarouselItem): ObjectSize {
  const image = getImage(item.image)
  const ratio = image.width / image.height
  const ref = OBJECT_SIZE[item.kind]
  const k = GALLERY.featured * GALLERY.kindScale[item.kind]
  const w = (ref.width ?? (ref.height ?? 260) * ratio) * k
  return { w, h: w / ratio }
}

export const FEATURED_SIZES: ObjectSize[] = CAROUSEL_ITEMS.map(featuredSize)

/** The item featured at a fresh opening: Merchandising Platform, with About Me on its left and CafePress UK on its right. */
export const OPENING_POS = 1

export const widthClass = (w: number): WidthClass => (w >= 1000 ? 'desktop' : w >= 600 ? 'tablet' : 'phone')

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smoothstep = (e0: number, e1: number, x: number) => {
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

/** The size factor for a window (see GALLERY.size). */
export function sizeFactor(W: number, H: number, cls: WidthClass) {
  const { min, max, heightOffset, heightSpan, fitBelow, fit } = GALLERY.size
  const byHeight = (H - heightOffset) / heightSpan
  let u = Math.min(W / 1440, byHeight)
  if (W < fitBelow) {
    const widest = Math.max(...FEATURED_SIZES.map((s) => s.w))
    u = Math.min(byHeight, (W * (cls === 'phone' ? fit.phone : fit.tablet)) / widest)
  }
  return clamp(u, min, max)
}

/**
 * The room's far floor line in the viewport (px), where stage.css draws it:
 * the desktop loop's line at 65% of its 4:3 frame, the portrait loop's at
 * 65.2% of 470:834, both object-fit cover at 50% 55%.
 */
export function floorLine(W: number, H: number, file: 'desktop' | 'mobile') {
  return file === 'mobile' ? Math.max(0.652 * H, 0.55 * H + 0.181 * W) : Math.max(0.65 * H, 0.55 * H + 0.075 * W)
}

/**
 * The scene for a window. `identityBottom` is the bottom of the homepage
 * identity (name and descriptor) in stage px, when known: on portrait
 * windows the floor rises towards it (see GALLERY.floor.portrait).
 */
export function buildScene(W: number, H: number, file: 'desktop' | 'mobile', identityBottom = 0): Scene {
  const cls = widthClass(W)
  const p = GALLERY.layout[cls]
  const u = sizeFactor(W, H, cls)
  const { horizonLift, portrait } = GALLERY.floor
  const bottom = cls === 'phone' ? GALLERY.floor.phoneBottom : GALLERY.floor.bottom
  const line = floorLine(W, H, file)
  let yb0 = H - clamp(bottom.share * H, bottom.min, bottom.max)
  if (H > W && identityBottom > 0) {
    // The opening's featured object stands `band` of the height below the
    // identity, its base still on the floor in front of the far wall.
    const front = FEATURED_SIZES[OPENING_POS].h * u * frontBoost({ cls, W, H, u }, FEATURED_SIZES)[OPENING_POS]
    yb0 = Math.min(yb0, Math.max(line + portrait.belowLine * H, identityBottom + portrait.band * H + front))
  }
  const yh = Math.min(line - horizonLift * H, yb0 - 60)
  return { W, H, u, cls, p, x0: p.x0 * W, yb0, yh }
}

export const depthScale = (a: number, p: LayoutParams) => 1 / (1 + p.k * (Math.sqrt(a * a + p.c * p.c) - p.c))

/** Turn towards the viewer: objects on the left face right, those on the right face left. */
export const turnAt = (d: number, p: LayoutParams) => -p.turnMax * Math.tanh(d / p.turnReach)

/** Gap after the object at distance `a` towards the next one outwards (px at u = 1), linear between the table's depths. */
function gapAt(a: number, gaps: readonly number[]) {
  const i = Math.min(gaps.length - 2, Math.floor(a))
  const t = clamp(a - i, 0, 1)
  return gaps[i] + (gaps[i + 1] - gaps[i]) * t
}

/** Order of items by offset (reused between frames). */
let order: number[] = []

/**
 * How much each object may grow at the front (phones only; see
 * GALLERY.phoneBoost), from its featured size at the scene's size factor.
 */
export function frontBoost(scene: Pick<Scene, 'cls' | 'W' | 'H' | 'u'>, sizes: ObjectSize[]): number[] {
  if (scene.cls !== 'phone') return sizes.map(() => 1)
  const { max, fit, height } = GALLERY.phoneBoost
  return sizes.map((z) => clamp(Math.min((fit * scene.W) / (z.w * scene.u), (height * scene.H) / (z.h * scene.u)), 1, max))
}

/**
 * Places every object for `pos`. `widths` are the objects' layout widths
 * (px: the featured size at the scene's size factor × `boost`, the growth
 * allowed at the very front). Writes into `out` (one per item).
 */
export function place(pos: number, widths: ArrayLike<number>, boost: ArrayLike<number>, scene: Scene, out: Placement[]) {
  const n = out.length
  const { p, u } = scene
  const f = pos - Math.floor(pos)
  // 1 at rest, 0 halfway between two positions (where the objects passing the front swap order).
  const rest = Math.cos(Math.PI * f) ** 2
  for (let i = 0; i < n; i++) {
    const o = out[i]
    o.d = wrapOffset(i, pos, n)
    o.a = Math.abs(o.d)
    o.s = depthScale(o.a, p)
    o.k = (o.s * (1 + (boost[i] - 1) * (1 - smoothstep(0, 1, o.a)))) / boost[i]
    o.turn = turnAt(o.d, p)
    o.hw = (widths[i] * o.k * Math.cos(o.turn)) / 2
    const fade = o.d < 0 ? p.fadeLeft : p.fade
    o.vis = 1 - smoothstep(fade[0], fade[1], o.a)
    const { linear, square } = GALLERY.dim
    o.op = Math.max(0, 1 - linear * o.a - square * o.a * o.a) * o.vis
    o.base = scene.yh + (scene.yb0 - scene.yh) * o.s
  }
  if (order.length !== n) order = Array.from({ length: n }, (_, i) => i)
  // Insertion sort by offset (almost sorted between frames).
  for (let j = 1; j < n; j++) {
    const v = order[j]
    let k = j - 1
    while (k >= 0 && out[order[k]].d > out[v].d) {
      order[k + 1] = order[k]
      k--
    }
    order[k + 1] = v
  }
  const spacing = (l: Placement, r: Placement) => {
    const inner = Math.min(l.a, r.a)
    const tuck = p.tuck * rest * Math.max(0, 1 - inner)
    const gap = (gapAt(inner, p.gaps) - tuck) * u
    // More room on the left (the featured object stands right of centre).
    const mid = (l.d + r.d) / 2
    const side = 1 - (p.bias * clamp(mid, -1.5, 1.5)) / 1.5
    return (l.hw + r.hw + gap) * side
  }
  // The pair around the front: the last item with d ≤ 0 and the next.
  let c = 0
  while (c < n - 1 && out[order[c + 1]].d <= 0) c++
  const L = out[order[c]]
  if (c + 1 < n) {
    const R = out[order[c + 1]]
    const sp = spacing(L, R)
    L.x = scene.x0 + L.d * sp
    R.x = L.x + sp
  } else {
    L.x = scene.x0
  }
  for (let j = c + 2; j < n; j++) out[order[j]].x = out[order[j - 1]].x + spacing(out[order[j - 1]], out[order[j]])
  for (let j = c - 1; j >= 0; j--) out[order[j]].x = out[order[j + 1]].x - spacing(out[order[j]], out[order[j + 1]])
}

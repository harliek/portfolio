import { GALLERY } from '../../config/carousel'
import { CAROUSEL_ITEMS, type CarouselItem } from '../../content/carousel'
import { getImage } from '../../content/media'

/**
 * Geometry of the homepage depth gallery (see src/config/carousel.ts).
 *
 * Every value is derived from one continuous position `pos` (in items), so
 * the continuous travel, the wheel's acceleration, the arrow steps and a
 * swipe all move the objects through the same smooth path:
 *
 * - the offset d sets the depth scale s(d) (a perspective curve: the
 *   featured object substantially closer and larger, its neighbours about
 *   three quarters of that, the receding left one a little smaller than
 *   the approaching right one), and through it the base line (farther
 *   objects stand higher, towards the room's far floor line); the distance
 *   a = |d| sets the brightness and the fade before an object wraps round;
 * - the signed offset d sets the turn towards the viewer;
 * - the horizontal places form a chain: neighbours stand edge to edge with a
 *   small gap or a little overlap (per depth), at rest the featured object's
 *   neighbours tuck a little behind it, and while objects pass one another
 *   the tuck opens, so the stacking order (by depth) changes where nothing
 *   overlaps.
 *
 * On landscape windows the title stands in the upper left, and the objects
 * travelling left pass beneath it: the left neighbour stands under it, and
 * a wide object leaving the front crosses below its lower right corner.
 * Each object is as large as the size factor allows unless its silhouette
 * (its top edge, from TOP_PROFILE, through its turn and depth) would come
 * within `titleClear` px of a line of the title somewhere round the loop;
 * then it takes a smaller fit of its own (buildScene).
 */

export type WidthClass = keyof typeof GALLERY.layout

export interface LayoutParams {
  x0: number
  /** Depth on the right (approaching) and on the left (receding); see depthScale. */
  k: number
  kLeft: number
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
  /** The title's lines the objects pass beneath (landscape windows), in stage px. */
  title: Box[]
  /** Each object's own share of its size at `u` (below 1 only where it would pass too close beneath the title). */
  fit: number[]
}

/** A box in stage px: left, top, right, bottom. */
export interface Box {
  l: number
  t: number
  r: number
  b: number
}

/** What the scene must keep clear of, in stage px (measured by DepthGallery). */
export interface SceneFrame {
  /** The homepage title's right and bottom edges, and the boxes of its lines (the name, Port, folio, the supporting line). */
  id?: { right: number; bottom: number; lines?: Box[] } | null
  /** Height of the tallest caption (px). */
  caption?: number
  /** Top of the arrow row. */
  bar?: number
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

/** The featured-size box of each object at u = 1 (px), from GALLERY.featured. */
export interface ObjectSize {
  w: number
  h: number
}

export function featuredSize(item: CarouselItem): ObjectSize {
  const image = getImage(item.image)
  const ratio = image.width / image.height
  const ref = GALLERY.featured[item.kind]
  const w = ref.width ?? (ref.height ?? 400) * ratio
  return { w, h: w / ratio }
}

export const FEATURED_SIZES: ObjectSize[] = CAROUSEL_ITEMS.map(featuredSize)
const WIDEST = Math.max(...FEATURED_SIZES.map((s) => s.w))
const N = CAROUSEL_ITEMS.length

/**
 * The top edge of each object's silhouette: for 24 equal columns across its
 * image, the share of the image height above its first opaque pixel (alpha
 * of at least 96 of 255; 1 for a column with none). Measured from the 960px
 * files in public/media/img; the title check reads the object's real
 * outline (a headshot's shoulders, a mug's handle) instead of its box.
 */
const TOP_PROFILE: Partial<Record<CarouselItem['image'], readonly number[]>> = {
  'obj-about': [0.901, 0.696, 0.526, 0.482, 0.475, 0.454, 0.185, 0.101, 0.057, 0.03, 0.021, 0.017, 0.013, 0.014, 0.027, 0.051, 0.081, 0.126, 0.18, 0.272, 0.508, 0.523, 0.54, 0.573],
  'obj-merchandising-platform': Array.from({ length: 24 }, () => 0.006),
  'obj-cafepress-uk': [0.046, 0.035, 0.028, 0.024, 0.02, 0.018, 0.017, 0.016, 0.016, 0.016, 0.016, 0.016, 0.017, 0.019, 0.023, 0.028, 0.037, 0.069, 0.139, 0.139, 0.146, 0.169, 0.211, 0.293],
  'obj-spreadsheet-agent': [0.902, ...Array.from({ length: 22 }, (_, j) => (j === 0 || j === 21 ? 0.021 : 0.018)), 0.902],
  'obj-ai-leasing-agent': [0.025, ...Array.from({ length: 22 }, () => 0.013), 0.025],
  'obj-creative-production': [0.406, 0.333, 0.298, 0.257, 0.223, 0.222, 0.223, 0.124, 0.067, 0.029, 0.017, 0.017, 0.023, 0.022, 0.054, 0.06, 0.11, 0.16, 0.195, 0.195, 0.222, 0.222, 0.223, 0.293],
  'obj-jumpstart-finance': [0.093, 0.044, 0.028, 0.021, ...Array.from({ length: 16 }, () => 0.019), 0.021, 0.029, 0.046, 0.096],
}
/** Each item's top profile (an unmeasured image counts as its full box). */
const PROFILES: readonly (readonly number[])[] = CAROUSEL_ITEMS.map((item) => TOP_PROFILE[item.image] ?? [0])

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

/** The size factor for a window (see GALLERY.size); the title may still give an object a smaller fit of its own (buildScene). */
export function sizeFactor(W: number, H: number, cls: WidthClass) {
  const { min, max, heightOffset, heightSpan, fitBelow, fit } = GALLERY.size
  const byHeight = (H - heightOffset) / heightSpan
  let u = Math.min(W / 1440, byHeight)
  if (W < fitBelow) u = Math.min(byHeight, (W * (cls === 'phone' ? fit.phone : fit.tablet)) / WIDEST)
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
 * Depth scale at the signed offset d (1 at the front). Objects approaching
 * on the right follow `k`; receding on the left, `kLeft` (a little faster:
 * the object leaving the front steps back sooner). Both sides meet at the
 * front with zero slope, so the scale changes smoothly through it.
 */
export const depthScale = (d: number, p: LayoutParams) => 1 / (1 + (d < 0 ? p.kLeft : p.k) * (Math.sqrt(d * d + p.c * p.c) - p.c))

/** Title lines farther than this to the side of an object's column (px) never count (titleGap). */
const TITLE_REACH = 64

/**
 * The least distance (px) between object i's silhouette, at placement `o`,
 * and the title's lines: straight down to a line it passes beneath, or
 * diagonally to one beside it (so the distance changes continuously as the
 * object moves); negative where they overlap, Infinity when no line is
 * within TITLE_REACH. The silhouette's top edge comes from TOP_PROFILE,
 * through the object's depth scale, turn and perspective (as DepthGallery
 * writes its transform); `grow` and `lift` (unscaled px) add the hover's
 * enlargement about the object's base and its rise. The objects always
 * stand below the title, so only the top edge can meet it.
 */
export function titleGap(i: number, o: Placement, scene: Scene, w: number, h: number, grow = 1, lift = 0): number {
  const lines = scene.title
  if (!lines.length) return Infinity
  // Far to the right of the title or well below it: nothing to measure.
  let right = -Infinity
  let bottom = -Infinity
  for (const line of lines) {
    right = Math.max(right, line.r)
    bottom = Math.max(bottom, line.b)
  }
  if (o.x - o.hw * grow * 1.1 > right + TITLE_REACH) return Infinity
  if (o.base - o.k * (h * grow + lift) * 1.1 > bottom + TITLE_REACH) return Infinity
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
    for (const line of lines) {
      const dx = Math.max(line.l - r, l - line.r)
      if (dx >= TITLE_REACH) continue
      const dy = top - line.b
      least = Math.min(least, dx <= 0 ? dy : dy > 0 ? Math.hypot(dx, dy) : dx)
    }
  }
  return least
}

/**
 * Each object's layout box in `scene` (px): its featured size at the size
 * factor, its own fit and the front boost (phones), with the boost itself.
 */
export function objectSizes(scene: Scene) {
  const boost = frontBoost(scene, FEATURED_SIZES)
  const widths = FEATURED_SIZES.map((z, i) => z.w * scene.u * scene.fit[i] * boost[i])
  const heights = FEATURED_SIZES.map((z, i) => z.h * scene.u * scene.fit[i] * boost[i])
  return { widths, heights, boost }
}

/** Samples per item of the loop that the title check walks through. */
const TITLE_STEPS = 24
/** Placements reused by the title check. */
const probe: Placement[] = Array.from({ length: N }, () => ({ d: 0, a: 0, s: 1, k: 1, turn: 0, x: 0, base: 0, hw: 0, vis: 1, op: 1 }))

/**
 * The least room (px) each shown object leaves below the title's lines
 * (titleGap) while the gallery moves from `from` to `to` (in items; the
 * whole loop by default), for every object or `only` one. Objects right of
 * the front never pass beneath the title. Writes into and returns `out`.
 */
function titleRoom(scene: Scene, out: number[], from = 0, to = N, only = -1): number[] {
  const { widths, heights, boost } = objectSizes(scene)
  out.fill(Infinity)
  const steps = Math.ceil((to - from) * TITLE_STEPS)
  for (let k = 0; k <= steps; k++) {
    place(from + ((to - from) * k) / steps, widths, boost, scene, probe)
    for (let i = only < 0 ? 0 : only; i < (only < 0 ? N : only + 1); i++) {
      const o = probe[i]
      if (o.op >= 0.05 && o.d < 0.5) out[i] = Math.min(out[i], titleGap(i, o, scene, widths[i], heights[i]))
    }
  }
  return out
}

/**
 * The scene for a window. `frame` gives what the gallery must keep clear
 * of: on landscape windows the title (upper left) holds the left quarter
 * and the featured slot stands right of it; every object is as large as
 * the size factor allows unless, somewhere round the loop, it would pass
 * closer than `titleClear` px below one of the title's lines: then it gets
 * a smaller fit of its own (in practice the widest screen, whose top corner
 * crosses beneath the title's last line as it leaves the front). On
 * portrait windows the floor rises towards the title
 * (GALLERY.floor.portrait). The caption's space is reserved below the
 * featured object.
 */
export function buildScene(W: number, H: number, file: 'desktop' | 'mobile', frame: SceneFrame = {}): Scene {
  const cls = widthClass(W)
  const p = GALLERY.layout[cls]
  const u = sizeFactor(W, H, cls)
  const { horizonLift, portrait } = GALLERY.floor
  const { gap, bottomMargin } = GALLERY.label
  const bottom = cls === 'phone' ? GALLERY.floor.phoneBottom : GALLERY.floor.bottom
  const line = floorLine(W, H, file)
  const id = frame.id && frame.id.bottom > 0 ? frame.id : null
  let yb0 = H - clamp(bottom.share * H, bottom.min, bottom.max)
  // The caption's reserved space: clear of the bottom edge, or of the arrow row where the caption spans the width.
  const caption = frame.caption ?? 0
  const floorMax = (cls === 'desktop' ? H - bottomMargin : (frame.bar ?? H) - 10) - caption - gap
  yb0 = Math.min(yb0, floorMax)
  if (H > W && id) {
    // The opening's featured object stands `band` of the height below the
    // identity, its base still on the floor in front of the far wall.
    const front = FEATURED_SIZES[OPENING_POS].h * u * frontBoost({ cls, W, H, u }, FEATURED_SIZES)[OPENING_POS]
    yb0 = Math.min(yb0, Math.max(line + portrait.belowLine * H, id.bottom + portrait.band * H + front))
  }
  const yh = Math.min(line - horizonLift * H, yb0 - 60)
  const scene: Scene = { W, H, u, cls, p, x0: p.x0 * W, yb0, yh, title: [], fit: FEATURED_SIZES.map(() => 1) }
  if (W >= H && id) {
    const { titleClear } = GALLERY.size
    scene.title = id.lines?.length ? id.lines : [{ l: -Infinity, t: -Infinity, r: id.right, b: id.bottom }]
    // The featured slot stands right of the title (the widest object included).
    scene.x0 = Math.max(scene.x0, id.right + titleClear * 2 + (WIDEST * u) / 2)
    // A second round only if needed: one object's width moves its neighbours a little.
    const room = new Array<number>(N)
    const part = new Array<number>(N)
    for (let round = 0; round < 2; round++) {
      titleRoom(scene, room)
      if (room.every((g) => g >= titleClear - 0.5)) break
      for (let i = 0; i < N; i++) {
        if (room[i] >= titleClear) continue
        // The largest fit at which it clears the title while it recedes on the left (offsets 0.5 to −3).
        let lo = 0.5
        let hi = scene.fit[i]
        for (let k = 0; k < 7; k++) {
          const mid = (lo + hi) / 2
          scene.fit[i] = mid
          if (titleRoom(scene, part, i - 0.5, i + 3, i)[i] >= titleClear) lo = mid
          else hi = mid
        }
        scene.fit[i] = lo
      }
    }
  }
  return scene
}

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
    o.s = depthScale(o.d, p)
    o.k = (o.s * (1 + (boost[i] - 1) * (1 - smoothstep(0, 1, o.a)))) / boost[i]
    o.turn = turnAt(o.d, p)
    o.hw = (widths[i] * o.k * Math.cos(o.turn)) / 2
    const fade = o.d < 0 ? p.fadeLeft : p.fade
    o.vis = 1 - smoothstep(fade[0], fade[1], o.a)
    o.op = Math.max(0, 1 - GALLERY.dim.square * o.a * o.a) * o.vis
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
    // A little more room on the left (the left neighbour stays clearly visible).
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

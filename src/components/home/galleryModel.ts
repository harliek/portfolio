import { GALLERY } from '../../config/carousel'
import { GALLERY_ITEMS, type ObjectKind } from '../../content/carousel'
import { getImage } from '../../content/media'

/**
 * Geometry of the homepage carousel (see src/config/carousel.ts).
 *
 * Every object's look comes from one value, its signed slot offset d (its
 * offset from the selected slot, in items; a = |d|), which in turn comes
 * from the carousel's one continuous position `pos`. Arrow steps, drags,
 * swipes and trackpad gestures all move the objects through the same path,
 * and the same rules apply to every object in every slot:
 *
 * - scale: the slot's display area (1 selected, 0.8 beside it, 0.65 at the
 *   outer slots); each silhouette fits that area (contain) × its own factor;
 * - bottom edge: on one shallow symmetrical curve (the selected object
 *   lowest, the neighbours about 24px higher, the outer objects about 44px,
 *   as if standing further back on the room's floor);
 * - a gentle turn towards the centre, symmetrical on both sides;
 * - x: at each resting position (an integer `pos`) the neighbours stand a
 *   fixed silhouette gap from the selected object (more where two shown
 *   labels need the room), the outer ones beyond; in between, each object
 *   follows a smooth monotone curve through its own resting places;
 * - light, floor reflection and label size and opacity: knot tables over a.
 *
 * Every measure is taken on the silhouette (GALLERY.opaque), so the thin
 * transparent margin of a PNG never changes a gap or a bottom edge: the
 * object element is placed and scaled about its silhouette's bottom centre.
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

/** A label's size at full scale as set in the page (px): the title's inked width and height, the description's widest line and height, the space between them. */
export interface LabelSize {
  tw: number
  th: number
  sw: number
  sh: number
  gap: number
}

/** What the scene is fitted to (measured by DepthGallery). */
export interface SceneFrame {
  /** Header height (px): the carousel's section fills the window below it. */
  header?: number
  /** Each label's size at full scale. */
  labels?: readonly LabelSize[]
  /** The height reserved for a label at full scale (title and two description lines, px). */
  labelH?: number
  /** The controls beneath the carousel, with their gap above (px). */
  nav?: number
  /**
   * The height the stage and the controls may take in the first view: from
   * the carousel's top (beneath the title) to the window's lower edge, less
   * the section's bottom padding (px). Without it, the window below the
   * header less GALLERY.stage.margin above and below.
   */
  avail?: number
}

export interface Scene {
  /** Stage width and window height (px). */
  W: number
  H: number
  cls: WidthClass
  p: LayoutParams
  /** Size factor. */
  u: number
  /** Silhouette gap between the selected object and each neighbour at rest (px, before any label room). */
  gap: number
  /** The selected slot's centre and bottom edge (stage px). */
  x0: number
  yb0: number
  /** The stage's height (px): the objects and their labels. */
  stageH: number
  /** Label width (px). */
  lw: number
  /** Perspective of the turn (px). */
  persp: number
  /** Each object's silhouette at the selected slot (px). */
  sw: Float64Array
  sh: Float64Array
  /** Each object's image box at the selected slot (px). */
  bw: Float64Array
  bh: Float64Array
  /** Resting places: x of the object in slot k (−4 to 4) when `pos` rests on r, at [r * SLOTS + k + 4]. */
  slotX: Float64Array
  labels: readonly LabelSize[]
}

export interface Placement {
  /** Signed slot offset (items; negative = left). */
  d: number
  /** Distance from the selected slot (|d|). */
  a: number
  /** Slot scale (1 = selected). */
  s: number
  /** Turn (radians, for rotateY; towards the centre). */
  turn: number
  /** x of the silhouette's bottom centre (stage px). */
  x: number
  /** Bottom edge y (stage px). */
  base: number
  /** Share still shown before wrapping round (1 near the front, 0 once far enough to wrap). */
  vis: number
  /** Opacity. */
  op: number
  /** Light by slot (GALLERY.slot) and the floor reflection's opacity (GALLERY.ground). */
  glow: number
  dim: number
  reflect: number
  /** Label: scale, title and description opacity (before collision control), centre offset from x (px). */
  ls: number
  lt: number
  lsub: number
  lc: number
  /** Stacking order. */
  z: number
}

export const newPlacement = (): Placement => ({ d: 0, a: 0, s: 1, turn: 0, x: 0, base: 0, vis: 1, op: 1, glow: 0, dim: 0, reflect: 0, ls: 1, lt: 1, lsub: 1, lc: 0, z: 100 })

const N = GALLERY_ITEMS.length
/** Resting slots kept per position: −4 to 4. */
const SLOTS = 9
const DEG = Math.PI / 180

/** Each object's silhouette proportions and its place inside its image box. */
const OBJ = GALLERY_ITEMS.map((item) => {
  const image = getImage(item.image)
  const o = GALLERY.opaque[item.kind]
  return { o, ratio: (image.width * o.w) / (image.height * o.h), factor: GALLERY.factor[item.kind], center: GALLERY.center[item.kind] }
})

/**
 * Where an object element's silhouette bottom centre sits in its image box
 * (shares of the box): the element is placed and scaled about this point.
 */
export function silhouetteOrigin(kind: ObjectKind) {
  const o = GALLERY.opaque[kind]
  return { x: o.x + o.w / 2, y: o.y + o.h }
}

/**
 * Where an object's contact shadow lies in its image box (shares of the
 * box): its centre and width, from GALLERY.ground.shadow (shares of the
 * silhouette's width).
 */
export function groundShadow(kind: ObjectKind) {
  const o = GALLERY.opaque[kind]
  const g = GALLERY.ground.shadow[kind]
  return { x: o.x + o.w * g.x, w: o.w * g.w }
}

/** The item selected at a fresh visit: Merchandising Platform (About Me on its left, CafePress UK Launch on its right). */
export const OPENING_POS = Math.max(
  0,
  GALLERY_ITEMS.findIndex((item) => item.project === 'merchandising-platform'),
)

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

/** Fritsch–Butland slope between two secants: monotone, 0 at an extremum. */
const slope = (a: number, b: number) => (a * b <= 0 ? 0 : (2 * a * b) / (a + b))

/** Cubic Hermite on [0, 1] from p1 (slope m1) to p2 (slope m2). */
function hermite(t: number, p1: number, p2: number, m1: number, m2: number) {
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2
}

/**
 * A knot table over a = 0, 1, 2, 3 read at a: a smooth monotone curve,
 * flat at the selected slot (so a value changes smoothly as an object
 * passes through it, the same on both sides) and after the last knot.
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

const slotScale = (a: number) => knot(GALLERY.slot.scale, a)
/** The turn at signed offset d (radians): towards the centre, so a right-hand object's outer edge comes forward. */
export const turnAt = (d: number) => -Math.sign(d) * knot(GALLERY.slot.turn, Math.abs(d)) * DEG
const labelScale = (a: number) => knot(GALLERY.slot.labelScale, a)
const subShown = (a: number) => knot(GALLERY.slot.sub, a) * (1 - smoothstep(GALLERY.slot.subUntil[0], GALLERY.slot.subUntil[1], a))

/**
 * A point of an object's silhouette (px from its bottom centre, unscaled;
 * Y upwards negative) as drawn: turned about its bottom centre, in
 * perspective, then scaled (DepthGallery writes
 * `scale(s) perspective(P) rotateY(turn)` about that point).
 */
function project(X: number, Y: number, s: number, turn: number, P: number): [number, number] {
  const z = -X * Math.sin(turn)
  const f = P / (P - z)
  return [s * X * Math.cos(turn) * f, s * Y * f]
}

/** How far object i's silhouette reaches left and right of its x at scale s and turn `turn` (px). */
function extents(scene: Scene, i: number, s: number, turn: number) {
  const hw = scene.sw[i] / 2
  return { L: -project(-hw, 0, s, turn, scene.persp)[0], R: project(hw, 0, s, turn, scene.persp)[0] }
}

/** The label's centre offset from the object's x (px): under the silhouette's visual centre. */
const labelOffset = (scene: Scene, i: number, s: number, turn: number) => (OBJ[i].center - 0.5) * scene.sw[i] * s * Math.cos(turn)

/** Half the widest shown line of item i's label at distance a (px), or 0 where it is hidden. */
function labelHalf(scene: Scene, i: number, a: number) {
  const L = scene.labels[i]
  if (!L || knot(GALLERY.slot.title, a) < 0.05) return 0
  return (Math.max(L.tw, subShown(a) > 0.05 ? L.sw : 0) * labelScale(a)) / 2
}

/** The silhouette of item i at placement o (stage px), as drawn. */
export function silhouette(scene: Scene, i: number, o: Placement): Box {
  const hw = scene.sw[i] / 2
  const h = scene.sh[i]
  let l = Infinity
  let r = -Infinity
  let t = Infinity
  for (const X of [-hw, hw]) {
    for (const Y of [-h, 0]) {
      const [x, y] = project(X, Y, o.s, o.turn, scene.persp)
      l = Math.min(l, x)
      r = Math.max(r, x)
      t = Math.min(t, y)
    }
  }
  return { l: o.x + l, r: o.x + r, t: o.base + t, b: o.base }
}

/** Each object's silhouette and image box in the selected slot, for a display area (px). */
function sizeObjects(scene: Scene, Aw: number, Ah: number) {
  for (let i = 0; i < N; i++) {
    const { o, ratio, factor } = OBJ[i]
    const w = Math.min(Aw, Ah * ratio) * factor
    scene.sw[i] = w
    scene.sh[i] = w / ratio
    scene.bw[i] = w / o.w
    scene.bh[i] = w / ratio / o.h
  }
}

/**
 * The resting places for every resting position r and slot k: the
 * selected object at x0; outwards, each object its slot's gap clear of the
 * one inside it (silhouette to silhouette, as drawn at their slots). On
 * desktop, where the two labels shown there would come within
 * GALLERY.label.clear of each other, the outer object moves out until they
 * are clear.
 */
function restPlaces(scene: Scene) {
  const { p, x0, slotX, gap } = scene
  const gapBefore = (j: number) => (j === 1 ? gap : j === 2 ? gap * p.gap2 : gap * p.gapOuter)
  const push = scene.cls === 'desktop' && scene.labels.length === N
  for (let r = 0; r < N; r++) {
    const at = (k: number) => r * SLOTS + k + 4
    slotX[at(0)] = x0
    for (const side of [1, -1]) {
      for (let j = 1; j <= 4; j++) {
        const k = j * side
        const i = mod(r + k, N)
        const prev = mod(r + k - side, N)
        const kp = k - side
        const ePrev = extents(scene, prev, slotScale(j - 1), turnAt(kp))
        const eCur = extents(scene, i, slotScale(j), turnAt(k))
        const xp = slotX[at(kp)]
        let x = xp + side * ((side > 0 ? ePrev.R : ePrev.L) + gapBefore(j) + (side > 0 ? eCur.L : eCur.R))
        if (push && j <= 2) {
          const hp = labelHalf(scene, prev, j - 1)
          const hc = labelHalf(scene, i, j)
          const oc = labelOffset(scene, i, slotScale(j), turnAt(k))
          if (hp > 0 && hc > 0) {
            const cp = xp + labelOffset(scene, prev, slotScale(j - 1), turnAt(kp))
            const need = cp + side * (hp + hc + GALLERY.label.clear) - oc
            x = side > 0 ? Math.max(x, need) : Math.min(x, need)
          }
          // A title standing higher than the bottom edge of the object inside it never reaches under that object.
          const titleHalf = scene.labels[i] && knot(GALLERY.slot.title, j) > 0.05 ? (scene.labels[i].tw * labelScale(j)) / 2 : 0
          const titleTop = GALLERY.label.gap - knot(p.rise, j)
          if (titleHalf > 0 && titleTop < -knot(p.rise, j - 1) + GALLERY.label.clearObject) {
            const edge = xp + side * (side > 0 ? ePrev.R : ePrev.L)
            const need = edge + side * (titleHalf + GALLERY.label.clearObject) - oc
            x = side > 0 ? Math.max(x, need) : Math.min(x, need)
          }
        }
        slotX[at(k)] = x
      }
    }
  }
}

/** x of item i at signed offset d: a monotone curve through its own resting places. */
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

/** Places every object for `pos`. Writes into `out`. */
export function place(pos: number, scene: Scene, out: Placement[]) {
  const { p } = scene
  const { slot } = GALLERY
  for (let i = 0; i < out.length; i++) {
    const o = out[i]
    o.d = wrapOffset(i, pos, N)
    o.a = Math.abs(o.d)
    o.s = slotScale(o.a)
    o.turn = turnAt(o.d)
    o.x = railX(i, o.d, scene)
    o.base = scene.yb0 - knot(p.rise, o.a)
    o.vis = 1 - smoothstep(p.fade[0], p.fade[1], o.a)
    o.op = o.vis
    o.glow = knot(slot.glow, o.a)
    o.dim = knot(slot.dim, o.a)
    o.reflect = knot(GALLERY.ground.reflection.opacity, o.a)
    o.ls = labelScale(o.a)
    // Tablets and phones: the selected object's caption only, gone before the next one's appears (GALLERY.label.solo).
    const side = p.sideLabels ? 1 : 1 - smoothstep(GALLERY.label.solo.fade[0], GALLERY.label.solo.fade[1], o.a)
    o.lt = knot(slot.title, o.a) * side
    o.lsub = subShown(o.a) * side
    o.lc = labelOffset(scene, i, o.s, o.turn)
    o.z = Math.round(100 - o.a * 10)
  }
}

/** The widest group of three at rest (the selected object and its two neighbours, silhouettes only), at u = 1 (px). */
function widestTrio(scene: Scene) {
  let most = 0
  for (let r = 0; r < N; r++) {
    const c = extents(scene, r, 1, 0)
    const left = extents(scene, mod(r - 1, N), slotScale(1), turnAt(-1))
    const right = extents(scene, mod(r + 1, N), slotScale(1), turnAt(1))
    most = Math.max(most, c.L + c.R + left.L + left.R + right.L + right.R)
  }
  return most
}

/** Default label height before it is measured: a 22px title and two 16px description lines. */
const LABEL_H = 22 * 1.28 + 6 + 2 * 16 * 1.45
/** Default height of the controls beneath the carousel (44px buttons and the gap above them). */
const NAV_H = 44 + 14

/**
 * The scene for a stage W px wide in a window H px high. The size factor u
 * fits the class's rule (desktop: the widest trio with its gaps and some
 * room at the edges; tablet and phone: the widest selected object within
 * `fit` of the width) and the height: the objects, labels and controls
 * stand within the first view beneath the title (`frame.avail`, brief v15),
 * so the objects stand on the room's floor with their captions and controls
 * above the window's lower edge.
 */
export function buildScene(W: number, H: number, frame: SceneFrame = {}): Scene {
  const cls = widthClass(W)
  const p = GALLERY.layout[cls]
  const header = frame.header ?? 61
  const labelH = frame.labelH ?? LABEL_H
  const nav = frame.nav ?? NAV_H
  const { bottom, margin } = GALLERY.stage
  const top = GALLERY.stage.top[cls]
  const { hover } = GALLERY
  const lw = cls === 'phone' ? Math.min(GALLERY.label.width.phone, W - 2 * GALLERY.label.inset) : Math.min(GALLERY.label.width[cls], W - 2 * GALLERY.label.inset)
  const gap = clamp(p.gap.share * W, p.gap.min, p.gap.max)
  const scene: Scene = {
    W,
    H,
    cls,
    p,
    u: 1,
    gap,
    x0: W / 2,
    yb0: 0,
    stageH: 0,
    lw,
    persp: GALLERY.perspective,
    sw: new Float64Array(N),
    sh: new Float64Array(N),
    bw: new Float64Array(N),
    bh: new Float64Array(N),
    slotX: new Float64Array(N * SLOTS),
    labels: frame.labels ?? [],
  }
  // At u = 1 first, to measure the widest trio and the tallest object.
  sizeObjects(scene, p.area.w, p.area.h)
  const tallest = Math.max(...scene.sh)
  const fixed = top + bottom + GALLERY.label.gap + labelH + nav
  const avail = frame.avail ?? H - header - 2 * margin
  const byHeight = (avail - fixed) / (tallest * hover.scale)
  let byWidth: number
  const edgeRoom = clamp(p.edgeRoom.at1280 + p.edgeRoom.perPx * (W - 1280), p.edgeRoom.min, p.edgeRoom.max)
  if (cls === 'desktop') byWidth = (W - 2 * gap - 2 * edgeRoom) / widestTrio(scene)
  else byWidth = (p.fit * W) / Math.max(...scene.sw)
  const u = clamp(Math.min(byWidth, byHeight), p.u.min, p.u.max)
  scene.u = u
  scene.persp = GALLERY.perspective * u
  sizeObjects(scene, p.area.w * u, p.area.h * u)
  scene.yb0 = top + Math.max(...scene.sh) * hover.scale
  scene.stageH = scene.yb0 + GALLERY.label.gap + labelH + bottom
  restPlaces(scene)
  return scene
}

/** The distance between the selected slot and its neighbours at the resting position nearest `pos` (px): a drag moves one object per this much. */
export function restSpacing(scene: Scene, pos: number) {
  const r = mod(Math.round(pos), N)
  const at = (k: number) => scene.slotX[r * SLOTS + k + 4]
  return Math.max(40, (at(1) - at(-1)) / 2)
}

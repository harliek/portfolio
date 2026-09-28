/**
 * Where each moving piece of the page change (pageChange.ts) is at any moment, and the rules that keep them apart
 * (Harlie's requests, 2026-09-28: the Spreadsheet Agent picture "should never cover the project description", the About
 * portrait "remains inside its own visual area and the biography remains readable throughout", "animate both columns
 * separately, keep them locked to the final grid while applying motion inside each column").
 *
 * Every move is planned first (a Plan: its poses, timing and fades), then checked here against the others before it
 * runs. A plan's picture is projected exactly as the browser draws it (the same transform list about the piece's
 * centre, with its perspective), sampled every few milliseconds:
 *
 *   - A page's main picture beside its words (a case study's stage, About's portrait, Creative Production's first film)
 *     keeps to its own column, its lane: from the moment the words can be seen it never crosses the line between the
 *     two columns, and while it turns, the edge facing the words is the one turned away (holdInLane).
 *   - Each piece of words keeps clear of the pictures and titles flying over it, a new page's words never sit over
 *     the old page's, and neighbours never cross on the way in or out (keepClear): a piece travels a shorter way (less
 *     rise, then less sideways travel, which keeps it inside its own column), and only as a last resort waits a few
 *     frames. A piece leaving that cannot keep clear fades sooner instead.
 */

/** A pose on top of where the browser pictures the piece: offset of its centre (px), scale, turns and tilt (deg). */
export interface Pose {
  dx?: number
  dy?: number
  s?: number
  rx?: number
  ry?: number
  r?: number
  offset?: number
}

export interface Timing {
  delay: number
  duration: number
  easing: string
}

export interface Fade {
  opacity: number
  offset?: number
}

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

/** One planned move: the piece's own box (where it rests), its poses, timing and fades (linear over the same time). */
export interface Plan {
  vtName: string
  rect: Box
  poses: Pose[]
  timing: Timing
  fades: Fade[]
  /** Added to wherever the browser pictures it each frame (a drifting homepage tile). */
  tracked?: boolean
}

/** Perspective for the turning pieces (px). */
export const DEPTH = 1100

// ---------------------------------------------------------------------------
// Easing and interpolation, as the browser does them
// ---------------------------------------------------------------------------

const easings = new Map<string, (u: number) => number>()

/** A CSS easing ('linear' or cubic-bezier) as a function of the time fraction. */
export function easing(css: string): (u: number) => number {
  const known = easings.get(css)
  if (known) return known
  const m = /cubic-bezier\(([^)]+)\)/.exec(css)
  let fn = (u: number) => u
  if (m) {
    const [x1, y1, x2, y2] = m[1].split(',').map(Number)
    const at = (s: number, a: number, b: number) => 3 * (1 - s) * (1 - s) * s * a + 3 * (1 - s) * s * s * b + s * s * s
    fn = (u) => {
      if (u <= 0) return 0
      if (u >= 1) return 1
      let lo = 0
      let hi = 1
      let s = u
      for (let i = 0; i < 24; i++) {
        if (at(s, x1, x2) > u) hi = s
        else lo = s
        s = (lo + hi) / 2
      }
      return at(s, y1, y2)
    }
  }
  easings.set(css, fn)
  return fn
}

/** Keyframe offsets as the browser fills them in: first 0, last 1, missing ones spread evenly between known ones. */
function offsets(frames: { offset?: number }[]): number[] {
  const out = frames.map((f) => f.offset)
  out[0] ??= 0
  out[out.length - 1] ??= 1
  for (let i = 1; i < out.length - 1; i++) {
    if (out[i] !== undefined) continue
    let j = i
    while (out[j] === undefined) j++
    const a = out[i - 1] as number
    const b = out[j] as number
    for (let k = i; k < j; k++) out[k] = a + ((b - a) * (k - i + 1)) / (j - i + 1)
  }
  return out as number[]
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** The pose at progress `p` (after the timing's easing) through `poses`. */
export function poseAt(poses: Pose[], p: number): Required<Omit<Pose, 'offset'>> {
  const at = offsets(poses)
  let i = 0
  while (i < poses.length - 2 && p > at[i + 1]) i++
  const a = poses[i]
  const b = poses[Math.min(i + 1, poses.length - 1)]
  const span = at[i + 1] - at[i]
  const t = span > 0 ? Math.min(1, Math.max(0, (p - at[i]) / span)) : 1
  const f = (k: keyof Omit<Pose, 'offset'>, rest: number) => lerp(a[k] ?? rest, b[k] ?? rest, t)
  return { dx: f('dx', 0), dy: f('dy', 0), s: f('s', 1), rx: f('rx', 0), ry: f('ry', 0), r: f('r', 0) }
}

/** The time fraction of `plan` at `T` ms (held before and after, as fill: both does). */
const fraction = (plan: Plan, T: number) => Math.min(1, Math.max(0, (T - plan.timing.delay) / plan.timing.duration))

export function alphaAt(plan: Plan, T: number): number {
  const u = fraction(plan, T)
  const at = offsets(plan.fades)
  let i = 0
  while (i < plan.fades.length - 2 && u > at[i + 1]) i++
  const a = plan.fades[i]
  const b = plan.fades[Math.min(i + 1, plan.fades.length - 1)]
  const span = at[i + 1] - at[i]
  return lerp(a.opacity, b.opacity, span > 0 ? Math.min(1, Math.max(0, (u - at[i]) / span)) : 1)
}

const RAD = Math.PI / 180

/**
 * The box a piece covers on screen in `pose`: its transform about its centre, exactly as pageChange.ts writes it
 * (translate, perspective, rotateX, rotateY, rotate, scale), worked out by hand for speed (a change checks thousands).
 */
export function project(rect: Box, pose: Required<Omit<Pose, 'offset'>>): Box {
  const cx = (rect.left + rect.right) / 2 + pose.dx
  const cy = (rect.top + rect.bottom) / 2 + pose.dy
  const hw = ((rect.right - rect.left) / 2) * pose.s
  const hh = ((rect.bottom - rect.top) / 2) * pose.s
  const [cz, sz] = [Math.cos(pose.r * RAD), Math.sin(pose.r * RAD)]
  const [cyw, syw] = [Math.cos(pose.ry * RAD), Math.sin(pose.ry * RAD)]
  const [cxw, sxw] = [Math.cos(pose.rx * RAD), Math.sin(pose.rx * RAD)]
  const box = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
  for (const [x0, y0] of [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ]) {
    // rotate (about the view axis), then rotateY, then rotateX; +z is towards the viewer.
    const x1 = x0 * cz - y0 * sz
    const y1 = x0 * sz + y0 * cz
    const x2 = x1 * cyw
    const z2 = -x1 * syw
    const y3 = y1 * cxw - z2 * sxw
    const z3 = y1 * sxw + z2 * cxw
    const w = Math.max(0.05, 1 - z3 / DEPTH)
    const X = cx + x2 / w
    const Y = cy + y3 / w
    box.left = Math.min(box.left, X)
    box.right = Math.max(box.right, X)
    box.top = Math.min(box.top, Y)
    box.bottom = Math.max(box.bottom, Y)
  }
  return box
}

/**
 * The box `plan` covers at `T` ms. `level` leaves out its small tilt (a few degrees): a block of words keeps its ink
 * well inside its tilted corners, so neighbours that never touch are not counted as meeting.
 */
export function boxAt(plan: Plan, T: number, level = false): Box {
  const pose = poseAt(plan.poses, easing(plan.timing.easing)(fraction(plan, T)))
  if (level) pose.r = 0
  return project(plan.rect, pose)
}

/** How deep two boxes overlap (px): the least way either would move to part them, negative while they are apart. */
const depth = (a: Box, b: Box) => Math.min(a.right - b.left, b.right - a.left, a.bottom - b.top, b.bottom - a.top)

// ---------------------------------------------------------------------------
// Lanes: a main picture beside its words keeps to its own column
// ---------------------------------------------------------------------------

/**
 * The column a page's main picture stands in, when its words stand beside it: which side it is on (1: right of the
 * words, -1: left of them) and the line it keeps to (half way into the gap between them, at most 24px from the
 * picture). None when the words are above or below it (phones) or on both sides.
 */
export interface Lane {
  side: 1 | -1
  edge: number
}

export function laneOf(hero: Box, words: Box[]): Lane | null {
  const h = hero.bottom - hero.top
  const beside = words.filter((w) => {
    const shared = Math.min(w.bottom, hero.bottom) - Math.max(w.top, hero.top)
    const apart = w.right <= hero.left + 8 || w.left >= hero.right - 8
    return apart && shared > 0.5 * Math.min(w.bottom - w.top, h)
  })
  const left = beside.filter((w) => w.right <= hero.left + 8)
  const right = beside.filter((w) => w.left >= hero.right - 8)
  if (left.length > right.length) {
    const near = Math.max(...left.map((w) => w.right))
    return { side: 1, edge: Math.max(near + 4, hero.left - Math.min(24, (hero.left - near) / 2)) }
  }
  if (right.length) {
    const near = Math.min(...right.map((w) => w.left))
    return { side: -1, edge: Math.min(near - 4, hero.right + Math.min(24, (near - hero.right) / 2)) }
  }
  return null
}

/** How far a box reaches over the lane's line into the words' column (px; 0 when it keeps to its lane). */
const intrusion = (box: Box, lane: Lane) => (lane.side === 1 ? lane.edge - box.left : box.right - lane.edge)

/** The sampling step (ms). */
const STEP = 12

/**
 * Shifts the pose at `index` of `plan` sideways, away from the words, just enough that from `from` ms on the picture
 * never reaches over its lane's line (checked frame by frame, perspective and turn included).
 */
export function holdInLane(plan: Plan, lane: Lane, index: number, from: number) {
  const end = plan.timing.delay + plan.timing.duration
  const at = offsets(plan.poses)
  const ease = easing(plan.timing.easing)
  for (let round = 0; round < 6; round++) {
    let worst = 0
    let weight = 1
    for (let T = Math.max(from, plan.timing.delay); T <= end; T += STEP) {
      const over = intrusion(boxAt(plan, T), lane)
      if (over <= worst) continue
      worst = over
      // How much of the shifted pose shows at this moment (its share in the interpolation).
      const p = ease(fraction(plan, T))
      let i = 0
      while (i < plan.poses.length - 2 && p > at[i + 1]) i++
      const t = at[i + 1] > at[i] ? (p - at[i]) / (at[i + 1] - at[i]) : 1
      weight = i === index ? 1 - t : i + 1 === index ? t : 0
    }
    if (worst < 0.5) return
    const pose = plan.poses[index]
    const before = pose.dx ?? 0
    pose.dx = before + (lane.side * (worst + 1)) / Math.max(0.25, weight)
    // Never pushed out of the window: in that pose the picture stays on screen, keeping to its lane as far as the
    // window allows (QA, 2026-09-28: a tile's picture shifted this way flew off the right edge, the window left almost
    // empty).
    const box = project(plan.rect, whole(pose))
    const width = document.documentElement.clientWidth
    const out = lane.side === 1 ? box.right - width : -box.left
    if (out > 0) pose.dx = lane.side === 1 ? Math.max(before, pose.dx - out) : Math.min(before, pose.dx + out)
  }
}

/** A pose with every value filled in. */
const whole = (p: Pose): Required<Omit<Pose, 'offset'>> => ({ dx: p.dx ?? 0, dy: p.dy ?? 0, s: p.s ?? 1, rx: p.rx ?? 0, ry: p.ry ?? 0, r: p.r ?? 0 })

// ---------------------------------------------------------------------------
// Keeping the words clear
// ---------------------------------------------------------------------------

/** What a piece of words keeps clear of, and whether the two already overlap where they rest (a held picture). */
export interface Obstacle {
  plan: Plan
  /** Sampled boxes and opacities, from time 0 every STEP ms. */
  boxes: Box[]
  alphas: number[]
  /** Met by a piece's box as drawn, tilt included (the header: a tilted line's ink reaches its corners there). */
  exact?: boolean
}

/** Samples up to `until` ms (a change is over by then); `level` for words (boxAt). */
export function obstacle(plan: Plan, until: number, level = false): Obstacle {
  const boxes: Box[] = []
  const alphas: number[] = []
  for (let T = 0; T <= until; T += STEP) {
    alphas.push(alphaAt(plan, T))
    boxes.push(boxAt(plan, T, level))
  }
  return { plan, boxes, alphas }
}

/**
 * Something standing still and seen throughout the change: the header's items, drawn over every moving piece (Harlie's
 * brief, 2026-09-28: arriving titles and thrown words passed under HOME, BACK and MENU as the header crossfaded).
 */
export function still(vtName: string, box: Box, until: number): Obstacle {
  const poses = [{}, {}]
  const plan = { vtName, rect: box, poses, timing: { delay: 0, duration: until, easing: 'linear' }, fades: [{ opacity: 1 }, { opacity: 1 }] }
  return { ...obstacle(plan, until), exact: true }
}

/** Below this opacity (either of the two) a meeting does not count: it cannot be read over. */
const SEEN = 0.12
/** Kept between a piece of words and what it keeps clear of (px). */
const MARGIN = 6
/**
 * Pieces overlapping where they rest by at most this much (px) only touch (line boxes drawn tight: the homepage's name
 * over PORTFOLIO, About's name over its label): they are still kept apart, counting only overlap beyond the touch.
 * Pieces overlapping by more (a picture held over the words on a phone, a tile and its caption) are left alone.
 */
const TOUCH = 16
/** How much deeper than where they rest pieces that touch may overlap on the way (px): a sampling allowance only. */
const TOUCH_SLACK = 2

/** One thing a piece keeps clear of, and how deep they may overlap (px) before it counts as meeting. */
interface Against {
  o: Obstacle
  allow: number
}

/**
 * When `plan` meets one of `against` while both can be seen: the first moment (ms, -1 if never), or with `count` the
 * number of sampled frames in which it does (how bad a meeting that cannot be avoided is).
 */
function meeting(plan: Plan, against: Against[], until: number, count = false): number {
  let frames = 0
  for (let k = 0, T = 0; T <= until; k++, T += STEP) {
    const a = alphaAt(plan, T)
    if (a < SEEN) continue
    let level: Box | null = null
    let drawn: Box | null = null
    for (const { o, allow } of against) {
      if (o.alphas[k] === undefined || o.alphas[k] < SEEN) continue
      const box = o.exact ? (drawn ??= boxAt(plan, T)) : (level ??= boxAt(plan, T, true))
      if (depth(box, o.boxes[k]) <= allow) continue
      if (!count) return T
      frames++
      break
    }
  }
  return count ? frames : -1
}

/**
 * Travel kept (share of the sideways travel and of the change of size, share of the rise and fall), most first. The
 * sideways travel is the direction of the change, so a piece gives up its rise before its sideways travel.
 */
const TRAVEL: readonly (readonly [number, number])[] = [1, 0.75, 0.5, 0.3, 0.15, 0].flatMap((fx) => [
  [fx, 1] as const,
  [fx, 0.5] as const,
  [fx, 0] as const,
])

/** The shortest a leaving piece's fade is when it fades to keep clear (ms): never a pop (it was 10-20ms at times). */
const FADE_MIN = 90

/**
 * Keeps a piece of words clear of `against` while both can be seen. `far` is the index of its pose away from its
 * place (the first for an arriving piece, the last for a leaving one). An arriving piece travels a shorter way into
 * place (it gives up its rise before its sideways travel; less sideways travel keeps it inside its own column), and
 * only if that is not enough waits, a few frames at a time; if nothing is clear it takes the way that meets the others
 * least. A leaving piece travels a shorter way, or else fades before the meeting. Pairs that overlap where they rest (a
 * picture held over the words on a phone, a tile and its caption) are left alone; pairs that only touch there (TOUCH)
 * are kept apart beyond their touch, unless `touching` is false (a title turning over is not held back by the words
 * touching it: they keep clear of it instead). Returns what it did, for the development log.
 */
export function keepClear(plan: Plan, far: number, against: Obstacle[], until: number, arriving: boolean, touching = true): string {
  const rest = plan.rect
  const others = against.flatMap((o): Against[] => {
    const k = arriving ? o.boxes.length - 1 : 0
    const d = o.alphas[k] > SEEN ? depth(rest, o.boxes[k]) : -Infinity
    if (o.plan === plan || d > (touching ? TOUCH : -MARGIN)) return []
    return [{ o, allow: d > -MARGIN ? d + TOUCH_SLACK : -MARGIN }]
  })
  if (!others.length || meeting(plan, others, until) < 0) return ''
  const pose = plan.poses[far]
  const dx = pose.dx ?? 0
  const dy = pose.dy ?? 0
  const s = pose.s ?? 1
  const delay = plan.timing.delay
  const travel = (fx: number, fy: number) => {
    pose.dx = dx * fx
    pose.dy = dy * fy
    pose.s = 1 + (s - 1) * fx
  }
  // An arriving piece waits at most 15 steps (360ms; 264ms until 2026-09-28: About's biography then met its heading
  // still rising into place from where PORTFOLIO turned over, and came in over its descriptor).
  const waits = arriving ? 16 : 1
  for (let w = 0; w < waits; w++) {
    plan.timing.delay = delay + w * 24
    for (const [fx, fy] of TRAVEL) {
      travel(fx, fy)
      if (meeting(plan, others, until) < 0) return `${plan.vtName} ${fx}/${fy}+${w * 24}`
    }
  }
  // Nothing clear: an arriving piece takes the way (and wait) that meets the others in the fewest frames; a leaving
  // one travels in full and is gone before the meeting.
  if (arriving) {
    let best = { frames: Infinity, w: 0, fx: 0, fy: 0 }
    for (let w = 0; w < waits; w++) {
      plan.timing.delay = delay + w * 24
      for (const [fx, fy] of TRAVEL) {
        travel(fx, fy)
        const frames = meeting(plan, others, until, true)
        if (frames < best.frames) best = { frames, w, fx, fy }
      }
    }
    plan.timing.delay = delay + best.w * 24
    travel(best.fx, best.fy)
    return `${plan.vtName} least ${best.fx}/${best.fy}+${best.w * 24} (${best.frames})`
  }
  plan.timing.delay = delay
  travel(1, 1)
  const met = meeting(plan, others, until)
  if (met < 0) return ''
  // Gone just before the meeting, fading over at least FADE_MIN. A piece still waiting its turn to leave when the
  // meeting comes sooner than that leaves earlier, from the first frame at the latest (Harlie's QA pass, 2026-09-28:
  // going back from About's end, the contact form's rows stood waiting at full strength while the film arriving in
  // their place slid over them).
  plan.timing.delay = Math.max(0, Math.min(delay, met - STEP - FADE_MIN))
  const span = FADE_MIN / plan.timing.duration
  const u = Math.min(0.9, Math.max(span, (met - STEP - plan.timing.delay) / plan.timing.duration))
  plan.fades = u - span > 0.001 ? [{ opacity: 1 }, { opacity: 1, offset: u - span }, { opacity: 0, offset: u }, { opacity: 0 }] : [{ opacity: 1 }, { opacity: 0, offset: u }, { opacity: 0 }]
  return `${plan.vtName} fade@${Math.round(plan.timing.delay + u * plan.timing.duration)}`
}

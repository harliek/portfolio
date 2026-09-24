import { CAROUSEL } from '../../config/carousel'

/**
 * The moving arc's geometry (pure maths, no DOM).
 *
 * `s` is an object centre's position along the track (px, 0 = the stage
 * centre, positive to the right). The track is a shallow concave arc:
 *
 * - depth scale m(s): `centre` at the middle (slightly farther away), rising
 *   smoothly to `peak` at `peakAt` of the half-width (closer), then shrinking
 *   again as the object leaves (never below `minScale`);
 * - turn φ(s): proportional to the distance, towards the viewer on the outer
 *   side (the outer objects face inward);
 * - screen position X(s) = ∫ m ds, so the screen gap between neighbours
 *   grows and shrinks with their depth scale and never closes;
 * - opacity: full in the middle, dimming towards the stage edges.
 */

export interface ArcGeometry {
  /** Stage width and half-width (px). */
  W: number
  half: number
  /** Loop length (px along the track): every object's width plus one gap each. */
  L: number
  /** Gap between neighbours (px along the track). */
  gap: number
  /** Each object's track position at phase 0 (px). */
  base: number[]
  depth: (s: number) => number
  turn: (s: number) => number
  /** Screen x of an object centre relative to the stage centre. */
  x: (s: number) => number
  /** Wraps a track position into [−L/2, L/2). */
  wrap: (s: number) => number
}

const smoothstep = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/**
 * Builds the geometry for a stage `W` px wide holding objects `widths` px
 * wide (in their fixed order). If the loop is too short for an object to
 * leave the stage completely before it wraps to the other end (very wide
 * screens), the gap grows until it does.
 */
export function buildArc(W: number, widths: number[], margin: number): ArcGeometry {
  const cfg = CAROUSEL.arc
  const half = W / 2
  const depth = (s: number) => {
    const t = Math.abs(s) / half
    if (t <= cfg.peakAt) return cfg.centre + (cfg.peak - cfg.centre) * smoothstep(0, cfg.peakAt, t)
    return Math.max(cfg.minScale, cfg.peak - cfg.shrink * (t - cfg.peakAt) ** 2)
  }
  const turn = (s: number) => Math.sign(s) * Math.min(cfg.maxTurn, (cfg.turn * Math.abs(s)) / half)

  let gap = Math.min(CAROUSEL.gap.max, Math.max(CAROUSEL.gap.min, CAROUSEL.gap.ratio * W))
  const widest = Math.max(...widths)
  for (let attempt = 0; ; attempt++) {
    const L = widths.reduce((sum, w) => sum + w + gap, 0)
    // X(s) for s in [0, L/2] by the trapezoid rule; odd symmetry for s < 0.
    const N = 720
    const ds = L / 2 / N
    const table = new Float64Array(N + 1)
    for (let k = 1; k <= N; k++) table[k] = table[k - 1] + ((depth((k - 1) * ds) + depth(k * ds)) / 2) * ds
    const x = (s: number) => {
      const a = Math.min(N, Math.abs(s) / ds)
      const k = Math.min(N - 1, Math.floor(a))
      const v = table[k] + (table[k + 1] - table[k]) * (a - k)
      return s < 0 ? -v : v
    }
    // At the wrap point, the inner edge of the widest object must be past the stage edge (plus its glow).
    const end = L / 2
    const innerEdge = x(end) - (widest / 2) * depth(end)
    if (innerEdge >= half + margin || attempt > 40) {
      const base: number[] = []
      let at = 0
      widths.forEach((w, i) => {
        if (i > 0) at += widths[i - 1] / 2 + gap + w / 2
        base.push(at)
      })
      const wrap = (s: number) => ((((s + L / 2) % L) + L) % L) - L / 2
      return { W, half, L, gap, base, depth, turn, x, wrap }
    }
    gap += 12
  }
}

/** Opacity of an object whose centre is at screen x `cx` (relative to the stage centre). */
export function dimAt(g: ArcGeometry, cx: number) {
  const cfg = CAROUSEL.arc
  return 1 - (1 - cfg.dimOpacity) * smoothstep(cfg.dimFrom, cfg.dimTo, Math.abs(cx) / g.half)
}

/** Projected horizontal extent of an object `w` px wide at track position s (relative to the stage centre). */
export function extentAt(g: ArcGeometry, s: number, w: number) {
  const cx = g.x(s)
  const halfW = (w / 2) * g.depth(s) * Math.cos(g.turn(s))
  return { left: cx - halfW, right: cx + halfW, cx }
}

/**
 * The track position (between `from` and `to`, monotone in between) where
 * `f(s)` crosses `target`, by bisection.
 */
export function solve(f: (s: number) => number, target: number, from: number, to: number) {
  let lo = from
  let hi = to
  const rising = f(to) > f(from)
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2
    if (f(mid) < target === rising) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

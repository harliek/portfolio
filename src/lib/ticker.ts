/**
 * The site's one clock for the few timed things that are not CSS: the homepage tiles' glide to a project
 * (ProjectField, `tweenTo`) and the pause the scroll measurements wait after a resize (scrollProgress.ts,
 * `delayedCall`). Until 2026-09-29 GSAP's ticker timed both; it went with the rest of GSAP (Harlie's approval, audit
 * D1/E4/G1: ScrollTrigger kept an empty frame loop and a 250ms timer running on every page for the whole visit, and
 * GSAP was about 44 KB gzip of every first load for three scroll measurements and this one glide). This is GSAP's
 * clock, kept step for step so a glide or a resize's pause starts, moves and ends on the same frames as before
 * (gsap-core.js 3.15.0, removed with the package: the ticker at :1268-1383, the root timeline's frame and its sleep
 * at :2676-2692, Power2's curve at :1526-1535, a number's value at :3690):
 * - Time is Date.now() based and moves on once per animation frame, at most 240 times a second.
 * - A frame that comes more than 500ms after the last one (a long task, or the tab hidden and shown again) moves it on
 *   by only 33ms (GSAP's default lagSmoothing(500, 33)), so a glide carries on from where it was instead of jumping to
 *   its end.
 * - It wakes when this module loads (as GSAP's did when it loaded) and when something is timed on it while it
 *   sleeps; waking runs a frame at once, so what starts then counts from that moment. While it is awake, what starts
 *   counts from its last frame: a glide or a pause started after a long task is that much further on at its first
 *   frame, as it was with GSAP.
 * - It sleeps only on its 30th frame and every 120th after (GSAP's autoSleep checks), and only if nothing is timed on
 *   it then (a paused call does not count). So after its last glide or pause it runs on for up to 120 frames (about 2
 *   seconds at 60 frames a second), then stops; nothing runs while the page is still. scrollProgress.ts keeps the
 *   half-second call ScrollTrigger made when it started, which is usually still waiting at the 30th frame after a
 *   load, so the clock runs on to its 150th, as GSAP's did.
 * Checked against the GSAP build on 2026-09-29 (glides, resize pauses, long tasks, clocks awake and asleep).
 */

const LAG_THRESHOLD = 500
const ADJUSTED_LAG = 33
const GAP = 1000 / 240
const AUTO_SLEEP = 120

/** Something timed on the clock (a child of GSAP's root timeline), in the order it was added. */
interface Child {
  /** The clock time (s) it starts at. */
  start: number
  /** Running, not paused: only these keep the clock awake. */
  active: boolean
  render(time: number): void
}

let origin = Date.now()
let lastUpdate = origin
let nextTime = GAP
/** The time (s) of the last frame that moved the clock: where anything started now begins. */
let time = 0
let frame = 0
/** The frame on which the clock next sleeps if nothing is timed on it. */
let nextCheck = 30
let awake = false
let request = 0
const children: Child[] = []

/** GSAP compares times rounded to 7 decimals, so the same moment reached two ways matches. */
const round7 = (v: number) => Math.round(v * 1e7) / 1e7 || 0

const remove = (c: Child) => {
  const i = children.indexOf(c)
  if (i >= 0) children.splice(i, 1)
}

function tick() {
  const elapsed = Date.now() - lastUpdate
  if (elapsed > LAG_THRESHOLD || elapsed < 0) origin += elapsed - ADJUSTED_LAG
  lastUpdate += elapsed
  const now = lastUpdate - origin
  const overlap = now - nextTime
  // The next frame is asked for before anything runs, as GSAP does (a slow job does not push the next frame back).
  request = requestAnimationFrame(tick)
  if (overlap <= 0) return
  frame++
  nextTime += overlap + (overlap >= GAP ? 4 : GAP - overlap)
  time = round7(now / 1000)
  // In order; what one of them removes is not reached, as in GSAP's linked list.
  for (let c: Child | undefined = children[0]; c; ) {
    const next: Child | undefined = children[children.indexOf(c) + 1]
    if (c.active && time >= c.start) c.render(time)
    c = next && children.includes(next) ? next : undefined
  }
  if (frame >= nextCheck) {
    nextCheck += AUTO_SLEEP
    if (!children.some((c) => c.active)) {
      cancelAnimationFrame(request)
      awake = false
    }
  }
}

function wake() {
  if (awake) return
  cancelAnimationFrame(request)
  awake = true
  tick()
}

export interface DelayedCall {
  /** Starts the wait again from now (GSAP's restart(true)). */
  restart(): void
  /** Stops waiting without calling. */
  pause(): void
}

/**
 * Calls `fn` once, on the first frame at least `delay` seconds on (GSAP's delayedCall): started at once, and again by
 * each restart().
 */
export function delayedCall(delay: number, fn: () => void): DelayedCall {
  const c: Child = {
    start: 0,
    active: true,
    render() {
      remove(c)
      fn()
    },
  }
  wake()
  c.start = round7(time + delay)
  children.push(c)
  return {
    restart() {
      wake()
      c.active = true
      c.start = round7(time + delay)
      // Back on the clock at the end if it had already been called; in its place if it was waiting or paused.
      if (!children.includes(c)) children.push(c)
    },
    pause() {
      c.active = false
    },
  }
}

export interface Tween {
  kill(): void
}

/** Each object's running tween: a new one replaces it (GSAP's overwrite: true). */
const running = new WeakMap<object, Tween>()

/** GSAP's power2.inOut (Power2.easeInOut, the cubic): slow to start, quick through the middle, slow to arrive. */
const power2InOut = (p: number) => (p < 0.5 ? Math.pow(p * 2, 3) / 2 : 1 - Math.pow((1 - p) * 2, 3) / 2)

/**
 * Moves `target[key]` to `to` over `duration` seconds, easing in and out (power2.inOut), then calls `onComplete`
 * (after the last value is written, in that frame). Like gsap.to(): the starting value is read on its first frame,
 * values are rounded to 6 decimals, and kill() stops it where it is, without onComplete.
 */
export function tweenTo<K extends string>(target: Record<K, number>, key: K, to: number, duration: number, onComplete: () => void): Tween {
  wake()
  const start = time
  let from = NaN
  let change = 0
  const c: Child = {
    start,
    active: true,
    render(t) {
      const elapsed = t - start
      const done = elapsed > duration - 1e-8
      const at = done ? duration : elapsed < 1e-8 ? 0 : elapsed
      if (Number.isNaN(from)) {
        from = +target[key] || 0
        change = to - from
      }
      target[key] = Math.round((from + change * power2InOut(at / duration)) * 1e6) / 1e6
      if (!done) return
      tween.kill()
      onComplete()
    },
  }
  const tween: Tween = {
    kill() {
      remove(c)
      if (running.get(target) === tween) running.delete(target)
    },
  }
  children.push(c)
  running.get(target)?.kill()
  running.set(target, tween)
  return tween
}

wake()

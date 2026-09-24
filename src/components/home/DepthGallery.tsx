import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { GALLERY } from '../../config/carousel'
import { ACCENTS, accentVars, type AccentId } from '../../content/accents'
import { CAROUSEL_ITEMS } from '../../content/carousel'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'
import { notePaused, notePosition, persistPosition, recallPaused, recallPosition } from './carouselMemory'
import { GalleryObject } from './GalleryObject'
import { buildScene, FEATURED_SIZES, frontBoost, mod, objectSizes, OPENING_POS, place, titleGap, type Box, type Placement, type Scene } from './galleryModel'

/** Debug handle for browser checks in development. */
interface GalleryDebug {
  pos: () => number
  mode: () => string
  /** Current speed (items per second; positive = leftward travel). */
  speed: () => number
  /** Current wheel boost (extra speed in multiples of the idle speed) and run share (0 to 1). */
  boost: () => { energy: number; boost: number; run: number }
  state: () => { hover: number; focus: number; kbd: boolean; press: number; touch: boolean; busy: boolean; paused: boolean; featured: number; holdIn: number; frame: boolean; wake: boolean }
  placements: () => Placement[]
  scene: () => Scene
  /** Moves the gallery to a position; `run` continues the travel from there at full speed, otherwise it holds until the next input. */
  seek: (pos: number, run?: boolean) => void
  step: (dir: 1 | -1) => void
  /** Speed multiplier for loop tests. */
  timeScale: number
}
declare global {
  interface Window {
    __homeGallery?: GalleryDebug
  }
}

const N = CAROUSEL_ITEMS.length
const TOUCH_QUERY = '(hover: none), (pointer: coarse)'
/** Open menus and dialogs keep their own wheel scrolling. */
const OWN_SCROLL = '.work-shelf[data-open], .site-menu[data-open], [role="dialog"], [aria-modal="true"], dialog'

type Mode = 'run' | 'step' | 'drag'

/** A pale rim tint per accent (the tight silhouette edge): the accent mixed half way to the room's lavender white. */
function rimRgb(id: AccentId) {
  const [r, g, b] = ACCENTS[id].rgb.split(' ').map(Number)
  const mix = (v: number, w: number) => Math.round(v * 0.5 + w * 0.5)
  return `${mix(r, 244)} ${mix(g, 240)} ${mix(b, 255)}`
}

/** The largest rendered width at the current window size, for the images' `sizes` (front and hover included). */
function initialSizes() {
  const scene = buildScene(window.innerWidth, window.innerHeight, window.innerWidth < 600 ? 'mobile' : 'desktop')
  const boost = frontBoost(scene, FEATURED_SIZES)
  return FEATURED_SIZES.map((s, i) => `${Math.ceil(s.w * scene.u * boost[i] * GALLERY.hover.scale)}px`)
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const smoothstep = (e0: number, e1: number, x: number) => smooth(clamp((x - e0) / (e1 - e0), 0, 1))

/**
 * The homepage depth gallery: the seven transparent PNG objects standing in
 * the architectural room at different depths (galleryModel.ts), in their
 * fixed order, with the featured object substantially closer and larger,
 * its two neighbours about three quarters of its size and turned towards
 * the viewer, and the outer ones receding at the window's edges.
 *
 * Motion. The objects travel continuously to the left: each approaches from
 * the right, passes through the featured position and recedes to the left
 * (position, scale, turn, stacking order and brightness change together;
 * one continuous position, no snapping). Wheel and trackpad input, in any
 * direction, smoothly speeds up that same leftward travel in proportion to
 * the scrolling, capped at 2.5 times the idle speed, and eases back within
 * about 800 ms of the last input; the page itself never scrolls. The
 * previous and next arrows, the arrow keys (focus in the gallery) and
 * horizontal swipes bring the neighbouring project to the front with a
 * critically damped settle; the travel resumes shortly after.
 *
 * Hover never pauses the travel: the object under the pointer (also a
 * still pointer, as the objects glide beneath it) comes slightly forward
 * with a stronger glow. A press picks its object at once: the click that
 * completes it opens that project, whatever has moved under the pointer
 * meanwhile, and the travel holds while the button is down. Keyboard focus
 * in the gallery holds it too, so a focused object stays put to be
 * activated; an object that is not clearly shown comes to the front. A
 * "Pause motion" control, hidden until it receives keyboard focus (the
 * gallery's first stop), stops the travel for the session; Space on an
 * object does the same.
 *
 * Only the foremost object shows its live title and subtitle, centred
 * beneath it in a reserved caption area (the other names stay in the
 * accessibility tree as each link's name).
 *
 * Reduced motion (the operating system's setting): the same arrangement,
 * still; steps (arrows, keys, swipe, one per wheel gesture) change with a
 * short cross-fade.
 *
 * Browser Back restores the position (carouselMemory.ts); every listener
 * (including the window wheel listener) is removed when the homepage
 * unmounts.
 */
export function DepthGallery() {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { key: locationKey } = useLocation()
  const reduced = useReducedMotion()
  const touch = useMediaQuery(TOUCH_QUERY)
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const objectRefs = useRef<Array<HTMLSpanElement | null>>([])
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  /** The position survives effect re-runs within one history entry (the motion setting changed). */
  const kept = useRef<{ key: string; pos: number } | null>(null)
  const api = useRef<{ step: (dir: 1 | -1) => void; freeze: (i: number) => void; resume: (i: number) => void; dragged: () => boolean; appear: () => void; kick: () => void } | null>(null)
  // The images' `sizes`: chosen for this window, raised if a resize makes the objects notably larger.
  const [sizes, setSizes] = useState(initialSizes)
  /** The visitor's own pause (the keyboard-revealed control or Space on an object): lasts for the session. */
  const [paused, setPaused] = useState(recallPaused)
  const pausedRef = useRef(paused)
  const togglePause = useCallback(() => {
    const next = !pausedRef.current
    pausedRef.current = next
    notePaused(next)
    setPaused(next)
    api.current?.kick()
  }, [])
  /**
   * When each object's image was ready to show (performance.now(); 0: already
   * loaded at mount; NaN: not yet). Until then the object (with its floor
   * light, shadow and reflection) and its name stay hidden; then they fade
   * in together (GALLERY.appear; at once with reduced motion).
   */
  const shownAt = useRef<number[]>(Array.from({ length: N }, () => Number.NaN))
  const markReady = useCallback((i: number, instant: boolean) => {
    if (!Number.isNaN(shownAt.current[i])) return
    shownAt.current[i] = instant ? 0 : performance.now()
    api.current?.appear()
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const items = itemRefs.current.slice(0, N) as HTMLLIElement[]
    const objects = objectRefs.current.slice(0, N) as HTMLSpanElement[]
    const labels = labelRefs.current.slice(0, N) as HTMLSpanElement[]
    const links = linkRefs.current.slice(0, N) as HTMLAnchorElement[]
    if (!root || !stage || [items, objects, labels, links].some((list) => list.length < N || list.some((x) => !x))) return

    // ------------------------------------------------------------------
    // Measurement and layout
    // ------------------------------------------------------------------
    let scene: Scene = buildScene(1440, 900, 'desktop')
    const widths = new Float64Array(N)
    const heights = new Float64Array(N)
    let boost: number[] = new Array<number>(N).fill(1)
    /** Each caption's half-width (px). */
    const capHalf = new Float64Array(N)
    const P: Placement[] = Array.from({ length: N }, () => ({ d: 0, a: 0, s: 1, k: 1, turn: 0, x: 0, base: 0, hw: 0, vis: 1, op: 1 }))
    const written = {
      t: new Array<string>(N).fill(''),
      o: new Array<string>(N).fill(''),
      z: new Array<number>(N).fill(-1),
      tier: new Array<number>(N).fill(-1),
      room: new Array<number>(N).fill(-1),
      off: new Array<number>(N).fill(-1),
      lt: new Array<string>(N).fill(''),
      lo: new Array<string>(N).fill(''),
    }
    let featured = -1
    const dpr = window.devicePixelRatio || 1
    const px = (v: number) => (Math.round(v * dpr * 4) / (dpr * 4)).toFixed(2)

    const floorFile = (): 'desktop' | 'mobile' => (document.querySelector<HTMLElement>('.stage-bg')?.dataset.file === 'mobile' ? 'mobile' : 'desktop')

    /** The captions' sizes; returns the tallest (px). */
    const measureLabels = () => {
      let tallest = 0
      labels.forEach((label, i) => {
        const cap = label.querySelector<HTMLElement>('.gobj__caption')
        capHalf[i] = (cap?.offsetWidth ?? 240) / 2
        tallest = Math.max(tallest, cap?.offsetHeight ?? 0)
      })
      return tallest
    }

    /**
     * The homepage title's right and bottom edges and its lines' boxes, in
     * stage px: the name and the supporting line by their text, "Port" and
     * "folio" by their boxes grown by their violet edge.
     */
    const identity = () => {
      const home = root.closest('.home')
      const id = home?.querySelector('.home-id__block')
      if (!home || !id) return null
      const s = stage.getBoundingClientRect()
      const box = (r: DOMRect, grow = 0): Box => ({ l: r.left - s.left - grow, t: r.top - s.top - grow, r: r.right - s.left + grow, b: r.bottom - s.top + grow })
      const text = (el: Element) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return range.getBoundingClientRect()
      }
      const lines: Box[] = []
      for (const el of home.querySelectorAll('.home-id__name, .home-id__desc')) lines.push(box(text(el)))
      for (const el of home.querySelectorAll<HTMLElement>('.home-id__port, .home-id__folio')) lines.push(box(el.getBoundingClientRect(), parseFloat(getComputedStyle(el).fontSize) * 0.03))
      const r = id.getBoundingClientRect()
      return { right: r.right - s.left, bottom: r.bottom - s.top, lines }
    }

    const measure = () => {
      const caption = measureLabels()
      const bar = barRef.current?.querySelector('.gallery__nav')?.getBoundingClientRect()
      const barTop = bar ? bar.top - stage.getBoundingClientRect().top : stage.clientHeight
      scene = buildScene(stage.clientWidth, stage.clientHeight, floorFile(), { id: identity(), caption, bar: barTop })
      root.style.setProperty('--u', scene.u.toFixed(4))
      root.dataset.cls = scene.cls
      const sized = objectSizes(scene)
      boost = sized.boost
      for (let i = 0; i < N; i++) {
        widths[i] = sized.widths[i]
        heights[i] = sized.heights[i]
        items[i].style.setProperty('--w', `${widths[i].toFixed(2)}px`)
        items[i].style.setProperty('--h', `${heights[i].toFixed(2)}px`)
      }
      written.t.fill('')
      written.lt.fill('')
    }

    /**
     * How much of the hover's growth and rise object i can take at placement
     * `p` and stay `hover.clear` px from the title (1: all of it).
     */
    const roomAt = (i: number, p: Placement) => {
      if (p.op <= 0.05 || p.d >= 0.5) return 1
      const { scale, frontScale, lift, clear } = GALLERY.hover
      const hs = p.a < 0.5 ? frontScale : scale
      const gapAt = (r: number) => titleGap(i, p, scene, widths[i], heights[i], 1 + (hs - 1) * r, lift * scene.u * r)
      if (gapAt(1) >= clear) return 1
      let lo = 0
      let hi = 1
      for (let k = 0; k < 5; k++) {
        const mid = (lo + hi) / 2
        if (gapAt(mid) >= clear) lo = mid
        else hi = mid
      }
      return lo
    }
    /** The placements a moment ahead on the current movement (for the hover's room). */
    const PA: Placement[] = P.map((p) => ({ ...p }))
    const LOOK_AHEAD_S = 0.35

    /** How far each object has appeared (0 until its image has decoded, then a short fade to 1). */
    const appeared = new Float64Array(N)
    const layout = () => {
      place(pos, widths, boost, scene, P)
      if (scene.title.length) place(pos + (mode === 'drag' ? 0 : speed * LOOK_AHEAD_S), widths, boost, scene, PA)
      const { u, W } = scene
      const tNow = performance.now()
      for (let i = 0; i < N; i++) {
        const t = shownAt.current[i]
        const x = Number.isNaN(t) ? 0 : t === 0 || reduced ? 1 : clamp((tNow - t) / GALLERY.appear.ms, 0, 1)
        appeared[i] = x * (2 - x)
      }
      const persp = (GALLERY.perspective * u).toFixed(0)
      const { gap, follow, show, edgeMargin } = GALLERY.label
      let nearest = 0
      for (let i = 1; i < N; i++) if (P[i].a < P[nearest].a) nearest = i
      // The caption line: a fixed distance below the featured slot's base.
      const ly = scene.yb0 + gap
      for (let i = 0; i < N; i++) {
        const p = P[i]
        const obj = objects[i]
        // Place, depth scale and floor line come from the model's single horizon
        // and front position; the turn gets a gentle keystone about the object's
        // own axis (projectTransition.ts reads this perspective() rotateY() pair).
        const t = `translate3d(${px(p.x - widths[i] / 2)}px, ${px(p.base - heights[i])}px, 0) scale(${p.k.toFixed(4)}) perspective(${persp}px) rotateY(${p.turn.toFixed(4)}rad)`
        if (t !== written.t[i]) {
          obj.style.transform = t
          written.t[i] = t
        }
        const o = (p.op * appeared[i]).toFixed(3)
        if (o !== written.o[i]) {
          obj.style.opacity = o
          written.o[i] = o
        }
        const z = Math.round(100 - p.a * 10)
        if (z !== written.z[i]) {
          obj.style.zIndex = String(z)
          written.z[i] = z
        }
        const tier = p.a < 0.5 ? 0 : p.a < 1.5 ? 1 : 2
        if (tier !== written.tier[i]) {
          items[i].dataset.tier = String(tier)
          written.tier[i] = tier
        }
        // Beneath the title, hover grows and rises the object only as far as
        // keeps it `hover.clear` px from the title, here and a moment ahead
        // on its path (the lift eases over 280 ms): --room, 1 fully, 0 not at all.
        const room = scene.title.length ? Math.min(roomAt(i, p), roomAt(i, PA[i])) : 1
        const rq = Math.floor(room * 20) / 20
        if (rq !== written.room[i]) {
          items[i].style.setProperty('--room', String(rq))
          written.room[i] = rq
        }
        // The caption: only the foremost object's, beneath the featured slot,
        // following its object a little sideways; it fades out before the
        // next object becomes the foremost (never two at once).
        const half = capHalf[i]
        let lx = scene.x0 + (p.x - scene.x0) * follow
        if (W > 2 * (half + edgeMargin)) lx = clamp(lx, half + edgeMargin, W - half - edgeMargin)
        else lx = W / 2
        const lop = i === nearest ? (1 - smoothstep(show, 0.5, p.a)) * appeared[i] : 0
        const lt = `translate3d(${px(lx)}px, ${px(ly)}px, 0)`
        if (lt !== written.lt[i]) {
          labels[i].style.transform = lt
          written.lt[i] = lt
        }
        const lo = lop.toFixed(3)
        if (lo !== written.lo[i]) {
          labels[i].style.opacity = lo
          written.lo[i] = lo
        }
        // Pointer targets: only objects (and the caption) that are clearly shown.
        const inStage = Math.min(p.x + p.hw, W) - Math.max(p.x - p.hw, 0)
        const off = (p.op * appeared[i] < 0.35 || inStage < p.hw * 0.9 ? 1 : 0) + (lop < 0.45 ? 2 : 0)
        if (off !== written.off[i]) {
          if (off & 1) items[i].dataset.off = ''
          else delete items[i].dataset.off
          if (off & 2) items[i].dataset.labelOff = ''
          else delete items[i].dataset.labelOff
          written.off[i] = off
        }
      }
      if (nearest !== featured) {
        if (featured >= 0) delete items[featured].dataset.featured
        items[nearest].dataset.featured = ''
        featured = nearest
      }
    }

    // ------------------------------------------------------------------
    // Motion state
    // ------------------------------------------------------------------
    const restored = recallPosition(locationKey, navigationType)
    const same = kept.current?.key === locationKey
    let pos = same ? kept.current!.pos : (restored?.pos ?? OPENING_POS)
    // Reduced motion (also switched on mid-travel) rests on the nearest project.
    if (reduced) pos = Math.round(pos)
    let vel = 0
    let mode: Mode = 'run'
    let target = Math.round(pos)
    /** The travel holds still until then (the opening, Back, after a step). */
    let holdUntil = performance.now() + (same ? 0 : restored ? GALLERY.returnHoldMs : GALLERY.openingHoldMs)
    /** The travel's share of its idle speed: eased in from rest and out to a stop (0 to 1, before easing). */
    let rampT = same ? 1 : 0
    /** Wheel energy (extra speed, in multiples of the idle speed) and the extra speed following it smoothly. */
    let energy = 0
    let extra = 0
    let speed = 0
    const st = { hover: -1, focus: -1, active: -1, kbd: false, press: -1, touch: false, busy: false, visible: document.visibilityState === 'visible' }
    let raf = 0
    let last = 0
    let wake = 0
    let fade = 0
    let pollAt = 0
    const debugScale = () => (import.meta.env.DEV ? (window.__homeGallery?.timeScale ?? 1) : 1)

    const save = () => {
      kept.current = { key: locationKey, pos }
      notePosition(locationKey, { pos: mod(pos, N) })
      persistPosition(locationKey)
    }
    /** Something holds the travel: the visitor's pause, keyboard focus in the gallery, a press or a hand on the screen. */
    const holding = () => pausedRef.current || st.kbd || st.press >= 0 || st.touch

    const kick = () => {
      window.clearTimeout(wake)
      wake = 0
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }
    const wakeAt = (t: number) => {
      window.clearTimeout(wake)
      wake = 0
      if (Number.isFinite(t)) wake = window.setTimeout(kick, Math.max(0, t - performance.now()) + 16)
    }

    /** Hover follows a still pointer as the objects glide beneath it. */
    const pointer = { x: 0, y: 0, inside: false }

    function frame(now: number) {
      raf = 0
      if (st.busy || !st.visible) {
        last = 0
        return
      }
      const dt = (last ? Math.min(now - last, GALLERY.maxStep * 1000) / 1000 : 0) * debugScale()
      last = now
      if (mode === 'drag') {
        layout()
        return
      }
      let again = true
      if (mode === 'step') {
        // Critically damped spring towards the target (exact step): no bounce, no overshoot.
        const w = GALLERY.settle.omega
        const x = pos - target
        const e = Math.exp(-w * dt)
        const k = vel + w * x
        pos = target + (x + k * dt) * e
        vel = (vel - w * k * dt) * e
        speed = vel
        if (Math.abs(pos - target) < 0.0008 && Math.abs(vel) < 0.02) {
          pos = target
          vel = 0
          speed = 0
          mode = 'run'
          rampT = 0
          holdUntil = now + GALLERY.stepHoldMs
          save()
          announce()
        }
      } else if (reduced) {
        again = false
      } else {
        // Continuous leftward travel: the idle speed (a gentle wave, slower near
        // each featured position, never stopped) eased in and out, plus the
        // wheel's extra speed.
        const hold = holding()
        const still = hold || now < holdUntil
        const { rate, wave, rampMs, stopMs } = GALLERY.drift
        if (still) rampT = Math.max(0, rampT - (dt * 1000) / stopMs)
        else rampT = Math.min(1, rampT + (dt * 1000) / rampMs)
        const { decayMs, smoothMs } = GALLERY.wheel
        energy *= Math.exp((-dt * 1000) / decayMs)
        extra += (energy - extra) * (1 - Math.exp((-dt * 1000) / smoothMs))
        if (hold) {
          energy = 0
          extra = Math.min(extra, rampT)
        }
        const f = pos - Math.floor(pos)
        const shape = (1 - wave * Math.cos(2 * Math.PI * f)) / Math.sqrt(1 - wave * wave)
        speed = rate * Math.min(shape * smooth(rampT) + extra, 1 + GALLERY.wheel.max)
        pos += speed * dt
        // At rest and meant to stay so: no frames until something wakes the travel.
        if (still && rampT === 0 && extra < 1e-4) {
          speed = 0
          extra = 0
          energy = 0
          again = false
        }
      }
      if (pos > N * 1000 || pos < -N * 1000) pos = mod(pos, N)
      layout()
      // Hover follows what is under a still pointer (mouse and pen).
      if (pointer.inside && now >= pollAt && !st.busy) {
        pollAt = now + GALLERY.hover.pollMs
        setHover(indexOf(document.elementFromPoint(pointer.x, pointer.y)))
      }
      if (again) raf = requestAnimationFrame(frame)
      else if (!reduced && !holding() && mode === 'run') wakeAt(holdUntil)
    }

    /** After a hold ends (focus leaves, the press ends, the pause is lifted): the travel ramps in again. */
    const resume = () => {
      if (holding()) return
      kick()
    }

    /** Announces the featured project after an arrow-button step (keyboard steps move focus, which announces itself). */
    let announcePending = false
    function announce() {
      if (!announcePending || !liveRef.current) return
      announcePending = false
      const item = CAROUSEL_ITEMS[mod(Math.round(pos), N)]
      liveRef.current.textContent = [item.name, item.subtitle].filter(Boolean).join('. ')
    }

    /**
     * Reduced motion: a short cross-fade to position T (opacity only; Web
     * Animations, which the site-wide reduced-motion CSS rule does not shorten).
     */
    const list = stage.querySelector<HTMLElement>('.gallery__list')
    let swapping = false
    let fadeAnim: Animation | null = null
    const crossfadeTo = (T: number) => {
      window.clearTimeout(fade)
      const { outMs, inMs } = GALLERY.reduced
      const from = list ? Number(getComputedStyle(list).opacity) : 1
      fadeAnim?.cancel()
      fadeAnim = list?.animate([{ opacity: from }, { opacity: 0 }], { duration: outMs * from, easing: 'ease-out', fill: 'forwards' }) ?? null
      swapping = true
      fade = window.setTimeout(() => {
        pos = T
        target = T
        swapping = false
        layout()
        save()
        announce()
        fadeAnim?.cancel()
        fadeAnim = list?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inMs, easing: 'ease-out' }) ?? null
      }, outMs * from)
    }

    /** Settles on position T with the spring, carrying the current speed into it. */
    const settleTo = (T: number) => {
      if (mode !== 'step') vel = speed
      target = T
      mode = 'step'
      energy = 0
      extra = 0
      kick()
    }

    /** The resting position the gallery is at or heading to (its foremost project). */
    const heading = () => (reduced ? (swapping ? target : Math.round(pos)) : mode === 'step' ? target : Math.round(pos))

    /** One project forward (the next one comes to the front; leftward) or back. Returns the new target. */
    const step = (dir: 1 | -1) => {
      if (st.busy) return target
      const T = heading() + dir
      if (reduced) {
        target = T
        crossfadeTo(T)
        return T
      }
      settleTo(T)
      return T
    }

    /**
     * Arrow keys on object i: the object beside it (in the key's direction)
     * comes to the front, and the caller moves the focus to it. From the
     * foremost object this is one ordinary step; from a neighbour it may
     * mean no movement (the foremost one is beside it) or a longer one.
     * Returns the new position.
     */
    const stepFrom = (i: number, dir: 1 | -1) => {
      const ref = heading()
      if (st.busy || mod(ref, N) === i) return step(dir)
      const half = Math.floor(N / 2)
      const T = ref + clamp(mod(i - ref + half, N) - half + dir, -half, half)
      if (reduced) {
        if (T !== ref) {
          target = T
          crossfadeTo(T)
        }
        return T
      }
      settleTo(T)
      return T
    }

    /** Brings item i to the front (keyboard focus on an object that is not clearly shown). */
    const feature = (i: number) => {
      const d = P[i].d
      if (Math.abs(d) < 0.02 && mode !== 'step') return
      const T = Math.round(pos + d)
      if (reduced) {
        if (Math.abs(d) >= 0.5) crossfadeTo(T)
        return
      }
      settleTo(T)
    }

    measure()
    layout()
    root.dataset.ready = 'true'

    // Objects whose image decoded after the gallery mounted fade in (layout reads `shownAt`).
    let appearRaf = 0
    const fading = () => {
      if (reduced) return false
      const now = performance.now()
      return shownAt.current.some((t) => t > 0 && now - t < GALLERY.appear.ms)
    }
    const appearFrame = () => {
      appearRaf = 0
      layout()
      if (fading()) appearRaf = requestAnimationFrame(appearFrame)
    }
    const appear = () => {
      if (!appearRaf) appearRaf = requestAnimationFrame(appearFrame)
    }
    if (fading()) appear()

    // ------------------------------------------------------------------
    // Hover (mouse and pen): only an object's silhouette or the shown caption
    // counts. It never holds the travel; the object glows and lifts a little.
    // ------------------------------------------------------------------
    function indexOf(el: EventTarget | null) {
      if (!(el instanceof Element)) return -1
      const li = el.closest<HTMLElement>('[data-index]')
      return li && root!.contains(li) && el.closest('[data-hit]') ? Number(li.dataset.index) : -1
    }
    const setActive = () => {
      const next = st.hover >= 0 ? st.hover : st.focus
      if (next === st.active) return
      if (st.active >= 0) delete items[st.active].dataset.active
      if (next >= 0) items[next].dataset.active = ''
      st.active = next
      if (next >= 0) root.dataset.hasActive = ''
      else delete root.dataset.hasActive
    }
    function setHover(i: number) {
      if (st.hover === i) return
      st.hover = i
      if (i >= 0) warmProject(CAROUSEL_ITEMS[i].path)
      setActive()
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || st.busy) return
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.inside = true
      setHover(indexOf(e.target))
    }
    // Left the gallery (onto the title, the header, or out of the window).
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.inside = false
      setHover(-1)
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)

    // ------------------------------------------------------------------
    // A press picks its object at once. The click that completes it opens
    // that object's project, even if another object has moved under the
    // pointer since (or none: the click then lands beside the links). The
    // travel holds while the button is down (and a hand on a touch screen).
    // ------------------------------------------------------------------
    const press = { i: -1, x: 0, y: 0, t: -Infinity, id: -1 }
    const onPressDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || st.busy) return
      const i = indexOf(e.target)
      press.i = i
      press.x = e.clientX
      press.y = e.clientY
      press.t = performance.now()
      press.id = e.pointerId
      if (i >= 0 && e.pointerType !== 'touch') {
        st.press = i
        items[i].dataset.pressed = ''
      }
    }
    const endPress = (e: PointerEvent) => {
      if (e.pointerId !== press.id || st.press < 0) return
      const i = st.press
      st.press = -1
      // The pressed look stays until the click has opened the project (or not).
      window.setTimeout(() => {
        if (!st.busy) delete items[i].dataset.pressed
      }, 0)
      resume()
    }
    root.addEventListener('pointerdown', onPressDown, true)
    window.addEventListener('pointerup', endPress, true)
    window.addEventListener('pointercancel', endPress, true)

    const openItem = (i: number) => {
      const item = CAROUSEL_ITEMS[i]
      const source = objects[i]?.querySelector<HTMLElement>('[data-cover-source]') ?? null
      const result = openProject({ path: item.path, source, navigate, onCancel: () => api.current?.resume(i) })
      if (result === 'cover') api.current?.freeze(i)
    }

    // A swipe is not a tap; a pointer click opens the pressed object (see above).
    const onClickCapture = (e: globalThis.MouseEvent) => {
      if (performance.now() - drag.endedAt < 400) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      const pr = { ...press }
      press.i = -1
      press.t = -Infinity
      // Keyboard activation, assistive technology or a script: the link's own handler opens it.
      if (e.detail === 0 || performance.now() - pr.t > GALLERY.press.ms) return
      const onLink = e.target instanceof Element && e.target.closest('.gobj__link')
      // Controls (the arrows, the pause control) keep their own clicks.
      if (pr.i < 0 && !onLink) return
      const moved = Math.hypot(e.clientX - pr.x, e.clientY - pr.y) > GALLERY.press.slop
      const own = pr.i >= 0 && links[pr.i].contains(e.target as Node)
      const plain = e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
      // A modified click (new tab or window) on the pressed object's own link stays native.
      if (!plain && own && !moved) return
      e.preventDefault()
      e.stopPropagation()
      if (pr.i < 0 || moved || st.busy || !plain) return
      openItem(pr.i)
    }
    root.addEventListener('click', onClickCapture, true)

    // ------------------------------------------------------------------
    // Keyboard: focus in the gallery holds the travel, so the focused object
    // stays put to be activated. A focused object comes to the front (where
    // its caption, with the focus ring, shows). Arrows step from the focused
    // object (stepFrom); Space on an object pauses or resumes the travel.
    // ------------------------------------------------------------------
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target instanceof Element ? e.target : null
      if (!el || !root.contains(el) || !el.matches(':focus-visible')) return
      st.kbd = true
      const li = el.closest<HTMLElement>('[data-index]')
      st.focus = li ? Number(li.dataset.index) : -1
      setActive()
      if (st.focus >= 0) feature(st.focus)
    }
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget instanceof Element ? e.relatedTarget : null
      if (next && root.contains(next)) return
      st.kbd = false
      st.focus = -1
      setActive()
      resume()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const el = e.target instanceof Element ? e.target : null
      const onLink = el?.closest('.gobj__link')
      if (e.key === ' ' && onLink && !reduced) {
        e.preventDefault()
        togglePause()
        return
      }
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.shiftKey) return
      const onArrow = el?.closest('.gallery__arrow')
      if (!onLink && !onArrow) return
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const at = onLink ? links.indexOf(onLink as HTMLAnchorElement) : -1
      if (at >= 0) {
        // From the focused object (not the foremost one): focus never skips an object.
        const T = stepFrom(at, dir)
        links[mod(T, N)].focus({ preventScroll: true })
      } else {
        announcePending = true
        step(dir)
      }
    }
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    root.addEventListener('keydown', onKeyDown)

    // ------------------------------------------------------------------
    // Wheel and trackpad, anywhere on the homepage (it does not scroll):
    // any direction speeds up the leftward travel, in proportion, capped.
    // ------------------------------------------------------------------
    const wheelGesture = { last: -Infinity, acc: 0, stepped: false }
    const onWheel = (e: WheelEvent) => {
      // Browser zoom (ctrl or cmd with the wheel, trackpad pinch) stays native.
      if (e.ctrlKey || e.metaKey) return
      if (e.target instanceof Element && e.target.closest(OWN_SCROLL)) return
      const html = document.documentElement
      if (html.classList.contains('is-menu-open') || html.classList.contains('is-dialog-open')) return
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const raw = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit
      if (!raw) return
      const now = performance.now()
      if (st.busy || mode === 'drag') return
      if (reduced) {
        // One step per gesture: down (or right) brings the next project to the front.
        const g = wheelGesture
        if (now - g.last > GALLERY.reduced.gapMs) {
          g.acc = 0
          g.stepped = false
        }
        g.last = now
        g.acc += raw
        if (!g.stepped && Math.abs(g.acc) >= GALLERY.reduced.wheelPx) {
          g.stepped = true
          announcePending = true
          step(g.acc > 0 ? 1 : -1)
        }
        return
      }
      // Held (the visitor's pause, keyboard focus, a press) or settling a step: discarded, never applied later.
      if (holding() || mode === 'step') return
      const { pxPerBoost, max, maxEvent } = GALLERY.wheel
      energy = Math.min(max, energy + Math.min(Math.abs(raw), maxEvent) / pxPerBoost)
      // Scrolling also ends a hold (the opening, after a step): the idle travel eases in beneath it.
      holdUntil = Math.min(holdUntil, now)
      kick()
    }
    window.addEventListener('wheel', onWheel, { passive: false })

    // ------------------------------------------------------------------
    // Touch: a horizontal swipe moves the gallery; vertical gestures do nothing here.
    // ------------------------------------------------------------------
    const drag = { id: -1, x: 0, y: 0, start: 0, anchor: 0, active: false, lastX: 0, lastT: 0, v: 0, endedAt: -Infinity }
    const endTouch = () => {
      st.touch = false
      resume()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || !e.isPrimary || st.busy) return
      drag.id = e.pointerId
      drag.x = drag.lastX = e.clientX
      drag.y = e.clientY
      drag.lastT = performance.now()
      drag.v = 0
      drag.active = false
      drag.start = pos
      drag.anchor = heading()
      // A hand on the gallery holds it.
      st.touch = true
      kick()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      const { slop, widthPerItem } = GALLERY.swipe
      if (!drag.active) {
        if (Math.abs(dx) > slop && Math.abs(dx) > Math.abs(dy) * 1.2) {
          drag.active = true
          try {
            stage.setPointerCapture(e.pointerId)
          } catch {
            /* the pointer is already gone */
          }
          if (!reduced) {
            drag.start = pos
            mode = 'drag'
            vel = 0
            speed = 0
            rampT = 0
            energy = 0
            extra = 0
          }
        } else if (Math.abs(dy) > slop) {
          drag.id = -1
          endTouch()
        }
        return
      }
      if (reduced) return
      const now = performance.now()
      const per = scene.W * widthPerItem
      pos = clamp(drag.start - dx / per, drag.anchor - 1.35, drag.anchor + 1.35)
      const dtm = Math.max(1, now - drag.lastT)
      drag.v = 0.7 * drag.v + 0.3 * ((-(e.clientX - drag.lastX) / per / dtm) * 1000)
      drag.lastX = e.clientX
      drag.lastT = now
      kick()
    }
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return
      drag.id = -1
      if (drag.active) {
        drag.endedAt = performance.now()
        const dx = e.clientX - drag.x
        if (reduced) {
          if (Math.abs(dx) > 40) {
            announcePending = true
            st.touch = false
            step(dx < 0 ? 1 : -1)
          }
        } else {
          const flick = e.type === 'pointercancel' ? 0 : clamp(drag.v * GALLERY.swipe.flick, -0.6, 0.6)
          const T = clamp(Math.round(pos + flick), drag.anchor - 1, drag.anchor + 1)
          // The flick carries into the settle only towards the target, and never so fast
          // that the spring passes it (no swing past the project and back).
          const x = pos - T
          const most = GALLERY.settle.omega * Math.abs(x)
          vel = drag.v * x < 0 ? clamp(drag.v, -most, most) : 0
          target = T
          mode = 'step'
        }
      }
      endTouch()
    }
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerEnd)
    stage.addEventListener('pointercancel', onPointerEnd)

    // ------------------------------------------------------------------
    // Page visibility, resizing, fonts
    // ------------------------------------------------------------------
    const onVisibility = () => {
      st.visible = document.visibilityState === 'visible'
      if (!st.visible) save()
      else kick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const onPageHide = () => save()
    window.addEventListener('pagehide', onPageHide)
    let resizeFrame = 0
    const onResize = () => {
      if (resizeFrame) return
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0
        measure()
        layout()
        // Sharper files when the objects grew well beyond what their `sizes` asked for.
        const want = Array.from(widths, (w) => Math.ceil(w * GALLERY.hover.scale))
        const have = objects.map((o) => parseFloat(o.querySelector('.gobj__art img')?.getAttribute('sizes') ?? '0'))
        if (want.some((w, i) => w > have[i] * 1.15)) setSizes(want.map((w) => `${w}px`))
      })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    const title = root.closest('.home')?.querySelector('.home-id__block')
    if (title) ro.observe(title)
    window.addEventListener('resize', onResize)
    let alive = true
    void document.fonts?.ready.then(() => {
      if (!alive) return
      // The captions' sizes and the title's box (the objects' room) follow the loaded fonts.
      measure()
      layout()
    })

    api.current = {
      step: (dir) => {
        announcePending = true
        step(dir)
      },
      // A project is opening: everything stops where it is; the others dim.
      freeze: (i) => {
        st.busy = true
        root.dataset.leaving = ''
        items[i].dataset.selected = ''
        save()
      },
      // The opening was cancelled (Back, another navigation): carry on.
      resume: (i) => {
        if (!root.isConnected) return
        st.busy = false
        delete root.dataset.leaving
        delete items[i].dataset.selected
        delete items[i].dataset.pressed
        kick()
      },
      dragged: () => performance.now() - drag.endedAt < 400,
      appear,
      kick: () => {
        if (!pausedRef.current) resume()
        else kick()
      },
    }

    if (import.meta.env.DEV) {
      window.__homeGallery = {
        pos: () => pos,
        mode: () => mode,
        speed: () => speed,
        boost: () => ({ energy, boost: extra, run: smooth(rampT) }),
        state: () => ({ hover: st.hover, focus: st.focus, kbd: st.kbd, press: st.press, touch: st.touch, busy: st.busy, paused: pausedRef.current, featured, holdIn: holdUntil - performance.now(), frame: raf !== 0, wake: wake !== 0 }),
        placements: () => P.map((p) => ({ ...p })),
        scene: () => ({ ...scene }),
        seek: (p, run) => {
          pos = p
          target = Math.round(p)
          vel = 0
          mode = 'run'
          rampT = run ? 1 : 0
          holdUntil = run ? 0 : Infinity
          layout()
          kick()
        },
        step: (dir) => step(dir),
        timeScale: window.__homeGallery?.timeScale ?? 1,
      }
    }

    if (!reduced) kick()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      cancelAnimationFrame(appearRaf)
      window.clearTimeout(wake)
      window.clearTimeout(fade)
      if (swapping) pos = target
      fadeAnim?.cancel()
      save()
      api.current = null
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pointerup', endPress, true)
      window.removeEventListener('pointercancel', endPress, true)
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', onPressDown, true)
      root.removeEventListener('click', onClickCapture, true)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      root.removeEventListener('keydown', onKeyDown)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerEnd)
      stage.removeEventListener('pointercancel', onPointerEnd)
      if (import.meta.env.DEV) delete window.__homeGallery
    }
    // A new history entry for / (the home link on the homepage) starts over with the opening.
  }, [locationKey, navigationType, reduced, navigate, togglePause])

  // Keyboard activation (Enter) and assistive technology: the link opens its own project.
  // Pointer clicks are handled when the press starts (the capture listener above).
  const onOpen = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    if (api.current?.dragged()) return
    const item = CAROUSEL_ITEMS[i]
    const source = objectRefs.current[i]?.querySelector<HTMLElement>('[data-cover-source]') ?? null
    const result = openProject({ path: item.path, source, navigate, onCancel: () => api.current?.resume(i) })
    if (result === 'cover') api.current?.freeze(i)
  }

  return (
    <section ref={rootRef} className="gallery" aria-label="Projects and About" data-touch={touch || undefined} data-reduced={reduced || undefined}>
      {!reduced && (
        <button type="button" className="gallery__pause" data-shown={paused || undefined} onClick={togglePause}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            {paused ? <path d="M5 3.5v9l7-4.5z" fill="currentColor" /> : <path d="M4.5 3.5h2.4v9H4.5zM9.1 3.5h2.4v9H9.1z" fill="currentColor" />}
          </svg>
          {paused ? 'Resume motion' : 'Pause motion'}
        </button>
      )}
      <div ref={stageRef} className="gallery__stage">
        <ul className="gallery__list" role="list">
          {CAROUSEL_ITEMS.map((item, i) => (
            <li
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className="gobj"
              data-index={i}
              data-kind={item.kind}
              style={{ ...accentVars(item.id), '--rim-rgb': rimRgb(item.id) } as CSSProperties}
            >
              <a
                ref={(el) => {
                  linkRefs.current[i] = el
                }}
                href={item.path}
                className="gobj__link"
                draggable={false}
                aria-labelledby={`gobj-name-${item.id}`}
                aria-describedby={item.subtitle ? `gobj-sub-${item.id}` : undefined}
                onClick={(e) => onOpen(e, i)}
                onFocus={() => warmProject(item.path)}
              >
                <GalleryObject
                  item={item}
                  index={i}
                  onReady={markReady}
                  sizes={sizes[i]}
                  priority={i <= 3 || i === N - 1}
                  objectRef={(el) => {
                    objectRefs.current[i] = el
                  }}
                />
                <span
                  ref={(el) => {
                    labelRefs.current[i] = el
                  }}
                  className="gobj__label"
                >
                  <span className="gobj__caption" data-hit="">
                    <span className="gobj__name" id={`gobj-name-${item.id}`}>
                      {item.name}
                    </span>
                    {item.subtitle && (
                      <span className="gobj__sub" id={`gobj-sub-${item.id}`}>
                        {item.subtitle}
                      </span>
                    )}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div ref={barRef} className="gallery__bar">
        <div className="gallery__nav">
          <button type="button" className="gallery__arrow" aria-label="Previous project" onClick={() => api.current?.step(-1)}>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="gallery__arrow" aria-label="Next project" onClick={() => api.current?.step(1)}>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </section>
  )
}

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { GALLERY } from '../../config/carousel'
import { ACCENTS, accentVars, type AccentId } from '../../content/accents'
import { GALLERY_ITEMS } from '../../content/carousel'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'
import { notePaused, notePosition, persistPosition, recallPaused, recallPosition } from './carouselMemory'
import { GalleryObject } from './GalleryObject'
import { buildScene, keepReport, mod, newPlacement, OPENING_POS, place, smoothstep, type Box, type Placement, type Scene } from './galleryModel'

/** A label line's box in stage px and its opacity. */
interface LineBox extends Box {
  op: number
}
/** A label's two lines (debug and checks). */
interface LabelBox {
  title: LineBox
  sub: LineBox
}

/** Debug handle for browser checks in development. */
interface GalleryDebug {
  pos: () => number
  mode: () => string
  /** Current speed (items per second; positive = leftward travel). */
  speed: () => number
  /** Current wheel boost (extra speed in multiples of the idle speed) and run share (0 to 1). */
  boost: () => { energy: number; boost: number; run: number; rush: number }
  /** Hover slow-down factor (motion-plan P1a) and the travel's direction share (1 = leftward). */
  hoverK: () => number
  left: () => number
  state: () => { hover: number; focus: number; kbd: boolean; press: number; touch: boolean; busy: boolean; paused: boolean; featured: number; holdIn: number; frame: boolean; wake: boolean }
  placements: () => Placement[]
  labels: () => LabelBox[]
  /** The least room any object leaves to the identity block and the portrait round the loop (px), with where. */
  keep: (hover?: boolean) => { least: number; i: number; pos: number }
  scene: () => Omit<Scene, 'slotX' | 'widths' | 'heights' | 'boost'> & { widths: number[]; heights: number[] }
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

const N = GALLERY_ITEMS.length
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
  const scene = buildScene(window.innerWidth, window.innerHeight)
  return Array.from(scene.widths, (w) => `${Math.ceil(w * GALLERY.hover.scale)}px`)
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

/** Per-frame style writes, skipped when the value has not changed. */
class Writer {
  private last = new Map<CSSStyleDeclaration, Map<string, string>>()
  set(style: CSSStyleDeclaration, prop: string, value: string) {
    let m = this.last.get(style)
    if (!m) {
      m = new Map()
      this.last.set(style, m)
    }
    if (m.get(prop) === value) return
    m.set(prop, value)
    style.setProperty(prop, value)
  }
  reset() {
    this.last.clear()
  }
}

/** Each object's elements that the frame loop writes. */
interface Parts {
  item: HTMLLIElement
  unit: HTMLSpanElement
  object: HTMLSpanElement
  label: HTMLSpanElement
  name: HTMLElement
  sub: HTMLElement | null
  glow: HTMLElement | null
  dim: HTMLElement | null
  spill: HTMLElement | null
  shadow: HTMLElement | null
  reflect: HTMLElement | null
}

/**
 * The homepage depth gallery: the six project objects standing on a curved
 * rail in the architectural room, each one an object-label sculpture (its
 * transparent PNG with its own title and subtitle beneath it, in the same
 * moving unit). Every property of an object (its place, rise, scale, turn,
 * light, label size and opacity, stacking order) comes from its one depth
 * value (galleryModel.ts), so the active object is frontal, larger, lower,
 * sharper and brighter, and the others turn away, rise, shrink, dim and
 * quieten their labels together.
 *
 * Motion. The objects travel continuously to the left: each approaches from
 * the right, passes through the active slot and recedes to the left (one
 * continuous position, no snapping). Wheel and trackpad input, in any
 * direction, smoothly speeds up that same leftward travel in proportion to
 * the scrolling, and eases back within about 800 ms of the last input; the
 * page itself never scrolls, and other pages never see the listener. While
 * boosted, objects turn a little further and the far ones dim slightly
 * (motion-plan P1b). The previous and next chevrons, the arrow keys (focus
 * in the gallery) and horizontal swipes bring the neighbouring project to
 * the front with a critically damped settle; the travel resumes shortly
 * after.
 *
 * Hover never stops the travel: it eases to 0.7 of its idle speed (P1a)
 * while the object under the pointer comes slightly forward with a stronger
 * glow. A press picks its object at once: the click that completes it opens
 * that project, whatever has moved under the pointer meanwhile, and the
 * travel holds while the button is down. Keyboard focus in the gallery
 * holds it too, so a focused object stays put to be activated; an object
 * that is not clearly shown comes to the front. A "Pause motion" control,
 * hidden until it receives keyboard focus (the gallery's first stop),
 * stops the travel for the session; Space on an object does the same.
 *
 * Reduced motion (the operating system's setting): the same arrangement,
 * still; steps (chevrons, keys, swipe, one per wheel gesture) change with a
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
  const liveRef = useRef<HTMLParagraphElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const unitRefs = useRef<Array<HTMLSpanElement | null>>([])
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
   * light, shadow and reflection) and its label stay hidden; then they fade
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
    const units = unitRefs.current.slice(0, N) as HTMLSpanElement[]
    const objects = objectRefs.current.slice(0, N) as HTMLSpanElement[]
    const labels = labelRefs.current.slice(0, N) as HTMLSpanElement[]
    const links = linkRefs.current.slice(0, N) as HTMLAnchorElement[]
    if (!root || !stage || [items, units, objects, labels, links].some((list) => list.length < N || list.some((x) => !x))) return
    const parts: Parts[] = items.map((item, i) => ({
      item,
      unit: units[i],
      object: objects[i],
      label: labels[i],
      name: labels[i].querySelector<HTMLElement>('.gobj__name')!,
      sub: labels[i].querySelector<HTMLElement>('.gobj__sub'),
      glow: objects[i].querySelector<HTMLElement>('.gobj__glow'),
      dim: objects[i].querySelector<HTMLElement>('.gobj__dim'),
      spill: objects[i].querySelector<HTMLElement>('.gobj__spill'),
      shadow: objects[i].querySelector<HTMLElement>('.gobj__shadow'),
      reflect: objects[i].querySelector<HTMLElement>('.gobj__reflect'),
    }))

    // ------------------------------------------------------------------
    // Measurement and layout
    // ------------------------------------------------------------------
    let scene: Scene = buildScene(1440, 900)
    /** Each label's size at full scale (px): the title's width and height, the subtitle's. */
    const lab = Array.from({ length: N }, () => ({ tw: 0, th: 0, sw: 0, sh: 0, gap: 0 }))
    const P: Placement[] = Array.from({ length: N }, newPlacement)
    const line = (): LineBox => ({ l: 0, t: 0, r: 0, b: 0, op: 0 })
    const boxes: LabelBox[] = Array.from({ length: N }, () => ({ title: line(), sub: line() }))
    const w = new Writer()
    const written = { tier: new Array<number>(N).fill(-1), off: new Array<number>(N).fill(-1) }
    let featured = -1
    const dpr = window.devicePixelRatio || 1
    const px = (v: number) => (Math.round(v * dpr * 4) / (dpr * 4)).toFixed(2)
    const f3 = (v: number) => clamp(v, 0, 1).toFixed(3)

    /** The width of a text's lines as set (px): the widest line, not its box. */
    const inked = (el: HTMLElement) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      let l = Infinity
      let r = -Infinity
      for (const rect of range.getClientRects()) {
        l = Math.min(l, rect.left)
        r = Math.max(r, rect.right)
      }
      return r > l ? r - l : el.offsetWidth
    }

    /** The labels' widths (from their objects' size in front) and their lines' sizes at full scale; returns the tallest (px). */
    const measureLabels = () => {
      const { share, min, max } = GALLERY.label.width
      let tallest = 0
      parts.forEach((pt, i) => {
        const lw = Math.min(scene.W - 24, clamp((share * scene.widths[i]) / scene.boost[i], min, max))
        pt.item.style.setProperty('--lw', `${lw.toFixed(1)}px`)
        // Measured at full scale (the frame loop writes the transform again).
        pt.label.style.transform = 'none'
        lab[i].tw = inked(pt.name)
        lab[i].th = pt.name.offsetHeight
        lab[i].sw = pt.sub ? inked(pt.sub) : 0
        lab[i].sh = pt.sub?.offsetHeight ?? 0
        lab[i].gap = pt.sub ? parseFloat(getComputedStyle(pt.sub).marginTop) || 0 : 0
        tallest = Math.max(tallest, lab[i].th + lab[i].sh + lab[i].gap)
      })
      return tallest
    }

    /**
     * What the objects keep clear of, in stage px: the identity block's lines
     * (by their text) and the portrait anchor's box.
     */
    const keepOut = (): Box[] => {
      const home = root.closest('.home')
      if (!home) return []
      const s = stage.getBoundingClientRect()
      const box = (r: DOMRect): Box => ({ l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top })
      const text = (el: Element) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return range.getBoundingClientRect()
      }
      const out: Box[] = []
      for (const el of home.querySelectorAll('.home-id__name, .home-id__word, .home-id__desc')) out.push(box(text(el)))
      // The portrait's image, down to where its faded lower edge has mostly gone (home.css: it fades over its lowest 20%).
      const portrait = home.querySelector('.home-portrait__art img')
      if (portrait) {
        const b = box(portrait.getBoundingClientRect())
        out.push({ ...b, b: b.b - (b.b - b.t) * 0.12 })
      }
      return out.filter((b) => b.r > b.l && b.b > b.t)
    }

    const measure = () => {
      // Label widths depend on the objects' sizes: a first scene, then the labels, then the scene that fits them.
      scene = buildScene(stage.clientWidth, stage.clientHeight)
      const label = measureLabels()
      scene = buildScene(stage.clientWidth, stage.clientHeight, { keep: keepOut(), label })
      measureLabels()
      root.style.setProperty('--u', scene.u.toFixed(4))
      root.dataset.cls = scene.cls
      for (let i = 0; i < N; i++) {
        items[i].style.setProperty('--w', `${scene.widths[i].toFixed(2)}px`)
        items[i].style.setProperty('--h', `${scene.heights[i].toFixed(2)}px`)
      }
      w.reset()
    }

    /** How far each object has appeared (0 until its image has decoded, then a short fade to 1). */
    const appeared = new Float64Array(N)
    /** Hover and keyboard focus light per object, eased (0 to 1). */
    const hov = new Float64Array(N)
    const hovTarget = (i: number) => (i === st.active || i === st.press ? 1 : 0)
    const easeHover = (dt: number) => {
      let moving = false
      const { hoverInMs, hoverOutMs } = GALLERY.light
      for (let i = 0; i < N; i++) {
        const t = hovTarget(i)
        if (reduced) hov[i] = t
        else if (hov[i] !== t) {
          const tau = (t > hov[i] ? hoverInMs : hoverOutMs) / 3
          hov[i] += (t - hov[i]) * (1 - Math.exp((-dt * 1000) / tau))
          if (Math.abs(hov[i] - t) < 0.002) hov[i] = t
        }
        if (hov[i] !== t) moving = true
      }
      return moving
    }

    const layout = () => {
      place(pos, scene, P, left, rush)
      const { u, W } = scene
      const tNow = performance.now()
      for (let i = 0; i < N; i++) {
        const t = shownAt.current[i]
        const x = Number.isNaN(t) ? 0 : t === 0 || reduced ? 1 : clamp((tNow - t) / GALLERY.appear.ms, 0, 1)
        appeared[i] = x * (2 - x)
      }
      const persp = (GALLERY.perspective * u).toFixed(0)
      const { gap, follow, visible, yieldPx } = GALLERY.label
      let nearest = 0
      for (let i = 1; i < N; i++) if (P[i].a < P[nearest].a) nearest = i

      // Labels first: each line's box, then collision control (the farther label yields).
      for (let i = 0; i < N; i++) {
        const p = P[i]
        const h = hov[i]
        const L = lab[i]
        const lx = p.x + (GALLERY.center[GALLERY_ITEMS[i].kind] - 0.5) * scene.widths[i] * p.k * Math.cos(p.turn)
        const ly = p.base + gap * p.s
        const { title, sub } = boxes[i]
        title.l = lx - (L.tw * p.ls) / 2
        title.r = lx + (L.tw * p.ls) / 2
        title.t = ly
        title.b = ly + L.th * p.ls
        sub.l = lx - (L.sw * p.ls) / 2
        sub.r = lx + (L.sw * p.ls) / 2
        sub.t = title.b + L.gap * p.ls
        sub.b = sub.t + L.sh * p.ls
        // A label mostly outside the window fades out (the object itself may be cut by the edge).
        const tw = title.r - title.l
        const inside = tw > 0 ? (Math.min(title.r, W) - Math.max(title.l, 0)) / tw : 1
        const shown = p.vis * appeared[i] * smoothstep(visible[0], visible[1], inside)
        title.op = (p.lt + (1 - p.lt) * h * 0.7) * shown
        sub.op = L.sw > 0 ? (p.lsub + (1 - p.lsub) * h * 0.6) * shown : 0
      }
      // Nearest first: each line yields to every shown line of a nearer label it comes within
      // yieldPx of (the subtitle first; never a subtitle without its title).
      const byDepth = Array.from({ length: N }, (_, i) => i).sort((x, y) => P[x].a - P[y].a)
      const room = (a: Box, b: Box) => clamp(Math.max(b.l - a.r, a.l - b.r, b.t - a.b, a.t - b.b) / yieldPx, 0, 1)
      for (let j = 1; j < N; j++) {
        const far = boxes[byDepth[j]]
        let yt = 1
        let ys = 1
        for (let k = 0; k < j; k++) {
          const near = boxes[byDepth[k]]
          for (const n of [near.title, near.sub]) {
            if (n.op < 0.02) continue
            yt = Math.min(yt, room(far.title, n))
            if (far.sub.op > 0) ys = Math.min(ys, room(far.sub, n))
          }
        }
        far.title.op *= yt
        far.sub.op *= Math.min(ys, yt)
      }

      for (let i = 0; i < N; i++) {
        const p = P[i]
        const pt = parts[i]
        const h = hov[i]
        const show = appeared[i]
        // The moving unit: the object's base centre on the floor; the object and its label inside it.
        w.set(pt.unit.style, 'transform', `translate3d(${px(p.x)}px, ${px(p.base)}px, 0)`)
        w.set(pt.unit.style, 'z-index', String(p.z))
        // Scale and turn about the base (projectTransition.ts reads this perspective() rotateY() pair).
        w.set(pt.object.style, 'transform', `scale(${p.k.toFixed(4)}) perspective(${persp}px) rotateY(${p.turn.toFixed(4)}rad)`)
        w.set(pt.object.style, 'opacity', f3(p.op * show))
        // Light by depth; hover and keyboard focus raise it.
        if (pt.glow) w.set(pt.glow.style, 'opacity', f3(p.glow + (1 - p.glow) * h))
        if (pt.dim) w.set(pt.dim.style, 'opacity', f3(p.dim * (1 - 0.6 * h)))
        if (pt.spill) w.set(pt.spill.style, 'opacity', f3(p.spill * 0.72 + (1 - p.spill * 0.72) * h))
        if (pt.shadow) w.set(pt.shadow.style, 'opacity', f3(p.shadow * (1 - 0.33 * h)))
        if (pt.reflect) w.set(pt.reflect.style, 'opacity', f3(p.reflect))
        // The label: beneath the object's visual centre, scaled with its depth, upright (a slight share of the turn).
        const { title, sub } = boxes[i]
        const dx = (title.l + title.r) / 2 - p.x
        const dy = title.t - p.base
        w.set(pt.label.style, 'transform', `translate3d(${px(dx)}px, ${px(dy)}px, 0) scale(${p.ls.toFixed(4)}) perspective(${persp}px) rotateY(${(p.turn * follow).toFixed(4)}rad)`)
        w.set(pt.name.style, 'opacity', f3(title.op))
        if (pt.sub) w.set(pt.sub.style, 'opacity', f3(sub.op))
        const tier = p.a < 0.5 ? 0 : p.a < 1.5 ? 1 : 2
        if (tier !== written.tier[i]) {
          items[i].dataset.tier = String(tier)
          written.tier[i] = tier
        }
        // Pointer targets: only objects (and labels) that are clearly shown.
        const inStage = Math.min(p.x + p.hw, W) - Math.max(p.x - p.hw, 0)
        const off = (p.op * show < 0.35 || inStage < p.hw * 0.9 ? 1 : 0) + (title.op < 0.45 ? 2 : 0)
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
    /** The wheel boost's share of its cap (motion-plan P1b: a little more turn, far objects a little dimmer). */
    let rush = 0
    /** Motion-plan P1a: the idle travel's factor while the pointer rests on an object (eases to 0.7, never stops). */
    let hoverK = 1
    /** The share of leftward travel in the current movement (the turn leads the travel in its direction). */
    let left = 1
    let lastPos = pos
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
      const lighting = easeHover(dt)
      if (mode === 'drag') {
        trackDirection(dt)
        layout()
        return
      }
      let again = true
      if (mode === 'step') {
        // Critically damped spring towards the target (exact step): no bounce, no overshoot.
        const om = GALLERY.settle.omega
        const x = pos - target
        const e = Math.exp(-om * dt)
        const k = vel + om * x
        pos = target + (x + k * dt) * e
        vel = (vel - om * k * dt) * e
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
        again = lighting
      } else {
        // Continuous leftward travel: the idle speed (a gentle wave, slower near
        // each active position, never stopped; eased to 0.7 while the pointer
        // rests on an object) eased in and out, plus the wheel's extra speed.
        const hold = holding()
        const still = hold || now < holdUntil
        const { rate, wave, rampMs, stopMs } = GALLERY.drift
        if (still) rampT = Math.max(0, rampT - (dt * 1000) / stopMs)
        else rampT = Math.min(1, rampT + (dt * 1000) / rampMs)
        const { decayMs, smoothMs, max } = GALLERY.wheel
        energy *= Math.exp((-dt * 1000) / decayMs)
        extra += (energy - extra) * (1 - Math.exp((-dt * 1000) / smoothMs))
        if (hold) {
          energy = 0
          extra = Math.min(extra, rampT)
        }
        const slow = GALLERY.hover.slow
        const slowTo = st.hover >= 0 ? slow.factor : 1
        const tau = (slowTo < hoverK ? slow.inMs : slow.outMs) / 3
        hoverK += (slowTo - hoverK) * (1 - Math.exp((-dt * 1000) / tau))
        const f = pos - Math.floor(pos)
        const shape = (1 - wave * Math.cos(2 * Math.PI * f)) / Math.sqrt(1 - wave * wave)
        speed = rate * Math.min(shape * smooth(rampT) * hoverK + extra, 1 + max)
        rush = clamp(extra / max, 0, 1)
        pos += speed * dt
        // At rest and meant to stay so: no frames until something wakes the travel.
        if (still && rampT === 0 && extra < 1e-4) {
          speed = 0
          extra = 0
          energy = 0
          rush = 0
          again = lighting
        }
      }
      if (pos > N * 1000 || pos < -N * 1000) {
        pos = mod(pos, N)
        lastPos = pos
      }
      trackDirection(dt)
      layout()
      // Hover follows what is under a still pointer (mouse and pen).
      if (pointer.inside && now >= pollAt && !st.busy) {
        pollAt = now + GALLERY.hover.pollMs
        setHover(indexOf(document.elementFromPoint(pointer.x, pointer.y)))
      }
      if (again) raf = requestAnimationFrame(frame)
      else if (!reduced && !holding() && mode === 'run') wakeAt(holdUntil)
    }

    /** The direction of travel, eased over about 100 ms (a change of direction mid-step turns smoothly). */
    function trackDirection(dt: number) {
      const dp = pos - lastPos
      lastPos = pos
      if (Math.abs(dp) < 1e-7) return
      const to = dp > 0 ? 1 : 0
      left += (to - left) * (1 - Math.exp((-dt * 1000) / 100))
      if (Math.abs(left - to) < 0.001) left = to
    }

    /** After a hold ends (focus leaves, the press ends, the pause is lifted): the travel ramps in again. */
    const resume = () => {
      if (holding()) return
      kick()
    }

    /** Announces the active project after a chevron step (keyboard steps move focus, which announces itself). */
    let announcePending = false
    function announce() {
      if (!announcePending || !liveRef.current) return
      announcePending = false
      const item = GALLERY_ITEMS[mod(Math.round(pos), N)]
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
      fadeAnim = list?.animate([{ opacity: from }, { opacity: 0 }], { duration: outMs * from, easing: 'cubic-bezier(0.33, 0, 0.25, 1)', fill: 'forwards' }) ?? null
      swapping = true
      fade = window.setTimeout(() => {
        pos = T
        lastPos = T
        target = T
        swapping = false
        layout()
        save()
        announce()
        fadeAnim?.cancel()
        fadeAnim = list?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inMs, easing: 'cubic-bezier(0.33, 0, 0.25, 1)' }) ?? null
      }, outMs * from)
    }

    /** Settles on position T with the spring, carrying the current speed into it. */
    const settleTo = (T: number) => {
      if (mode !== 'step') vel = speed
      target = T
      mode = 'step'
      energy = 0
      extra = 0
      rush = 0
      kick()
    }

    /** The resting position the gallery is at or heading to (its active project). */
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
     * active object this is one ordinary step; from a neighbour it may
     * mean no movement (the active one is beside it) or a longer one.
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

    /** Brings item i to the front (keyboard focus on an object that is not the active one). */
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
    // Hover (mouse and pen): only an object's silhouette or its shown label
    // counts. It never stops the travel; the object glows and lifts a little.
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
      lightChanged()
    }
    /** Hover or press light changed: ease it in the frame loop (at once with reduced motion). */
    function lightChanged() {
      if (reduced) {
        easeHover(0)
        layout()
      } else kick()
    }
    function setHover(i: number) {
      if (st.hover === i) return
      st.hover = i
      if (i >= 0) warmProject(GALLERY_ITEMS[i].path)
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
        lightChanged()
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
      lightChanged()
      resume()
    }
    root.addEventListener('pointerdown', onPressDown, true)
    window.addEventListener('pointerup', endPress, true)
    window.addEventListener('pointercancel', endPress, true)

    const openItem = (i: number) => {
      const item = GALLERY_ITEMS[i]
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
      // Controls (the chevrons, the pause control) keep their own clicks.
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
    // its label, with the focus ring, shows in full). Arrows step from the
    // focused object (stepFrom); Space on an object pauses or resumes the travel.
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
        // From the focused object (not the active one): focus never skips an object.
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
    // The listener lives only while the homepage is mounted.
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
            rush = 0
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
        const want = Array.from(scene.widths, (x) => Math.ceil(x * GALLERY.hover.scale))
        const have = objects.map((o) => parseFloat(o.querySelector('.gobj__art img')?.getAttribute('sizes') ?? '0'))
        if (want.some((x, i) => x > have[i] * 1.15)) setSizes(want.map((x) => `${x}px`))
      })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    const identity = root.closest('.home')?.querySelector('.home-id')
    if (identity) ro.observe(identity)
    window.addEventListener('resize', onResize)
    let alive = true
    void document.fonts?.ready.then(() => {
      if (!alive) return
      // The labels' sizes and the identity block's box (the objects' room) follow the loaded fonts.
      measure()
      layout()
    })

    api.current = {
      step: (dir) => {
        announcePending = true
        step(dir)
      },
      // A project is opening: everything stops where it is.
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
        boost: () => ({ energy, boost: extra, run: smooth(rampT), rush }),
        hoverK: () => hoverK,
        left: () => left,
        state: () => ({ hover: st.hover, focus: st.focus, kbd: st.kbd, press: st.press, touch: st.touch, busy: st.busy, paused: pausedRef.current, featured, holdIn: holdUntil - performance.now(), frame: raf !== 0, wake: wake !== 0 }),
        placements: () => P.map((p) => ({ ...p })),
        labels: () => boxes.map((b) => ({ title: { ...b.title }, sub: { ...b.sub } })),
        keep: (hover = true) => keepReport(scene, hover),
        scene: () => {
          const { slotX: _slots, widths, heights, boost: _boost, ...rest } = scene
          void _slots
          void _boost
          return { ...rest, widths: Array.from(widths), heights: Array.from(heights) }
        },
        seek: (p, run) => {
          pos = p
          lastPos = p
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
    const item = GALLERY_ITEMS[i]
    const source = objectRefs.current[i]?.querySelector<HTMLElement>('[data-cover-source]') ?? null
    const result = openProject({ path: item.path, source, navigate, onCancel: () => api.current?.resume(i) })
    if (result === 'cover') api.current?.freeze(i)
  }

  return (
    <section ref={rootRef} className="gallery" aria-label="Projects" data-touch={touch || undefined} data-reduced={reduced || undefined}>
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
          {GALLERY_ITEMS.map((item, i) => (
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
                <span
                  ref={(el) => {
                    unitRefs.current[i] = el
                  }}
                  className="gobj__unit"
                >
                  <GalleryObject
                    item={item}
                    index={i}
                    onReady={markReady}
                    sizes={sizes[i]}
                    priority={i <= 2 || i === N - 1}
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
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="gallery__nav">
        <button type="button" className="gallery__arrow gallery__arrow--prev" aria-label="Previous project" onClick={() => api.current?.step(-1)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="gallery__arrow gallery__arrow--next" aria-label="Next project" onClick={() => api.current?.step(1)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </section>
  )
}

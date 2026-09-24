import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { GALLERY } from '../../config/carousel'
import { ACCENTS, accentVars, type AccentId } from '../../content/accents'
import { GALLERY_ITEMS } from '../../content/carousel'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'
import { notePosition, persistPosition, recallPosition } from './carouselMemory'
import { GalleryObject } from './GalleryObject'
import {
  buildScene,
  mod,
  newPlacement,
  OPENING_POS,
  place,
  restSpacing,
  silhouette,
  silhouetteOrigin,
  smoothstep,
  type Box,
  type LabelSize,
  type Placement,
  type Scene,
  type SceneFrame,
} from './galleryModel'

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
  /** The position the carousel rests on or is heading to. */
  target: () => number
  placements: () => Placement[]
  /** Each label's lines as laid out (stage px) with their opacity. */
  labels: () => LabelBox[]
  /** Each object's silhouette as drawn (stage px). */
  silhouettes: () => Box[]
  scene: () => Omit<Scene, 'slotX' | 'sw' | 'sh' | 'bw' | 'bh' | 'p'> & { sw: number[]; sh: number[] }
  /** Moves the carousel to a position at once (no motion). */
  seek: (pos: number) => void
  step: (dir: 1 | -1) => void
}
declare global {
  interface Window {
    __homeGallery?: GalleryDebug
  }
}

const N = GALLERY_ITEMS.length
/** Open menus and dialogs keep their own wheel scrolling. */
const OWN_SCROLL = '.work-shelf[data-open], .site-menu[data-open], [role="dialog"], [aria-modal="true"], dialog'

type Mode = 'rest' | 'tween' | 'drag' | 'wheel'

/** A pale rim tint per accent (the tight silhouette edge): the accent mixed half way to lavender white. */
function rimRgb(id: AccentId) {
  const [r, g, b] = ACCENTS[id].rgb.split(' ').map(Number)
  const mix = (v: number, w: number) => Math.round(v * 0.5 + w * 0.5)
  return `${mix(r, 244)} ${mix(g, 240)} ${mix(b, 255)}`
}

/** The images' `sizes`: each object's largest rendered width at this window size (selected and hovered). */
function sizesFor(scene: Scene) {
  return Array.from(scene.bw, (w) => `${Math.ceil(w * GALLERY.hover.scale)}px`)
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

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
}

/** The carousel's scene for the current window (before the labels are measured). */
function initialScene() {
  return buildScene(document.documentElement.clientWidth || window.innerWidth, window.innerHeight)
}

/**
 * The homepage project carousel: About Me and the six projects on one
 * shallow, symmetrical curve over the film, each one an object-label group
 * (its transparent PNG with its title and description beneath it, in the
 * same moving unit). Every property of an object (its place, scale, bottom
 * edge, turn, light, label size and opacity, stacking order) comes from its
 * one slot offset (galleryModel.ts), so the selected object is centred,
 * largest, slightly lower and fully lit, and the others step back
 * symmetrically.
 *
 * It sits in the page's normal flow below the introduction: the page
 * scrolls normally, and vertical wheel, trackpad and touch gestures always
 * scroll the page. Objects float gently in place; their selected position changes only on interaction.
 *
 * Moving it:
 * - the previous and next arrows (and the arrow keys on an object or an
 *   arrow) advance exactly one object in about 500ms, easing out to rest
 *   (no bounce, no overshoot; a further click continues from the current
 *   speed);
 * - a horizontal drag (mouse, pen or touch; `touch-action: pan-y` keeps
 *   vertical scrolling native) and a horizontal trackpad gesture (deltaX)
 *   move it directly, then a short ease settles on the nearest object;
 * - keyboard focus on an object brings it to the centre.
 *
 * A press picks its object at once: the click that completes it opens that
 * object's page (the shared-element move into its cover slot), whatever has
 * moved under the pointer meanwhile, and a drag never opens anything. Hover
 * (a fine pointer) enlarges an object by 2.5% about its bottom edge and
 * brightens its title and glow.
 *
 * Reduced motion (the operating system's setting): the same arrangement;
 * steps (arrows, keys, a swipe, one per trackpad gesture) change with a
 * short cross-fade.
 *
 * Browser Back restores the selection (carouselMemory.ts); every listener
 * is removed when the homepage unmounts.
 */
export function DepthGallery() {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { key: locationKey } = useLocation()
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const unitRefs = useRef<Array<HTMLSpanElement | null>>([])
  const objectRefs = useRef<Array<HTMLSpanElement | null>>([])
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  /** The position survives effect re-runs within one history entry (the motion setting changed). */
  const kept = useRef<{ key: string; pos: number } | null>(null)
  const api = useRef<{ step: (dir: 1 | -1) => void; freeze: (i: number) => void; resume: (i: number) => void; dragged: () => boolean; appear: () => void } | null>(null)
  // The first scene, for the stage's height and the images' `sizes` before the effect measures.
  const [first] = useState(initialScene)
  const [sizes, setSizes] = useState(() => sizesFor(first))
  const [initialStyle] = useState<CSSProperties>(() => ({ height: `${first.stageH.toFixed(1)}px` }))
  /**
   * When each object's image was ready to show (performance.now(); 0: already
   * loaded at mount; NaN: not yet). Until then the object and its label stay
   * hidden; then they fade in together (GALLERY.appear; at once with reduced
   * motion).
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
    }))

    // ------------------------------------------------------------------
    // Measurement and layout
    // ------------------------------------------------------------------
    let scene: Scene = buildScene(1440, 900)
    const lab: LabelSize[] = Array.from({ length: N }, () => ({ tw: 0, th: 0, sw: 0, sh: 0, gap: 0 }))
    const P: Placement[] = Array.from({ length: N }, newPlacement)
    const line = (): LineBox => ({ l: 0, t: 0, r: 0, b: 0, op: 0 })
    const boxes: LabelBox[] = Array.from({ length: N }, () => ({ title: line(), sub: line() }))
    const w = new Writer()
    const written = { tier: new Array<number>(N).fill(-1), off: new Array<number>(N).fill(-1) }
    let featured = -1
    let counted = -1
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

    /** Each label's lines at full scale, and the height reserved for a label (title and GALLERY.label.lines description lines). */
    const measureLabels = () => {
      let reserve = 0
      parts.forEach((pt, i) => {
        // Measured at full scale (the frame loop writes the transform again).
        pt.label.style.transform = 'none'
        lab[i].tw = inked(pt.name)
        lab[i].th = pt.name.offsetHeight
        lab[i].sw = pt.sub ? inked(pt.sub) : 0
        lab[i].sh = pt.sub?.offsetHeight ?? 0
        const cs = pt.sub ? getComputedStyle(pt.sub) : null
        lab[i].gap = cs ? parseFloat(cs.marginTop) || 0 : 0
        const lh = cs ? parseFloat(cs.lineHeight) || 0 : 0
        reserve = Math.max(reserve, lab[i].th + lab[i].gap + Math.max(lab[i].sh, lh * GALLERY.label.lines))
      })
      return reserve
    }

    const frameOf = (): SceneFrame => {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || undefined
      const nav = navRef.current
      const navH = nav ? nav.offsetHeight + (parseFloat(getComputedStyle(nav).marginTop) || 0) : undefined
      return { header, nav: navH }
    }

    const measure = () => {
      const W = stage.clientWidth
      const H = window.innerHeight
      const base = frameOf()
      // Label widths depend on the window: a first scene, then the labels at that width, then the scene that fits them.
      scene = buildScene(W, H, base)
      root.style.setProperty('--lw', `${scene.lw.toFixed(1)}px`)
      const labelH = measureLabels()
      scene = buildScene(W, H, { ...base, labels: lab.map((l) => ({ ...l })), labelH })
      root.style.setProperty('--u', scene.u.toFixed(4))
      root.dataset.cls = scene.cls
      stage.style.height = `${scene.stageH.toFixed(1)}px`
      // The captions' soft shade (home.css): from just above the selected object's bottom edge to below the controls.
      const bandTop = scene.yb0 - 36
      stage.style.setProperty('--caption-top', `${bandTop.toFixed(1)}px`)
      stage.style.setProperty('--caption-h', `${(scene.stageH - bandTop + (base.nav ?? 58) + 64).toFixed(1)}px`)
      for (let i = 0; i < N; i++) {
        items[i].style.setProperty('--w', `${scene.bw[i].toFixed(2)}px`)
        items[i].style.setProperty('--h', `${scene.bh[i].toFixed(2)}px`)
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
      const { inMs, outMs } = GALLERY.hover
      for (let i = 0; i < N; i++) {
        const t = hovTarget(i)
        if (reduced) hov[i] = t
        else if (hov[i] !== t) {
          const tau = (t > hov[i] ? inMs : outMs) / 3
          hov[i] += (t - hov[i]) * (1 - Math.exp((-dt * 1000) / tau))
          if (Math.abs(hov[i] - t) < 0.002) hov[i] = t
        }
        if (hov[i] !== t) moving = true
      }
      return moving
    }

    const layout = () => {
      place(pos, scene, P)
      const { W } = scene
      const tNow = performance.now()
      for (let i = 0; i < N; i++) {
        const t = shownAt.current[i]
        const x = Number.isNaN(t) ? 0 : t === 0 || reduced ? 1 : clamp((tNow - t) / GALLERY.appear.ms, 0, 1)
        appeared[i] = x * (2 - x)
      }
      const persp = scene.persp.toFixed(0)
      const { gap, visible, yieldPx } = GALLERY.label

      // Labels first: each line's box, then collision control (the farther label yields).
      for (let i = 0; i < N; i++) {
        const p = P[i]
        const h = hov[i]
        const L = lab[i]
        const lx = p.x + p.lc
        const ly = p.base + gap
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
        const l = Math.min(title.l, p.lsub > 0.02 ? sub.l : Infinity)
        const r = Math.max(title.r, p.lsub > 0.02 ? sub.r : -Infinity)
        const inside = r > l ? (Math.min(r, W) - Math.max(l, 0)) / (r - l) : 1
        const shown = p.vis * appeared[i] * smoothstep(visible[0], visible[1], inside)
        title.op = (p.lt + (1 - p.lt) * h * 0.6) * shown
        sub.op = L.sw > 0 ? p.lsub * shown : 0
      }
      // A title standing higher than the bottom edge of a nearer object beside it keeps clear of
      // that object: the whole label moves aside by the few px the curve's shape can leave
      // between two resting positions (at rest the layout already keeps them clear).
      const { clearObject } = GALLERY.label
      for (let i = 0; i < N; i++) {
        const { title, sub } = boxes[i]
        if (title.op < 0.02) continue
        let shift = 0
        for (let j = 0; j < N; j++) {
          if (j === i || P[j].a >= P[i].a || P[j].op < 0.3) continue
          const s = silhouette(scene, j, P[j])
          if (title.t >= s.b + clearObject || title.b <= s.t) continue
          if (title.l + shift >= s.r + clearObject || title.r + shift <= s.l - clearObject) continue
          shift = (title.l + title.r) / 2 > (s.l + s.r) / 2 ? s.r + clearObject - title.l : s.l - clearObject - title.r
        }
        shift = clamp(shift, -24, 24)
        if (shift) {
          title.l += shift
          title.r += shift
          sub.l += shift
          sub.r += shift
        }
      }
      // Nearest first: each line yields to every shown line of a nearer label it comes within
      // yieldPx of (the description first; never a description without its title).
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

      let nearest = 0
      for (let i = 1; i < N; i++) if (P[i].a < P[nearest].a) nearest = i
      for (let i = 0; i < N; i++) {
        const p = P[i]
        const pt = parts[i]
        const h = hov[i]
        const show = appeared[i]
        // The moving unit: the silhouette's bottom centre; the object stands on it and its label hangs beneath it.
        w.set(pt.unit.style, 'transform', `translate3d(${px(p.x)}px, ${px(p.base)}px, 0)`)
        w.set(pt.unit.style, 'z-index', String(p.z))
        // Scale and turn about the silhouette's bottom centre (projectTransition.ts reads this perspective() rotateY() pair).
        w.set(pt.object.style, 'transform', `scale(${p.s.toFixed(4)}) perspective(${persp}px) rotateY(${p.turn.toFixed(4)}rad)`)
        w.set(pt.object.style, 'opacity', f3(p.op * show))
        // Light by slot; hover and keyboard focus raise it a little.
        if (pt.glow) w.set(pt.glow.style, 'opacity', f3(p.glow + (1 - p.glow) * h * 0.4))
        if (pt.dim) w.set(pt.dim.style, 'opacity', f3(p.dim * (1 - 0.7 * h)))
        // The label: flat, upright and sharp (a 2D scale only), centred beneath the object.
        const { title, sub } = boxes[i]
        const dx = (title.l + title.r) / 2 - p.x
        const dy = title.t - p.base
        w.set(pt.label.style, 'transform', `translate3d(${px(dx)}px, ${px(dy)}px, 0) scale(${p.ls.toFixed(4)})`)
        w.set(pt.name.style, 'opacity', f3(title.op))
        if (pt.sub) w.set(pt.sub.style, 'opacity', f3(sub.op))
        const tier = p.a < 0.5 ? 0 : p.a < 1.5 ? 1 : 2
        if (tier !== written.tier[i]) {
          items[i].dataset.tier = String(tier)
          written.tier[i] = tier
        }
        // Pointer targets: only objects (and labels) that are clearly shown.
        const sil = silhouette(scene, i, p)
        const inStage = (Math.min(sil.r, W) - Math.max(sil.l, 0)) / Math.max(1, sil.r - sil.l)
        const off = (p.op * show < 0.35 || inStage < 0.45 ? 1 : 0) + (title.op < 0.45 ? 2 : 0)
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
      // The position indicator follows the object the carousel rests on or is heading to.
      const shownIndex = mod(heading(), N)
      if (shownIndex !== counted && countRef.current) {
        countRef.current.textContent = `${shownIndex + 1} / ${N}`
        counted = shownIndex
      }
    }

    // ------------------------------------------------------------------
    // Motion state
    // ------------------------------------------------------------------
    const restored = recallPosition(locationKey, navigationType)
    const same = kept.current?.key === locationKey
    let pos = Math.round(same ? kept.current!.pos : (restored?.pos ?? OPENING_POS))
    let mode: Mode = 'rest'
    /** The step or settle under way: a cubic from `from` to `to` over `dur` ms, starting with slope `m0` (items over the whole step), ending at rest. */
    const tw = { from: pos, to: pos, m0: 0, t0: 0, dur: 1 }
    let target = pos
    /** Current speed (items per second). */
    let vel = 0
    const st = { hover: -1, focus: -1, active: -1, press: -1, busy: false, visible: document.visibilityState === 'visible' }
    let raf = 0
    let last = 0
    let fade = 0
    let pollAt = 0

    const save = () => {
      kept.current = { key: locationKey, pos: mod(Math.round(heading()), N) }
      notePosition(locationKey, { pos: kept.current.pos })
      persistPosition(locationKey)
    }

    const kick = () => {
      if (!raf) {
        last = 0
        raf = requestAnimationFrame(frame)
      }
    }

    /** Hover follows a still pointer as the objects move beneath it. */
    const pointer = { x: 0, y: 0, inside: false }

    function frame(now: number) {
      raf = 0
      if (st.busy || !st.visible) {
        last = 0
        return
      }
      const dt = last ? Math.min(now - last, 50) / 1000 : 0
      last = now
      let again = easeHover(dt)
      if (mode === 'tween') {
        const t = clamp((performance.now() - tw.t0) / tw.dur, 0, 1)
        const D = tw.to - tw.from
        if (t >= 1) {
          pos = tw.to
          vel = 0
          mode = 'rest'
          // Keep the position small (the loop repeats every N items).
          const q = mod(pos, N)
          target = q
          pos = q
          save()
          announce()
        } else {
          const t2 = t * t
          const t3 = t2 * t
          pos = tw.from + D * (3 * t2 - 2 * t3) + tw.m0 * (t - 2 * t2 + t3)
          vel = (D * (6 * t - 6 * t2) + tw.m0 * (1 - 4 * t + 3 * t2)) / (tw.dur / 1000)
          again = true
        }
      }
      layout()
      // Hover follows what is under a still pointer (mouse and pen) while the objects move.
      if (pointer.inside && mode !== 'rest' && now >= pollAt && !st.busy) {
        pollAt = now + GALLERY.hover.pollMs
        setHover(indexOf(document.elementFromPoint(pointer.x, pointer.y)))
      }
      if (again) raf = requestAnimationFrame(frame)
    }

    /**
     * Moves to position T over `dur` ms, starting at speed v0 (items per
     * second; only in T's direction, never faster than the curve allows
     * without overshooting) or at least `lead` times the average speed.
     */
    const tweenTo = (T: number, dur: number, v0: number, lead = 0) => {
      const D = T - pos
      target = T
      if (Math.abs(D) < 1e-4) {
        pos = T
        vel = 0
        mode = 'rest'
        layout()
        save()
        announce()
        return
      }
      let m0 = (v0 * dur) / 1000
      if (m0 * D < 0) m0 = 0
      if (Math.abs(m0) < Math.abs(lead * D)) m0 = lead * D
      m0 = D > 0 ? clamp(m0, 0, 3 * D) : clamp(m0, 3 * D, 0)
      tw.from = pos
      tw.to = T
      tw.m0 = m0
      tw.t0 = performance.now()
      tw.dur = dur
      mode = 'tween'
      kick()
    }

    const stepDuration = (D: number) => {
      const { ms, perItemMs, maxMs, minMs } = GALLERY.step
      return clamp(ms + perItemMs * (Math.abs(D) - 1), minMs, maxMs)
    }
    const settleDuration = (D: number) => {
      const { minMs, maxMs, perItemMs } = GALLERY.settle
      return clamp(minMs + perItemMs * Math.abs(D), minMs, maxMs)
    }

    /** Announces the selected object after an arrow step (keyboard steps move focus, which announces itself). */
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
      target = T
      layout()
      fade = window.setTimeout(() => {
        pos = mod(T, N)
        target = pos
        swapping = false
        layout()
        save()
        announce()
        fadeAnim?.cancel()
        fadeAnim = list?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: inMs, easing: 'cubic-bezier(0.33, 0, 0.25, 1)' }) ?? null
      }, outMs * from)
    }

    /** The resting position the carousel is at or heading to (its selected object). */
    function heading() {
      if (reduced) return swapping ? target : Math.round(pos)
      return mode === 'tween' ? target : Math.round(pos)
    }

    /** One object forward (the next one comes to the centre; the row moves left) or back. Returns the new target. */
    const step = (dir: 1 | -1) => {
      if (st.busy || mode === 'drag') return target
      const T = heading() + dir
      if (reduced) {
        crossfadeTo(T)
        return T
      }
      if (mode === 'wheel') endWheel()
      tweenTo(T, stepDuration(T - pos), mode === 'tween' ? vel : 0, GALLERY.step.lead)
      return T
    }

    /**
     * Arrow keys on object i: the object beside it (in the key's direction)
     * comes to the centre, and the caller moves the focus to it. Returns the
     * new position.
     */
    const stepFrom = (i: number, dir: 1 | -1) => {
      const ref = heading()
      if (st.busy || mod(ref, N) === i) return step(dir)
      const half = Math.floor(N / 2)
      const T = ref + clamp(mod(i - ref + half, N) - half + dir, -half, half)
      if (reduced) {
        if (T !== ref) crossfadeTo(T)
        return T
      }
      if (T !== ref) tweenTo(T, stepDuration(T - pos), mode === 'tween' ? vel : 0, GALLERY.step.lead)
      return T
    }

    /** Brings item i to the centre (keyboard focus on an object that is not selected). */
    const feature = (i: number) => {
      const d = P[i].d
      if (Math.abs(d) < 0.02 && mode !== 'tween') return
      const T = Math.round(pos + d)
      if (reduced) {
        if (Math.abs(d) >= 0.5) crossfadeTo(T)
        return
      }
      if (mode === 'drag' || mode === 'wheel') return
      tweenTo(T, stepDuration(T - pos), mode === 'tween' ? vel : 0, GALLERY.step.lead)
    }

    /** After a drag or a trackpad gesture: a short ease to the nearest object, carrying the speed (and a little look-ahead). */
    const settle = (v: number) => {
      const near = Math.round(pos)
      const T = clamp(Math.round(pos + clamp(v * GALLERY.settle.flick, -0.6, 0.6)), near - 1, near + 1)
      tweenTo(T, settleDuration(T - pos), v)
    }

    measure()
    layout()
    root.dataset.ready = 'true'

    // Objects whose image decoded after the carousel mounted fade in (layout reads `shownAt`).
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
    // counts. The object grows 2.5% about its bottom edge; its title and
    // glow brighten.
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
      setHover(mode === 'drag' ? -1 : indexOf(e.target))
    }
    // Left the carousel (onto the introduction, the header, or out of the window).
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.inside = false
      setHover(-1)
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)

    // ------------------------------------------------------------------
    // A press picks its object at once. The click that completes it opens
    // that object's page, even if another object has moved under the
    // pointer since (or none: the click then lands beside the links). A drag
    // never opens anything.
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

    // A drag is not a click; a pointer click opens the pressed object (see above).
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
      // Controls (the arrows) keep their own clicks.
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
    // Keyboard: a focused object comes to the centre (where its label, with
    // the focus ring, shows in full). Arrows step from the focused object
    // (stepFrom) or from an arrow control.
    // ------------------------------------------------------------------
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target instanceof Element ? e.target : null
      if (!el || !root.contains(el) || !el.matches(':focus-visible')) return
      const li = el.closest<HTMLElement>('[data-index]')
      st.focus = li ? Number(li.dataset.index) : -1
      setActive()
      if (st.focus >= 0) feature(st.focus)
    }
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget instanceof Element ? e.relatedTarget : null
      if (next && root.contains(next) && next.closest('[data-index]')) return
      st.focus = -1
      setActive()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.shiftKey) return
      const el = e.target instanceof Element ? e.target : null
      const onLink = el?.closest('.gobj__link')
      const onArrow = el?.closest('.gallery__arrow')
      if (!onLink && !onArrow) return
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      const at = onLink ? links.indexOf(onLink as HTMLAnchorElement) : -1
      if (at >= 0) {
        // From the focused object (not the selected one): focus never skips an object.
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
    // Horizontal trackpad gestures (deltaX) over the carousel move it; the
    // page never scrolls sideways, and vertical wheel and trackpad input is
    // never touched (it scrolls the page).
    // ------------------------------------------------------------------
    const wg = { last: -Infinity, peak: 0, lastAbs: 0, px: 1, tail: false, v: 0, acc: 0, stepped: false, anchor: 0 }
    let wheelTimer = 0
    function endWheel() {
      window.clearTimeout(wheelTimer)
      wheelTimer = 0
      if (mode === 'wheel') mode = 'rest'
    }
    const settleWheel = () => {
      window.clearTimeout(wheelTimer)
      wheelTimer = 0
      if (mode !== 'wheel') return
      wg.tail = true
      const moved = pos - wg.anchor
      const near = Math.round(pos)
      let T = clamp(Math.round(pos + clamp(wg.v * GALLERY.settle.flick, -0.6, 0.6)), near - 1, near + 1)
      if (T === wg.anchor && Math.abs(moved) > GALLERY.wheel.advance) T = wg.anchor + Math.sign(moved)
      tweenTo(T, settleDuration(T - pos), wg.v)
    }
    const onWheel = (e: WheelEvent) => {
      // Browser zoom (ctrl or cmd with the wheel, trackpad pinch) stays native.
      if (e.ctrlKey || e.metaKey) return
      if (e.target instanceof Element && e.target.closest(OWN_SCROLL)) return
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerWidth : 1
      const dx = e.deltaX * unit
      const dy = e.deltaY * unit
      // Vertical (or mostly vertical) scrolling belongs to the page.
      if (Math.abs(dx) <= Math.abs(dy) || dx === 0) return
      // Horizontal: never the browser's back and forward swipe.
      e.preventDefault()
      if (st.busy || mode === 'drag') return
      const now = performance.now()
      const abs = Math.abs(dx)
      if (reduced) {
        // One step per gesture: a swipe to the left (content moving left) brings the next object to the centre.
        if (now - wg.last > GALLERY.reduced.gapMs) {
          wg.acc = 0
          wg.stepped = false
        }
        wg.last = now
        wg.acc += dx
        if (!wg.stepped && Math.abs(wg.acc) >= GALLERY.reduced.wheelPx) {
          wg.stepped = true
          announcePending = true
          step(wg.acc > 0 ? 1 : -1)
        }
        return
      }
      const { idleMs, tailMs, decay, minPeak } = GALLERY.wheel
      // The momentum tail of a gesture that has already settled is ignored, until a pause or a new, stronger push.
      if (wg.tail) {
        if (now - wg.last < tailMs && abs <= wg.lastAbs * 1.5 + 2) {
          wg.last = now
          wg.lastAbs = abs
          return
        }
        wg.tail = false
      }
      if (mode !== 'wheel') {
        // A step or settle under way hands its speed over to the gesture.
        wg.v = mode === 'tween' ? vel : 0
        wg.anchor = heading()
        mode = 'wheel'
        wg.px = restSpacing(scene, pos)
        wg.peak = 0
      }
      const dt = Math.max(8, Math.min(60, now - wg.last))
      const move = dx / wg.px
      pos += move
      wg.v = 0.6 * wg.v + 0.4 * ((move / dt) * 1000)
      wg.peak = Math.max(wg.peak, abs)
      wg.last = now
      wg.lastAbs = abs
      kick()
      window.clearTimeout(wheelTimer)
      if (wg.peak >= minPeak && abs < wg.peak * decay) settleWheel()
      else wheelTimer = window.setTimeout(settleWheel, idleMs)
    }
    root.addEventListener('wheel', onWheel, { passive: false })

    // ------------------------------------------------------------------
    // Drag (mouse and pen) and swipe (touch): horizontal movement moves the
    // carousel with the pointer; vertical touch movement scrolls the page
    // (touch-action: pan-y on the stage).
    // ------------------------------------------------------------------
    const drag = { id: -1, x: 0, y: 0, start: 0, active: false, px: 1, lastX: 0, lastT: 0, v: 0, endedAt: -Infinity }
    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || st.busy || (e.pointerType === 'mouse' && e.button !== 0)) return
      drag.id = e.pointerId
      drag.x = drag.lastX = e.clientX
      drag.y = e.clientY
      drag.lastT = performance.now()
      drag.v = 0
      drag.active = false
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      const { slop } = GALLERY.drag
      if (!drag.active) {
        if (Math.abs(dx) > slop && Math.abs(dx) > Math.abs(dy) * 1.2) {
          drag.active = true
          try {
            stage.setPointerCapture(e.pointerId)
          } catch {
            /* the pointer is already gone */
          }
          stage.dataset.dragging = ''
          if (!reduced) {
            if (mode === 'wheel') endWheel()
            mode = 'drag'
            drag.start = pos
            drag.x = e.clientX
            drag.px = restSpacing(scene, pos)
            vel = 0
            setHover(-1)
          }
        } else if (Math.abs(dy) > slop * 2) {
          drag.id = -1
        }
        return
      }
      if (reduced) return
      const now = performance.now()
      const half = N / 2 - 0.6
      pos = clamp(drag.start - (e.clientX - drag.x) / drag.px, drag.start - half, drag.start + half)
      const dtm = Math.max(1, now - drag.lastT)
      drag.v = 0.6 * drag.v + 0.4 * ((-(e.clientX - drag.lastX) / drag.px / dtm) * 1000)
      drag.lastX = e.clientX
      drag.lastT = now
      kick()
    }
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== drag.id) return
      drag.id = -1
      if (!drag.active) return
      drag.active = false
      delete stage.dataset.dragging
      drag.endedAt = performance.now()
      if (reduced) {
        const dx = e.clientX - drag.x
        if (Math.abs(dx) > 40) {
          announcePending = true
          step(dx < 0 ? 1 : -1)
        }
        return
      }
      // A pointer held still before release carries no flick.
      const still = performance.now() - drag.lastT > 90
      const v = e.type === 'pointercancel' || still ? 0 : drag.v
      mode = 'rest'
      settle(v)
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
        const want = Array.from(scene.bw, (x) => Math.ceil(x * GALLERY.hover.scale))
        const have = objects.map((o) => parseFloat(o.querySelector('.gobj__art img')?.getAttribute('sizes') ?? '0'))
        if (want.some((x, i) => x > have[i] * 1.15)) setSizes(want.map((x) => `${x}px`))
      })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    window.addEventListener('resize', onResize)
    let alive = true
    void document.fonts?.ready.then(() => {
      if (!alive) return
      // The labels' sizes follow the loaded fonts.
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
    }

    if (import.meta.env.DEV) {
      window.__homeGallery = {
        pos: () => pos,
        mode: () => mode,
        target: () => heading(),
        placements: () => P.map((p) => ({ ...p })),
        labels: () => boxes.map((b) => ({ title: { ...b.title }, sub: { ...b.sub } })),
        silhouettes: () => P.map((p, i) => silhouette(scene, i, p)),
        scene: () => {
          const { slotX: _slots, sw, sh, bw: _bw, bh: _bh, p: _p, ...rest } = scene
          void _slots
          void _bw
          void _bh
          void _p
          return { ...rest, sw: Array.from(sw), sh: Array.from(sh) }
        },
        seek: (p) => {
          window.clearTimeout(wheelTimer)
          pos = p
          target = Math.round(p)
          vel = 0
          mode = 'rest'
          layout()
        },
        step: (dir) => step(dir),
      }
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      cancelAnimationFrame(appearRaf)
      window.clearTimeout(fade)
      window.clearTimeout(wheelTimer)
      if (swapping) pos = target
      if (mode === 'tween') pos = target
      fadeAnim?.cancel()
      save()
      api.current = null
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('pointerup', endPress, true)
      window.removeEventListener('pointercancel', endPress, true)
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('wheel', onWheel)
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
  }, [locationKey, navigationType, reduced, navigate])

  // Keyboard activation (Enter) and assistive technology: the link opens its own page.
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
    <section ref={rootRef} className="gallery" aria-label="Projects" data-reduced={reduced || undefined} data-paused={paused || undefined}>
      <div ref={stageRef} className="gallery__stage" style={initialStyle}>
        <ul className="gallery__list" role="list">
          {GALLERY_ITEMS.map((item, i) => {
            const origin = silhouetteOrigin(item.kind)
            return (
              <li
                key={item.id}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="gobj"
                data-index={i}
                data-kind={item.kind}
                style={{ ...accentVars(item.id), '--rim-rgb': rimRgb(item.id), '--float-phase': i * 0.83, '--ox': origin.x.toFixed(4), '--oy': origin.y.toFixed(4) } as CSSProperties}
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
                      priority={false}
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
            )
          })}
        </ul>
      </div>
      <div ref={navRef} className="gallery__nav">
        <button type="button" className="gallery__arrow gallery__arrow--prev" aria-label="Previous project" onClick={() => api.current?.step(-1)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span ref={countRef} className="gallery__count tabular" aria-hidden="true">
          {`${OPENING_POS + 1} / ${N}`}
        </span>
        <button type="button" className="gallery__arrow gallery__arrow--next" aria-label="Next project" onClick={() => api.current?.step(1)}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {!reduced && (
          <button type="button" className="gallery__motion" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? 'Resume motion' : 'Pause motion'}
          </button>
        )}
      </div>
      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </section>
  )
}

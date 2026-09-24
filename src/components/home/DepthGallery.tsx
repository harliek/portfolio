import { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { GALLERY } from '../../config/carousel'
import { ACCENTS, accentVars, type AccentId } from '../../content/accents'
import { CAROUSEL_ITEMS } from '../../content/carousel'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'
import { notePosition, persistPosition, recallPosition } from './carouselMemory'
import { GalleryObject } from './GalleryObject'
import { buildScene, FEATURED_SIZES, frontBoost, mod, OPENING_POS, place, type Placement, type Scene } from './galleryModel'

/** Debug handle for browser checks in development. */
interface GalleryDebug {
  pos: () => number
  mode: () => string
  state: () => { hover: number; focus: number; touch: boolean; busy: boolean; forced: boolean; featured: number }
  placements: () => Placement[]
  /** Moves the gallery to a position and holds it there (no drift) until the next input; `drift` starts the idle drift from there at once. */
  seek: (pos: number, drift?: boolean) => void
  step: (dir: 1 | -1) => void
  /** Drift speed multiplier for loop tests. */
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

type Mode = 'hold' | 'drift' | 'input' | 'settle' | 'drag'

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
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
/** The share of each object's height, from its base, that is narrower than the object (a stand beside which names may stand). */
const FOOT = CAROUSEL_ITEMS.map((item) => GALLERY.label.foot[item.kind] ?? 0)

/**
 * The homepage depth gallery: the seven transparent PNG objects standing in
 * the architectural room at different depths (galleryModel.ts), in their
 * fixed order, with the featured object substantially closer and larger,
 * its neighbours farther back and turned towards the viewer, and the outer
 * ones receding into the dark.
 *
 * Motion. One continuous position moves every object through depth (place,
 * scale, turn, stacking order, brightness together). The page does not
 * scroll: wheel and trackpad input moves the position continuously while it
 * lasts (one comfortable gesture ≈ one project), then it settles on the
 * nearest project with a critically damped spring (no bounce). After a
 * short reading pause a very slow idle drift resumes in the established
 * direction. The previous and next arrows, the arrow keys (focus in the
 * gallery) and horizontal swipes step one project with the same motion.
 *
 * Hover or keyboard focus on an object pauses everything at once (input
 * meanwhile is discarded, never applied later); the object comes slightly
 * forward (+5%) with a stronger glow and its subtitle appears under its
 * name. The gallery never recentres because the pointer crosses an object.
 * Keyboard focus on an object that is not clearly shown (partly outside
 * the window, faded, or its name hidden) brings it to the front. Click or Enter opens
 * the page through openProject(), which moves this same PNG into the
 * destination's cover slot; on 'cover' the gallery freezes where it is.
 *
 * Reduced motion: the same arrangement, still; steps (arrows, keys, swipe,
 * one per wheel gesture) change with a short cross-fade.
 *
 * Browser Back restores the position (carouselMemory.ts); every listener
 * (including the window wheel listener) is removed when the homepage
 * unmounts.
 */
export function DepthGallery({ children }: { children?: ReactNode }) {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { key: locationKey } = useLocation()
  const reduced = useReducedMotion()
  const touch = useMediaQuery(TOUCH_QUERY)
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<HTMLParagraphElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const objectRefs = useRef<Array<HTMLSpanElement | null>>([])
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  /** The position survives effect re-runs within one history entry (the motion setting changed). */
  const kept = useRef<{ key: string; pos: number } | null>(null)
  const api = useRef<{ step: (dir: 1 | -1) => void; freeze: (i: number) => void; resume: (i: number) => void; dragged: () => boolean } | null>(null)
  // The images' `sizes`: chosen for this window, raised if a resize makes the objects notably larger.
  const [sizes, setSizes] = useState(initialSizes)

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
    const nameHalf = new Float64Array(N)
    const subHalf = new Float64Array(N)
    /** The name's and the subtitle's top and height within their label (px), and the height of a name's line. */
    const nameTop = new Float64Array(N)
    const nameH = new Float64Array(N)
    const subTop = new Float64Array(N)
    const subH = new Float64Array(N)
    let nameRow = 24
    /** Per frame: each name's centre, top and opacity before names give way to nearer ones. */
    const nameX = new Float64Array(N)
    const nameY = new Float64Array(N)
    const nameOp = new Float64Array(N)
    /** Per frame: each subtitle's centre, each label's final opacity, and whether a neighbour's subtitle may show on touch. */
    const subX = new Float64Array(N)
    const labelOp = new Float64Array(N)
    const subCand = new Array<boolean>(N).fill(false)
    /** Per frame: how much each object counts as an obstacle for the names beside it, and its lowest wide part (px). */
    const obstacle = new Float64Array(N)
    const bodyBottom = new Float64Array(N)
    const P: Placement[] = Array.from({ length: N }, () => ({ d: 0, a: 0, s: 1, k: 1, turn: 0, x: 0, base: 0, hw: 0, vis: 1, op: 1 }))
    /** Phones: the placements at the nearest resting position (whether a neighbour will rest wholly inside the window). */
    const R: Placement[] = P.map((p) => ({ ...p }))
    const sideOk = new Array<boolean>(N).fill(false)
    const written = {
      t: new Array<string>(N).fill(''),
      o: new Array<string>(N).fill(''),
      z: new Array<number>(N).fill(-1),
      tier: new Array<number>(N).fill(-1),
      off: new Array<number>(N).fill(-1),
      lt: new Array<string>(N).fill(''),
      sx: new Array<string>(N).fill(''),
      lo: new Array<string>(N).fill(''),
      fits: new Array<boolean>(N).fill(false),
    }
    let featured = -1
    const dpr = window.devicePixelRatio || 1
    const px = (v: number) => (Math.round(v * dpr * 4) / (dpr * 4)).toFixed(2)

    const floorFile = (): 'desktop' | 'mobile' => (document.querySelector<HTMLElement>('.stage-bg')?.dataset.file === 'mobile' ? 'mobile' : 'desktop')

    const measureLabels = () => {
      labels.forEach((label, i) => {
        const name = label.querySelector<HTMLElement>('.gobj__name')
        const sub = label.querySelector<HTMLElement>('.gobj__sub')
        nameHalf[i] = (name?.offsetWidth ?? 120) / 2
        nameTop[i] = name?.offsetTop ?? 2
        nameH[i] = name?.offsetHeight ?? 21
        subHalf[i] = (sub?.offsetWidth ?? 240) / 2
        subTop[i] = sub?.offsetTop ?? 24
        subH[i] = sub?.offsetHeight ?? 18
      })
      nameRow = Math.max(...labels.map((label) => label.querySelector<HTMLElement>('.gobj__name')?.offsetHeight ?? 24))
    }

    /** The bottom of the identity (name and descriptor) in stage px; portrait windows raise the floor towards it. */
    const identityBottom = () => {
      const id = root.closest('.home')?.querySelector('.home-id__block')
      return id ? id.getBoundingClientRect().bottom - stage.getBoundingClientRect().top : 0
    }

    const measure = () => {
      scene = buildScene(stage.clientWidth, stage.clientHeight, floorFile(), identityBottom())
      const { u } = scene
      root.style.setProperty('--u', u.toFixed(4))
      root.dataset.cls = scene.cls
      boost = frontBoost(scene, FEATURED_SIZES)
      for (let i = 0; i < N; i++) {
        widths[i] = FEATURED_SIZES[i].w * u * boost[i]
        heights[i] = FEATURED_SIZES[i].h * u * boost[i]
        items[i].style.setProperty('--w', `${widths[i].toFixed(2)}px`)
        items[i].style.setProperty('--h', `${heights[i].toFixed(2)}px`)
      }
      measureLabels()
      written.t.fill('')
      written.lt.fill('')
    }

    const layout = () => {
      place(pos, widths, boost, scene, P)
      const { u, W, H, cls } = scene
      const persp = (GALLERY.perspective * u).toFixed(0)
      const { gap, gapDepth, edgeFade, edgeMargin, clear, rise, phoneFade, touchSubs: touchSubsCfg } = GALLERY.label
      const phone = cls === 'phone'
      if (phone) {
        // A neighbour's name shows only if, at rest, its object stands wholly
        // inside the window and its name fits beside the front object there.
        const rest = Math.round(pos)
        place(rest, widths, boost, scene, R)
        const f = R[mod(rest, N)]
        for (let i = 0; i < N; i++) {
          const r = R[i]
          const nh = nameHalf[i]
          const inside = r.x - r.hw >= 2 && r.x + r.hw <= W - 2
          const side = r.d < 0 ? f.x - f.hw : f.x + f.hw
          const x = clamp(r.d < 0 ? Math.min(r.x, side - clear * u - nh) : Math.max(r.x, side + clear * u + nh), nh + edgeMargin, W - nh - edgeMargin)
          sideOk[i] = inside && Math.abs(r.a - 1) < 0.01 && (r.d < 0 ? x + nh <= side : x - nh >= side)
        }
      }
      let nearest = 0
      for (let i = 1; i < N; i++) if (P[i].a < P[nearest].a) nearest = i
      // Touch screens show the neighbours' subtitles too, only where the window is wide
      // enough for three captions side by side; narrower (portrait tablets), only the
      // featured subtitle shows, as on phones.
      const touchSubs = root.hasAttribute('data-touch') && !phone && W >= touchSubsCfg.minWidth
      // Objects at (or passing) the front: the names standing beside them keep
      // clear of them. Each counts fully until halfway to the next position
      // and not at all once it rests beside the front, so the names move
      // continuously (never a jump where two objects swap at the front).
      for (let j = 0; j < N; j++) {
        const q = P[j]
        obstacle[j] = 1 - smoothstep(0.5, 1, q.a)
        // The lowest wide part of the object (the monitor's screen stands on a narrow stand).
        bodyBottom[j] = q.base - FOOT[j] * heights[j] * q.k
      }
      /** How much object j keeps item i's name (its top at ly) clear of it: 0 once the name is below its lowest wide part. */
      const weight = (i: number, j: number, ly: number) => (j === i || obstacle[j] <= 0 ? 0 : obstacle[j] * clamp((bodyBottom[j] - ly) / (rise * u), 0, 1))
      /** How far item i's name (half-width `half`, centred at x) reaches into the room kept beside object j (px). */
      const intrusion = (i: number, j: number, half: number, x: number) => {
        const q = P[j]
        const reach = q.hw + clear * u + half
        return Math.max(0, P[i].d > q.d ? q.x + reach - x : x - (q.x - reach))
      }
      for (let i = 0; i < N; i++) {
        const p = P[i]
        const obj = objects[i]
        // Place, depth scale and floor line come from the model's single horizon
        // and front position; the turn gets a gentle keystone about the object's own axis.
        const t = `translate3d(${px(p.x - widths[i] / 2)}px, ${px(p.base - heights[i])}px, 0) scale(${p.k.toFixed(4)}) perspective(${persp}px) rotateY(${p.turn.toFixed(4)}rad)`
        if (t !== written.t[i]) {
          obj.style.transform = t
          written.t[i] = t
        }
        const o = p.op.toFixed(3)
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
        // The name, upright, under the object's base; it fades before the scene edges.
        // A name standing beside a nearer object (above its lowest wide part)
        // keeps clear of it, by how much that object counts (see `obstacle`).
        const ly = p.base + (gap + gapDepth * p.s) * u
        const nh = nameHalf[i]
        let lx = p.x
        for (let j = 0; j < N; j++) {
          const w = weight(i, j, ly)
          if (w > 0) lx += (p.d > P[j].d ? 1 : -1) * intrusion(i, j, nh, lx) * w
        }
        // Kept inside the window (under the object's visible part); it fades as the object leaves the frame.
        if (W > 2 * (nh + edgeMargin)) lx = clamp(lx, nh + edgeMargin, W - nh - edgeMargin)
        // Where the window edge leaves no room beside a nearer object, the name fades rather than overlap it.
        let crowd = 0
        for (let j = 0; j < N; j++) {
          const w = weight(i, j, ly)
          if (w > 0) crowd = Math.max(crowd, w * Math.max(0, intrusion(i, j, nh, lx) - clear * u))
        }
        // Its subtitle, directly beneath: centred under the name where it can
        // be, otherwise shifted (never past the name's own edge) to keep clear
        // of a nearer object and inside the window. Neither place depends on
        // whether the subtitle shows, so hover and focus never move the name.
        const sh = subHalf[i]
        const sy = ly + subTop[i]
        const slack = Math.max(0, sh - nh)
        let sx = lx
        for (let j = 0; j < N; j++) {
          const w = weight(i, j, sy)
          if (w > 0) sx += (p.d > P[j].d ? 1 : -1) * intrusion(i, j, sh, sx) * w
        }
        if (W > 2 * (sh + edgeMargin)) sx = clamp(sx, sh + edgeMargin, W - sh - edgeMargin)
        sx = clamp(sx, lx - slack, lx + slack)
        let subCrowd = 0
        for (let j = 0; j < N; j++) {
          const w = weight(i, j, sy)
          if (w > 0) subCrowd = Math.max(subCrowd, w * intrusion(i, j, sh, sx))
        }
        // On wide touch screens a neighbour may show its subtitle too, where it fits
        // beside the objects and inside the window (and, below, clear of every other label).
        subX[i] = sx
        subCand[i] = touchSubs && tier === 1 && subCrowd < 1 && sx - sh >= edgeMargin && sx + sh <= W - edgeMargin && p.x - p.hw >= 0 && p.x + p.hw <= W
        const inView = (Math.min(p.x + p.hw, W) - Math.max(p.x - p.hw, 0)) / Math.max(1, 2 * p.hw)
        const edge = clamp((inView - edgeFade[0]) / (edgeFade[1] - edgeFade[0]), 0, 1)
        // Phones: the front object's name fades out well before the next one's
        // fades in (never two names at the swap); a neighbour shows its name
        // near its resting place, and only where it rests wholly inside the
        // window (judged at the resting position, so a name never flashes on
        // and off while its object settles). The side window is closed at
        // every halfway point, where the nearest resting position changes.
        const depthFade = phone
          ? Math.max(
              clamp(1 - p.a / phoneFade.front, 0, 1),
              sideOk[i]
                ? smoothstep(phoneFade.side[0], phoneFade.side[1], p.a) * (1 - smoothstep(phoneFade.side[2], phoneFade.side[3], p.a))
                : 0,
            )
          : p.a < 1.5
            ? 1
            : 1 - 0.2 * clamp(p.a - 1.5, 0, 1)
        nameX[i] = lx
        nameY[i] = ly
        nameOp[i] = p.vis * depthFade * edge * clamp(1 - crowd / (16 * u), 0, 1) * clamp((H - 8 - ly) / 8, 0, 1)
        // The label stands at the name; the caption box (and with it the subtitle) is offset by --sx, the name kept in place.
        const lt = `translate3d(${px(lx)}px, ${px(ly)}px, 0)`
        if (lt !== written.lt[i]) {
          labels[i].style.transform = lt
          written.lt[i] = lt
        }
        const sxs = `${px(sx - lx)}px`
        if (sxs !== written.sx[i]) {
          labels[i].style.setProperty('--sx', sxs)
          written.sx[i] = sxs
        }
      }
      // Where two names would overlap (a far one held inside the window's
      // edge), the farther object's name gives way, by how much they overlap.
      for (let i = 0; i < N; i++) {
        let give = 1
        for (let j = 0; j < N; j++) {
          const farther = smoothstep(0, 0.2, P[i].a - P[j].a)
          if (j === i || farther <= 0 || nameOp[j] <= 0) continue
          // Gone by the time the two lines' boxes would touch.
          const ox = nameHalf[i] + nameHalf[j] + 12 * u - Math.abs(nameX[i] - nameX[j])
          const oy = nameRow + 6 * u - Math.abs(nameY[i] - nameY[j])
          if (ox > 0 && oy > 0) give = Math.min(give, 1 - Math.min(1, ox / (12 * u)) * Math.min(1, oy / (6 * u)) * Math.min(1, nameOp[j] * 2) * farther)
        }
        const p = P[i]
        const lop = nameOp[i] * give
        labelOp[i] = lop
        const lo = lop.toFixed(3)
        if (lo !== written.lo[i]) {
          labels[i].style.opacity = lo
          written.lo[i] = lo
        }
        // Pointer targets: only objects (and names) that are clearly shown.
        const inStage = Math.min(p.x + p.hw, W) - Math.max(p.x - p.hw, 0)
        const off = (p.op < 0.35 || inStage < p.hw * 0.9 ? 1 : 0) + (lop < 0.45 ? 2 : 0)
        if (off !== written.off[i]) {
          if (off & 1) items[i].dataset.off = ''
          else delete items[i].dataset.off
          if (off & 2) items[i].dataset.labelOff = ''
          else delete items[i].dataset.labelOff
          written.off[i] = off
        }
      }
      // A neighbour's subtitle shows only where its line keeps `subGap` clear of
      // every other shown name and subtitle beside it, and never on the featured
      // name's line (the three captions never run together into one line).
      const { subGap } = touchSubsCfg
      const beside = (aT: number, aB: number, aL: number, aR: number, bT: number, bB: number, bL: number, bR: number) =>
        aB > bT && aT < bB && aL < bR + subGap && aR > bL - subGap
      for (let i = 0; i < N; i++) {
        let fits = subCand[i] && labelOp[i] >= 0.45
        if (fits) {
          const sT = nameY[i] + subTop[i]
          const sB = sT + subH[i]
          const sL = subX[i] - subHalf[i]
          const sR = subX[i] + subHalf[i]
          for (let j = 0; j < N && fits; j++) {
            if (j === i || labelOp[j] < 0.05) continue
            const nT = nameY[j] + nameTop[j]
            const nB = nT + nameH[j]
            // (6px early, so a subtitle nearing the featured name's line has faded before it gets there.)
            if (j === nearest && nB + 6 > sT && nT - 6 < sB) fits = false
            else if (beside(sT, sB, sL, sR, nT, nB, nameX[j] - nameHalf[j], nameX[j] + nameHalf[j])) fits = false
            else if (j === nearest || subCand[j]) {
              const tT = nameY[j] + subTop[j]
              if (beside(sT, sB, sL, sR, tT, tT + subH[j], subX[j] - subHalf[j], subX[j] + subHalf[j])) fits = false
            }
          }
        }
        if (fits !== written.fits[i]) {
          if (fits) items[i].dataset.subFits = ''
          else delete items[i].dataset.subFits
          written.fits[i] = fits
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
    let vel = 0
    let mode: Mode = 'hold'
    let target = Math.round(pos)
    let holdUntil = performance.now() + (same || restored ? GALLERY.readPauseMs : GALLERY.openingHoldMs)
    let driftDir: 1 | -1 = 1
    let driftRamp = 0
    /** Moves started from the keyboard (arrow keys, focus) run even while focus or hover would pause. */
    let forced = false
    const gesture = { start: 0, anchor: 0, goal: 0, last: 0, lastAbs: 0, acc: 0, stepped: false }
    const st = { hover: -1, focus: -1, active: -1, touch: false, busy: false, visible: document.visibilityState === 'visible' }
    let raf = 0
    let last = 0
    let wake = 0
    let fade = 0
    const debugScale = () => (import.meta.env.DEV ? (window.__homeGallery?.timeScale ?? 1) : 1)

    const save = () => {
      kept.current = { key: locationKey, pos }
      notePosition(locationKey, { pos: mod(pos, N) })
      persistPosition(locationKey)
    }
    const halted = () => (st.hover >= 0 || st.focus >= 0 || st.touch) && !forced

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
      wake = window.setTimeout(kick, Math.max(0, t - performance.now()) + 16)
    }

    /** The wheel gesture ended: settle on a project (the next one in the gesture's direction once it moved). */
    const settleGesture = () => {
      const g = gesture
      const moved = g.goal - g.start
      const { threshold, overshoot } = GALLERY.wheel
      let T: number
      if (Math.abs(moved) < threshold) T = Math.round(g.goal)
      else if (moved > 0) T = Math.ceil(g.goal - overshoot)
      else T = Math.floor(g.goal + overshoot)
      target = clamp(T, g.anchor - 1, g.anchor + 1)
      mode = 'settle'
    }

    function frame(now: number) {
      raf = 0
      if (st.busy || !st.visible) {
        last = 0
        return
      }
      const dt = last ? Math.min(now - last, GALLERY.maxStep * 1000) / 1000 : 0
      last = now
      if (mode === 'drag') {
        layout()
        return
      }
      if (halted()) {
        vel = 0
        last = 0
        return
      }
      let again = true
      if (mode === 'input') {
        const prev = pos
        pos += (gesture.goal - pos) * (1 - Math.exp((-dt * 1000) / GALLERY.wheel.inputTau))
        vel = dt ? (pos - prev) / dt : vel
        if (now - gesture.last > GALLERY.wheel.endMs) settleGesture()
      } else if (mode === 'settle') {
        // Critically damped spring towards the target (exact step): no bounce, no overshoot.
        const w = GALLERY.settle.omega
        const x = pos - target
        const e = Math.exp(-w * dt)
        const k = vel + w * x
        pos = target + (x + k * dt) * e
        vel = (vel - w * k * dt) * e
        if (Math.abs(pos - target) < 0.0008 && Math.abs(vel) < 0.02) {
          pos = target
          vel = 0
          forced = false
          mode = 'hold'
          holdUntil = now + GALLERY.readPauseMs
          save()
          announce()
          again = false
        }
      } else if (mode === 'hold') {
        if (reduced || now < holdUntil) again = false
        else {
          mode = 'drift'
          driftRamp = 0
        }
      }
      if (mode === 'drift') {
        const { rate, wave, rampMs } = GALLERY.drift
        driftRamp = Math.min(1, driftRamp + (dt * 1000) / rampMs)
        const ramp = driftRamp * driftRamp * (3 - 2 * driftRamp)
        const f = pos - Math.floor(pos)
        // Slower near each featured position, never stopped; the same average rate.
        const v = rate * Math.sqrt(1 - wave * wave) * (1 - wave * Math.cos(2 * Math.PI * f)) * ramp * driftDir * debugScale()
        pos += v * dt
        vel = v
      }
      if (pos > N * 1000 || pos < -N * 1000) pos = mod(pos, N)
      layout()
      if (again) raf = requestAnimationFrame(frame)
      else if (mode === 'hold' && !reduced) wakeAt(holdUntil)
    }

    /** After hover, focus or touch ends: carry on smoothly (a pending drift ramps in again, input settles). */
    const resume = () => {
      if (halted()) return
      if (mode === 'input') settleGesture()
      else if (mode === 'drift') driftRamp = 0
      else if (mode === 'hold') holdUntil = Math.max(holdUntil, performance.now() + GALLERY.resumeDelayMs)
      kick()
    }

    /** Announces the featured project after an arrow-button step (keyboard steps move focus, which announces itself). */
    let announcePending = false
    function announce() {
      if (!announcePending || !liveRef.current) return
      announcePending = false
      const item = CAROUSEL_ITEMS[mod(Math.round(pos), N)]
      liveRef.current.textContent = `${item.name}. ${item.subtitle}`
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

    /** One project forward or back, with the settling motion (or a cross-fade). Returns the new target. */
    const step = (dir: 1 | -1, fromKeyboard = false) => {
      if (st.busy) return target
      driftDir = dir
      if (reduced) {
        const T = (swapping ? target : Math.round(pos)) + dir
        target = T
        crossfadeTo(T)
        return T
      }
      const base = mode === 'settle' ? target : Math.round(pos)
      target = clamp(base + dir, pos - 2.5, pos + 2.5)
      target = Math.round(target)
      mode = 'settle'
      forced = fromKeyboard
      kick()
      return target
    }

    /** Brings item i to the front (keyboard focus). */
    const feature = (i: number) => {
      const d = P[i].d
      if (Math.abs(d) < 0.02 && mode !== 'settle') return
      const T = Math.round(pos + d)
      if (reduced) {
        if (Math.abs(d) >= 0.5) crossfadeTo(T)
        return
      }
      target = T
      mode = 'settle'
      forced = true
      kick()
    }

    measure()
    layout()
    root.dataset.ready = 'true'

    // ------------------------------------------------------------------
    // Hover (mouse and pen): only an object's silhouette or its name counts.
    // ------------------------------------------------------------------
    const indexOf = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return -1
      const li = el.closest<HTMLElement>('[data-index]')
      return li && root.contains(li) && el.closest('[data-hit]') ? Number(li.dataset.index) : -1
    }
    let grace = 0
    const clearGrace = () => {
      window.clearTimeout(grace)
      grace = 0
    }
    const setActive = () => {
      const next = st.hover >= 0 ? st.hover : st.focus
      if (next === st.active) return
      if (st.active >= 0) delete items[st.active].dataset.active
      if (next >= 0) items[next].dataset.active = ''
      st.active = next
      if (next >= 0) root.dataset.hasActive = ''
      else delete root.dataset.hasActive
      // Its subtitle shows now: the name's fade near the edges accounts for it.
      layout()
    }
    const setHover = (i: number) => {
      clearGrace()
      if (st.hover === i) return
      const was = halted()
      st.hover = i
      // The pointer pauses everything at once, keyboard-started moves included.
      forced = false
      setActive()
      if (was && !halted()) resume()
    }
    const leaveSoon = () => {
      if (st.hover < 0 || grace) return
      grace = window.setTimeout(() => {
        grace = 0
        st.hover = -1
        setActive()
        resume()
      }, GALLERY.hover.graceMs)
    }
    // Hover starts only from the pointer's own movement: an object gliding
    // under a still pointer (while scrolling) neither pauses the gallery nor
    // swallows the next scroll. Moving onto it does.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || st.busy) return
      const i = indexOf(e.target)
      if (i >= 0) setHover(i)
      else leaveSoon()
    }
    // Left the gallery (onto the name above, the header, or out of the window): no pointermove follows here.
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') leaveSoon()
    }
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)

    // ------------------------------------------------------------------
    // Keyboard: focus pauses everything and lifts the object where it stands;
    // only an object not clearly shown comes to the front. Arrows step.
    // ------------------------------------------------------------------
    /** Wholly inside the window with its name shown (phones, which show one object at a time: at the front). */
    const clearlyShown = (i: number) => {
      const p = P[i]
      if (scene.cls === 'phone') return p.a < 0.02
      return !('off' in items[i].dataset) && !('labelOff' in items[i].dataset) && p.x - p.hw >= 0 && p.x + p.hw <= scene.W
    }
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target instanceof Element ? e.target : null
      const li = el?.closest<HTMLElement>('[data-index]')
      if (!el || !li || !root.contains(li)) return
      const i = Number(li.dataset.index)
      if (!el.matches(':focus-visible')) return
      st.focus = i
      setActive()
      if (!clearlyShown(i)) feature(i)
    }
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget instanceof Element ? e.relatedTarget.closest('[data-index]') : null
      if (next && root.contains(next)) return
      if (st.focus < 0) return
      st.focus = -1
      forced = false
      setActive()
      resume()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const el = e.target instanceof Element ? e.target : null
      const onLink = el?.closest('.gobj__link')
      const onArrow = el?.closest('.gallery__arrow')
      if (!onLink && !onArrow) return
      e.preventDefault()
      const T = step(e.key === 'ArrowRight' ? 1 : -1, Boolean(onLink))
      if (onLink) links[mod(T, N)].focus({ preventScroll: true })
      else announcePending = true
    }
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)
    root.addEventListener('keydown', onKeyDown)

    // ------------------------------------------------------------------
    // Wheel and trackpad, anywhere on the homepage (it does not scroll).
    // ------------------------------------------------------------------
    const onWheel = (e: WheelEvent) => {
      // Browser zoom (ctrl or cmd with the wheel, trackpad pinch) stays native.
      if (e.ctrlKey || e.metaKey) return
      if (e.target instanceof Element && e.target.closest(OWN_SCROLL)) return
      const html = document.documentElement
      if (html.classList.contains('is-menu-open') || html.classList.contains('is-dialog-open')) return
      e.preventDefault()
      if (st.busy || halted() || mode === 'drag') return // discarded, never applied later
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const raw = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit
      if (!raw) return
      const now = performance.now()
      const g = gesture
      if (reduced) {
        if (now - g.last > GALLERY.wheel.gapMs) {
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
      const { maxEvent, pxPerItem, gapMs } = GALLERY.wheel
      const delta = clamp(raw, -maxEvent, maxEvent)
      const dir = delta > 0 ? 1 : -1
      if (mode !== 'input' || now - g.last > gapMs) {
        g.anchor = mode === 'settle' ? target : Math.round(pos)
        g.start = pos
        g.goal = pos
        g.lastAbs = 0
      } else if (Math.abs(g.goal - (g.anchor + dir)) < 1e-6 && Math.abs(delta) > 14 && Math.abs(delta) > g.lastAbs * 1.8) {
        // A fresh swipe while the previous one's momentum is still arriving: one more project.
        g.anchor += dir
      }
      g.goal = clamp(g.goal + delta / pxPerItem, g.anchor - 1, g.anchor + 1)
      g.lastAbs = Math.abs(delta)
      g.last = now
      driftDir = dir
      forced = false
      mode = 'input'
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
      drag.anchor = mode === 'settle' ? target : Math.round(pos)
      // A hand on the gallery holds it.
      st.touch = true
      forced = false
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
            mode = 'drag'
            vel = 0
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
          target = clamp(Math.round(pos + flick), drag.anchor - 1, drag.anchor + 1)
          vel = drag.v
          if (target !== drag.anchor) driftDir = target > drag.anchor ? 1 : -1
          mode = 'settle'
        }
      }
      endTouch()
    }
    // A swipe is not a tap: the click that may follow it does not open anything.
    const onClickCapture = (e: Event) => {
      if (performance.now() - drag.endedAt < 400) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    stage.addEventListener('pointerdown', onPointerDown)
    stage.addEventListener('pointermove', onPointerMove)
    stage.addEventListener('pointerup', onPointerEnd)
    stage.addEventListener('pointercancel', onPointerEnd)
    stage.addEventListener('click', onClickCapture, true)

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
    window.addEventListener('resize', onResize)
    let alive = true
    void document.fonts?.ready.then(() => {
      if (!alive) return
      // The names' widths and the identity's height (the portrait floor) follow the loaded fonts.
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
        clearGrace()
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
        kick()
      },
      dragged: () => performance.now() - drag.endedAt < 400,
    }

    if (import.meta.env.DEV) {
      window.__homeGallery = {
        pos: () => pos,
        mode: () => mode,
        state: () => ({ hover: st.hover, focus: st.focus, touch: st.touch, busy: st.busy, forced, featured }),
        placements: () => P.map((p) => ({ ...p })),
        seek: (p, drift) => {
          pos = p
          target = Math.round(p)
          vel = 0
          mode = drift ? 'drift' : 'hold'
          driftRamp = drift ? 1 : 0
          holdUntil = Infinity
          layout()
          if (drift) kick()
        },
        step: (dir) => step(dir),
        timeScale: window.__homeGallery?.timeScale ?? 1,
      }
    }

    if (!reduced) wakeAt(holdUntil)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      window.clearTimeout(wake)
      window.clearTimeout(fade)
      clearGrace()
      if (swapping) pos = target
      fadeAnim?.cancel()
      save()
      api.current = null
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
      root.removeEventListener('keydown', onKeyDown)
      stage.removeEventListener('pointerdown', onPointerDown)
      stage.removeEventListener('pointermove', onPointerMove)
      stage.removeEventListener('pointerup', onPointerEnd)
      stage.removeEventListener('pointercancel', onPointerEnd)
      stage.removeEventListener('click', onClickCapture, true)
      if (import.meta.env.DEV) delete window.__homeGallery
    }
    // A new history entry for / (the home link on the homepage) starts over with the opening.
  }, [locationKey, navigationType, reduced])

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
                aria-describedby={`gobj-sub-${item.id}`}
                onClick={(e) => onOpen(e, i)}
                onPointerEnter={() => warmProject(item.path)}
                onFocus={() => warmProject(item.path)}
              >
                <GalleryObject
                  item={item}
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
                    <span className="gobj__sub" id={`gobj-sub-${item.id}`}>
                      {item.subtitle}
                    </span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="gallery__bar">
        <div className="shell gallery__bar-inner">
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
          {children}
        </div>
      </div>
      <p ref={liveRef} className="visually-hidden" aria-live="polite" />
    </section>
  )
}

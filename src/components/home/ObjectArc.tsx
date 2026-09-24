import { useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { CAROUSEL } from '../../config/carousel'
import { accentVars } from '../../content/accents'
import { CAROUSEL_ITEMS } from '../../content/carousel'
import { openProject } from '../transition/projectTransition'
import { buildArc, dimAt, extentAt, solve, type ArcGeometry } from './arcGeometry'
import { CarouselObject, isPlainClick, objectBox, warm, type ObjectBox } from './CarouselObject'
import { notePosition, persistPosition, recallPosition } from './carouselMemory'

/** Debug handle for browser checks in development (read-only state, and a time scale for loop tests). */
interface ArcDebug {
  phase: () => number
  loop: () => number
  speed: () => number
  state: () => { hover: number; focus: number; busy: boolean; running: boolean; boost: number }
  /** Moves the carousel to a phase (px along the track) for inspection. */
  seek: (phase: number) => void
  timeScale: number
}
declare global {
  interface Window {
    __homeArc?: ArcDebug
  }
}

const N = CAROUSEL_ITEMS.length

/** Size factor for the current window (OBJECT_SIZE is the 1440×900 reference). */
export function sizeFactor() {
  const { min, max, heightOffset, heightSpan } = CAROUSEL.size
  const u = Math.min(window.innerWidth / 1440, (window.innerHeight - heightOffset) / heightSpan)
  return Math.min(max, Math.max(min, u))
}

interface Controls {
  freeze: (i: number) => void
  resume: (i: number) => void
}

/**
 * The moving arc (hover-capable fine pointers, motion allowed, windows at
 * least CAROUSEL.arcMinWidth wide).
 *
 * The seven PNG objects stand on one track in their fixed order (About Me,
 * Merchandising Platform, CafePress UK, Spreadsheet Agent, AI Leasing
 * Agent, Creative Production, Jumpstart Finance, then About Me again), each
 * taking its own width plus one gap. The track is a shallow concave arc
 * (arcGeometry.ts). One phase moves at a constant, time-based speed and
 * every object's transform is written directly in an animation-frame loop
 * (no React state per frame). On a fresh visit About's left edge lines up
 * with the identity block, so it is the leftmost fully visible object;
 * browser Back restores the previous position (carouselMemory.ts).
 *
 * - Hover or keyboard focus on an object pauses the whole carousel at its
 *   exact position; the object comes forward (+6%) with a stronger glow and
 *   its contribution sentence appears in the reserved caption region below.
 *   Moving the pointer from the object into that region keeps it paused.
 *   An object arriving under a still pointer pauses it too.
 * - Scrolling over the carousel speeds it up to at most twice the idle
 *   speed, easing back over ~700ms (passive listener: the page scrolls
 *   normally, nothing navigates).
 * - Each object is ONE link (accessible name in HTML). Its pointer target
 *   is the object's silhouette (objectHull.ts); objects mostly outside the
 *   stage take no pointer events. Keyboard focus on an object outside the
 *   readable area glides it in.
 * - An object is moved from one end of the loop to the other only where it
 *   is fully outside the stage (and transparent), so a full loop has no
 *   visible reset.
 * - Click or Enter: openProject() moves the same PNG into the destination
 *   page; when it returns 'cover' the carousel freezes where it is.
 * - The loop stops while the page is hidden or the carousel is off screen.
 */
export function ObjectArc() {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { key: locationKey } = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const controls = useRef<Controls | null>(null)
  /** Left edge of the readable area (px from the stage's left), for keeping the caption inside it. */
  const edgeRef = useRef(0)
  /**
   * The caption region: which item's sentence it shows (the last active one
   * stays while it fades out), whether it is shown, and the x (px from the
   * stage's left) of the object it belongs to.
   */
  const [caption, setCaption] = useState<{ index: number; visible: boolean; x: number }>({ index: -1, visible: false, x: 0 })

  // Centre the sentence under its object, kept inside the readable area.
  useLayoutEffect(() => {
    const el = captionRef.current
    const band = bandRef.current
    if (!el || !band || caption.index < 0) return
    const w = el.offsetWidth
    const e = edgeRef.current
    const left = Math.max(e, Math.min(band.clientWidth - e - w, caption.x - w / 2))
    el.style.left = `${Math.round(left)}px`
  }, [caption])

  useLayoutEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const band = bandRef.current
    const items = itemRefs.current.slice(0, N) as HTMLLIElement[]
    const links = linkRefs.current.slice(0, N) as HTMLAnchorElement[]
    if (!root || !stage || !band || items.some((x) => !x) || links.some((x) => !x)) return

    let u = 1
    let boxes: ObjectBox[] = []
    let g: ArcGeometry = buildArc(1, [1], 0)
    let baseline = 0
    /** Left edge of the readable area (the identity block's left edge), relative to the stage. */
    let edge = 0
    /** Per object: the largest |s| at which it is fully inside the readable area. */
    let sRead: number[] = []
    let phase = 0
    let raf = 0
    let last = 0
    let recheckAt = 0
    const st = {
      hover: -1,
      focus: -1,
      active: -1,
      busy: false,
      onScreen: true,
      pageVisible: document.visibilityState === 'visible',
      glide: null as null | { from: number; to: number; t0: number },
    }
    const boost = { level: 0, at: 0, eff: 0 }
    /** Time the motion has run since a fresh opening (ms), for the start ramp; Infinity once complete or when restored. */
    let rampMs = 0
    const sOf = new Float64Array(N)
    const xOf = new Float64Array(N)
    const written = { t: new Array<string>(N).fill(''), o: new Array<string>(N).fill(''), off: new Array<boolean | null>(N).fill(null) }
    const dpr = window.devicePixelRatio || 1
    const px = (v: number) => (Math.round(v * dpr * 4) / (dpr * 4)).toFixed(2)
    const debugScale = () => (import.meta.env.DEV ? (window.__homeArc?.timeScale ?? 1) : 1)

    const measure = () => {
      u = sizeFactor()
      root.style.setProperty('--u', u.toFixed(4))
      root.style.setProperty('--hover-scale', String(CAROUSEL.hover.scale))
      root.style.setProperty('--hover-lift', `${(CAROUSEL.hover.lift * u).toFixed(2)}px`)
      boxes = CAROUSEL_ITEMS.map((item) => objectBox(item, u))
      items.forEach((li, i) => {
        li.style.setProperty('--w', `${boxes[i].boxW.toFixed(2)}px`)
        li.style.setProperty('--h', `${boxes[i].boxH.toFixed(2)}px`)
        li.style.setProperty('--img-h', `${boxes[i].imgH.toFixed(2)}px`)
      })
      const W = stage.clientWidth
      g = buildArc(
        W,
        boxes.map((b) => b.boxW),
        40 * u,
      )
      // Baseline: room above for the tallest object at its closest (a hovered object may rise a little beyond the stage top).
      const tallest = Math.max(...boxes.map((b) => b.boxH))
      baseline = tallest * CAROUSEL.arc.peak + CAROUSEL.topRoom * u
      const below = (CAROUSEL.arc.peak - CAROUSEL.arc.centre) * CAROUSEL.arc.floorDrop * u + CAROUSEL.bottomRoom * u
      root.style.setProperty('--stage-h', `${(baseline + below).toFixed(1)}px`)
      root.style.setProperty('--below', `${below.toFixed(1)}px`)
      // The readable area starts at the identity block's left edge (the content edge).
      const align = root.closest('.home')?.querySelector<HTMLElement>('[data-carousel-align]')
      const stageLeft = stage.getBoundingClientRect().left
      edge = align ? Math.max(8, align.getBoundingClientRect().left - stageLeft) : Math.max(16, W * 0.06)
      edgeRef.current = edge
      sRead = boxes.map((b) => solve((s) => extentAt(g, s, b.boxW).right, g.half - edge, 0, g.L / 2))
      written.t.fill('')
      written.o.fill('')
    }

    /**
     * The fresh-visit opening: About's left edge on the readable area's left
     * edge (under the identity block), unless that would leave the object
     * before it (Jumpstart, across the loop) more than `CAROUSEL.openingPrevShare`
     * visible on a very wide screen; then About moves further left, so it
     * is always the leftmost fully visible object.
     */
    const openingPhase = () => {
      const a = boxes[0].boxW
      const prev = boxes[N - 1].boxW
      const apart = a / 2 + g.gap + prev / 2
      let sAbout = solve((s) => extentAt(g, s, a).left, edge - g.half, -g.L / 2 + a, 0)
      const share = (s: number) => {
        const e = extentAt(g, s, prev)
        return Math.max(0, Math.min(1, (e.right + g.half) / Math.max(1, e.right - e.left)))
      }
      if (share(sAbout - apart) > CAROUSEL.openingPrevShare) {
        sAbout = solve(share, CAROUSEL.openingPrevShare, -g.L / 2, sAbout - apart) + apart
      }
      return g.base[0] - sAbout
    }

    const layout = () => {
      const P = CAROUSEL.arc.perspective * u
      for (let i = 0; i < N; i++) {
        const b = boxes[i]
        const s = g.wrap(g.base[i] - phase)
        sOf[i] = s
        const m = g.depth(s)
        const { left, right, cx } = extentAt(g, s, b.boxW)
        xOf[i] = cx
        const bottom = baseline + (m - CAROUSEL.arc.centre) * CAROUSEL.arc.floorDrop * u
        const tx = g.half + cx - b.boxW / 2
        const ty = bottom - b.boxH
        const t = `translate3d(${px(tx)}px, ${px(ty)}px, 0) scale(${m.toFixed(4)}) perspective(${P.toFixed(0)}px) rotateY(${(-g.turn(s)).toFixed(4)}rad)`
        if (t !== written.t[i]) {
          items[i].style.transform = t
          written.t[i] = t
        }
        // Fully outside the stage (with its glow): transparent. Otherwise dimmer towards the edges.
        const margin = 40 * u
        const outside = right < -g.half - margin || left > g.half + margin
        const o = outside ? '0' : dimAt(g, cx).toFixed(3)
        if (o !== written.o[i]) {
          items[i].style.opacity = o === '1.000' ? '' : o
          written.o[i] = o
        }
        const visible = Math.max(0, Math.min(right, g.half) - Math.max(left, -g.half)) / Math.max(1, right - left)
        const off = visible < CAROUSEL.minVisible
        if (off !== written.off[i]) {
          if (off) items[i].dataset.off = ''
          else delete items[i].dataset.off
          written.off[i] = off
        }
      }
    }
    /** Remembers where the carousel is for browser Back (memory and sessionStorage). */
    const save = () => {
      notePosition(locationKey, { loop: (((phase % g.L) + g.L) % g.L) / g.L })
      persistPosition(locationKey)
    }

    const running = () => !st.busy && st.hover < 0 && st.focus < 0 && st.onScreen && st.pageVisible
    /** The extra speed from recent wheel events (0 to CAROUSEL.wheel.max), before smoothing. */
    const wheelBoost = (now: number) => {
      const k = (now - boost.at) / CAROUSEL.wheel.easeMs
      return k >= 1 ? 0 : (boost.level * (1 + Math.cos(Math.PI * Math.max(0, k)))) / 2
    }
    const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

    const tick = (now: number) => {
      raf = 0
      if (st.glide) {
        const k = Math.min(1, (now - st.glide.t0) / CAROUSEL.focusGlideMs)
        phase = st.glide.from + (st.glide.to - st.glide.from) * ease(k)
        if (k >= 1) st.glide = null
        layout()
        placeCaption()
        last = 0
        raf = requestAnimationFrame(tick)
        return
      }
      if (!running()) {
        last = 0
        boost.eff = 0
        return
      }
      const dtMs = last ? Math.min(now - last, CAROUSEL.maxStep * 1000) : 0
      last = now
      const target = wheelBoost(now)
      boost.eff += (target - boost.eff) * (1 - Math.exp(-dtMs / CAROUSEL.wheel.smoothMs))
      boost.eff = Math.min(CAROUSEL.wheel.max, Math.max(0, boost.eff))
      // Fresh opening: ease in from rest (smoothstep of the elapsed share), then a constant speed.
      let ramp = 1
      if (rampMs < CAROUSEL.startRampMs) {
        rampMs += dtMs
        const k = Math.min(1, rampMs / CAROUSEL.startRampMs)
        ramp = k * k * (3 - 2 * k)
      }
      phase += CAROUSEL.speed * u * Math.max(ramp, boost.eff) * (1 + boost.eff) * (dtMs / 1000) * debugScale()
      if (phase > g.L * 1000) phase -= g.L * 1000
      layout()
      if (now >= recheckAt) {
        recheckAt = now + CAROUSEL.recheckMs
        recheckHover()
      }
      raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf && (running() || st.glide)) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    /** Shows the active object's sentence under it (the carousel is paused while one is active), or fades it out. */
    const placeCaption = () => {
      const i = st.active
      if (i >= 0) setCaption({ index: i, visible: true, x: g.half + xOf[i] })
      else setCaption((c) => (c.visible ? { ...c, visible: false } : c))
    }
    /** Hover wins over keyboard focus; either pauses the whole carousel. */
    const update = () => {
      const next = st.hover >= 0 ? st.hover : st.focus
      if (next !== st.active) {
        if (st.active >= 0) delete items[st.active].dataset.active
        if (next >= 0) items[next].dataset.active = ''
        st.active = next
        placeCaption()
      }
      kick()
    }

    measure()
    const saved = recallPosition(locationKey, navigationType)
    phase = saved?.loop !== undefined ? saved.loop * g.L : openingPhase()
    if (saved) rampMs = Infinity
    layout()
    root.dataset.ready = 'true'

    // Pointer. Only an object's silhouette (and About's label) takes pointer
    // events, so the browser reports leaving whenever the pointer is between
    // objects; after leaving, a short grace lets it cross into the caption
    // region (which keeps the pause) or back.
    const indexOf = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return -1
      const li = el.closest<HTMLElement>('[data-index]')
      return li && root.contains(li) && el.closest('[data-hit]') ? Number(li.dataset.index) : -1
    }
    const inBand = (el: EventTarget | null) => el instanceof Node && band.contains(el)
    const pointer = { inside: false, x: 0, y: 0 }
    let grace = 0
    const clearGrace = () => {
      window.clearTimeout(grace)
      grace = 0
    }
    const setHover = (i: number) => {
      clearGrace()
      if (st.hover !== i) {
        st.hover = i
        update()
      }
    }
    const leaveSoon = () => {
      if (st.hover < 0 || grace) return
      grace = window.setTimeout(() => {
        grace = 0
        st.hover = -1
        update()
      }, CAROUSEL.hoverGraceMs)
    }
    function recheckHover() {
      if (!pointer.inside || st.busy) return
      const i = indexOf(document.elementFromPoint(pointer.x, pointer.y))
      if (i >= 0) setHover(i)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const onEnterRoot = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.inside = true
      onMove(e)
    }
    const onLeaveRoot = () => {
      pointer.inside = false
      leaveSoon()
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || st.busy) return
      const i = indexOf(e.target)
      if (i >= 0) setHover(i)
      else if (inBand(e.target) && st.hover >= 0) clearGrace()
    }
    const onOut = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const from = indexOf(e.target)
      const to = indexOf(e.relatedTarget)
      if (to >= 0) return // pointerover on the new object handles it
      if (from >= 0 || inBand(e.target)) {
        if (inBand(e.relatedTarget)) clearGrace()
        else leaveSoon()
      }
    }
    root.addEventListener('pointerenter', onEnterRoot)
    root.addEventListener('pointerleave', onLeaveRoot)
    root.addEventListener('pointerover', onOver)
    root.addEventListener('pointerout', onOut)
    root.addEventListener('pointermove', onMove, { passive: true })

    // Wheel over the carousel: a temporary, capped speed-up. Passive, so
    // the page keeps scrolling normally; it never changes routes.
    const onWheel = (e: WheelEvent) => {
      if (st.busy) return
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const amount = (Math.abs(e.deltaY) + Math.abs(e.deltaX)) * unit
      if (!amount) return
      const now = performance.now()
      boost.level = Math.min(CAROUSEL.wheel.max, wheelBoost(now) + amount / CAROUSEL.wheel.perPx)
      boost.at = now
      kick()
    }
    root.addEventListener('wheel', onWheel, { passive: true })

    // Keyboard focus pauses too, and glides an object that is not fully in view into the readable area.
    const onFocusIn = (e: FocusEvent) => {
      const li = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-index]') : null
      const i = li && root.contains(li) ? Number(li.dataset.index) : -1
      if (i < 0 || !(e.target instanceof Element) || !e.target.matches(':focus-visible')) return
      st.focus = i
      const s = sOf[i]
      const limit = sRead[i]
      if (Math.abs(s) > limit) {
        const target = Math.sign(s) * limit * 0.985
        st.glide = { from: phase, to: phase + (s - target), t0: performance.now() }
      }
      update()
    }
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return
      st.focus = -1
      update()
    }
    root.addEventListener('focusin', onFocusIn)
    root.addEventListener('focusout', onFocusOut)

    const io = new IntersectionObserver(([entry]) => {
      st.onScreen = entry.isIntersecting
      kick()
    })
    io.observe(stage)
    const onVisibility = () => {
      st.pageVisible = document.visibilityState === 'visible'
      if (!st.pageVisible) save()
      kick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const onPageHide = () => save()
    window.addEventListener('pagehide', onPageHide)
    // Width changes (the stage) and height-only changes (the size factor follows the window height).
    let resizeFrame = 0
    const remeasure = () => {
      resizeFrame = 0
      const at = phase / g.L
      measure()
      phase = at * g.L
      layout()
      placeCaption()
    }
    const onResize = () => {
      if (!resizeFrame) resizeFrame = requestAnimationFrame(remeasure)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    window.addEventListener('resize', onResize)

    controls.current = {
      // A project is opening: everything stops where it is; the others dim.
      freeze: (i) => {
        st.busy = true
        st.glide = null
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
    }

    if (import.meta.env.DEV) {
      window.__homeArc = {
        phase: () => phase,
        loop: () => g.L,
        speed: () => CAROUSEL.speed * u * (1 + boost.eff),
        state: () => ({ hover: st.hover, focus: st.focus, busy: st.busy, running: running(), boost: boost.eff }),
        seek: (p) => {
          phase = p
          layout()
        },
        timeScale: window.__homeArc?.timeScale ?? 1,
      }
    }

    kick()
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener('resize', onResize)
      clearGrace()
      io.disconnect()
      ro.disconnect()
      save()
      controls.current = null
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      root.removeEventListener('pointerenter', onEnterRoot)
      root.removeEventListener('pointerleave', onLeaveRoot)
      root.removeEventListener('pointerover', onOver)
      root.removeEventListener('pointerout', onOut)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('wheel', onWheel)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
    // A new history entry for / (e.g. the home link on the homepage) starts over with the right opening.
  }, [locationKey, navigationType])

  const onOpen = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    const item = CAROUSEL_ITEMS[i]
    const source = itemRefs.current[i]?.querySelector<HTMLElement>('[data-cover-source]') ?? null
    const result: string = openProject({ path: item.path, source, navigate, onCancel: () => controls.current?.resume(i) })
    if (result === 'cover' || result === 'tile') controls.current?.freeze(i)
  }

  const shown = caption.index >= 0 ? CAROUSEL_ITEMS[caption.index] : null

  return (
    <div ref={rootRef} className="harc" data-paused={caption.visible || undefined}>
      <div ref={stageRef} className="harc__stage">
        <ul className="harc__list" role="list">
          {CAROUSEL_ITEMS.map((item, i) => (
            <li
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className="harc__item hobj"
              data-index={i}
              data-kind={item.kind}
              style={accentVars(item.id)}
            >
              <a
                ref={(el) => {
                  linkRefs.current[i] = el
                }}
                href={item.path}
                className="hobj__link"
                draggable={false}
                aria-describedby={`harc-desc-${item.id}`}
                onClick={(e) => onOpen(e, i)}
                onPointerEnter={() => warm(item.path)}
                onFocus={() => warm(item.path)}
              >
                {!item.visibleLabel && <span className="visually-hidden">{item.label}</span>}
                <CarouselObject item={item} priority={i < 4 || i === N - 1} />
              </a>
              <span id={`harc-desc-${item.id}`} hidden>
                {item.sentence}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div ref={bandRef} className="harc__band" aria-hidden="true">
        <p ref={captionRef} className="harc__caption" style={shown ? accentVars(shown.id) : undefined} data-visible={caption.visible || undefined}>
          {shown && (
            <>
              <span className="harc__mark" />
              {shown.sentence}
            </>
          )}
        </p>
      </div>
    </div>
  )
}

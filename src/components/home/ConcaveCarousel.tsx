import { useLayoutEffect, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CAROUSEL } from '../../config/carousel'
import { CAROUSEL_ITEMS, type CarouselItem } from '../../content/carousel'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

/** Normalized arc position (in spacings) where the motion was when the carousel last unmounted. */
let savedPhase: number | null = null

/**
 * The homepage carousel: seven upright 3:4 image tiles (content/carousel.ts):
 * the six projects, each with one supplied artwork (`project.cover`, from
 * `final tiles/`), then About Me with the headshot, which opens /about.
 *
 * - `moving` (fine pointer, motion allowed): the tiles stand on a shallow
 *   concave arc and travel at one constant speed.
 * - `static` (reduced motion on a wide screen): the same arc, frozen, with
 *   all seven tiles in view.
 * - the swipe row (touch or coarse pointers, windows narrower than
 *   CAROUSEL.arcMinWidth, reduced motion on narrower screens): a flat,
 *   horizontally swipeable row where every name, description and action
 *   label is always visible and a tap opens the tile's page.
 *
 * Each tile is ONE link: the tile (the image fills it) and its caption.
 * Names, labels and descriptions are live HTML outside the image.
 */
export function ConcaveCarousel() {
  const reduced = useReducedMotion()
  const touch = useMediaQuery(CAROUSEL.touchQuery)
  const narrow = useMediaQuery(`(max-width: ${CAROUSEL.arcMinWidth - 0.02}px)`)
  const wide = useMediaQuery(`(min-width: ${CAROUSEL.staticArcMinWidth}px)`)
  const row = touch || narrow || (reduced && !wide)
  return row ? <SwipeRow /> : <Arc key={reduced ? 'static' : 'moving'} moving={!reduced} />
}

/**
 * The tile artwork: a soft grounding shadow, then the inner wrapper (hover
 * lift and the route transition act on it, never on the positioning
 * element) holding the rounded frame the image fills.
 */
function Tile({ item, sizes, priority, liftRef }: { item: CarouselItem; sizes: string; priority: boolean; liftRef?: (el: HTMLElement | null) => void }) {
  return (
    <>
      <span className="arc-tile__floor" aria-hidden="true" />
      <span ref={liftRef} className="arc-tile__lift" data-transition="tile">
        <span className="arc-tile__frame">
          <ResponsiveImage image={item.cover} sizes={sizes} decorative fit="cover" priority={priority} />
        </span>
      </span>
    </>
  )
}

function Caption({ item, id, className, captionRef }: { item: CarouselItem; id: string; className: string; captionRef?: (el: HTMLElement | null) => void }) {
  return (
    <span ref={captionRef} className={className}>
      <span className="arc-caption__name" id={`${id}-name`}>
        {item.name}
      </span>
      <span className="arc-caption__cta" id={`${id}-cta`}>
        {item.action}
        <span aria-hidden="true"> ↗</span>
      </span>
      <span className="arc-caption__desc" id={`${id}-desc`}>
        {item.description}
      </span>
    </span>
  )
}

const ARC_SIZES = '(min-width: 1100px) 400px, 300px'
const STATIC_SIZES = '240px'
const ROW_SIZES = '260px'

interface Controls {
  freeze: (i: number) => void
  resume: (i: number) => void
}

/**
 * The concave arc. A tile at arc position s turns by θ = s / R and is
 * placed with `perspective(p) translateZ(R) rotateY(-θ) translateZ(-R)`
 * (every tile shares the same untransformed box at the stage centre, so
 * they share one vanishing point): the centre tile faces the viewer at its
 * natural size, tiles towards the edges turn inward and come closer. One
 * phase (arc length) drives every tile; transforms are written directly in
 * an animation-frame loop (no React state per frame). By default hovering
 * does NOT stop the carousel (Harlie's instruction: the tiles keep moving;
 * CAROUSEL.pauseOnHover switches this): the tile under the pointer lifts
 * and shows its description while it passes, and drops back as it travels
 * out from under the pointer. The loop stops while a tile has keyboard
 * focus, while a project is opening, while the page is hidden or the
 * carousel is off screen; motion resumes from the exact paused position.
 *
 * Captions are flat HTML placed under each tile's projected lower edge
 * (never rotated), at a constant size. A caption fades out before its box
 * reaches the stage edge. A tile stays a working link while at least
 * CAROUSEL.minVisible of it is inside the stage (so a tile that looks
 * clickable is clickable); hovering an edge tile whose caption has faded
 * brings the caption back, moved inward just enough to stay whole. Tiles
 * mostly outside the stage take no pointer events. Tiles are recycled from
 * one end of the wall to the other only where they are fully outside the
 * stage (and faded, as a safety).
 *
 * Static arc (reduced motion): the spacing is set by the stage width (all
 * seven in view), and each caption is at most the spacing less
 * CAROUSEL.captionGap wide (a long name wraps), so neighbouring names and
 * links never meet.
 *
 * Keyboard: all seven links are in the tab order (tile order); focusing one
 * pauses the carousel and, if that tile is outside the readable area,
 * glides it in.
 */
function Arc({ moving }: { moving: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const tileRefs = useRef<Array<HTMLElement | null>>([])
  const liftRefs = useRef<Array<HTMLElement | null>>([])
  const captionRefs = useRef<Array<HTMLElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const controls = useRef<Controls | null>(null)
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const root = rootRef.current
    const n = CAROUSEL_ITEMS.length
    const items = itemRefs.current.slice(0, n)
    const tiles = tileRefs.current.slice(0, n)
    const captions = captionRefs.current.slice(0, n)
    const links = linkRefs.current.slice(0, n)
    if (!root || items.some((x) => !x) || tiles.some((x) => !x) || captions.some((x) => !x) || links.some((x) => !x)) return
    const stage = root.querySelector<HTMLElement>('.arc__stage') ?? root
    const cfg = moving ? CAROUSEL.arc : CAROUSEL.still

    // Geometry (px), from the measured stage and tile boxes.
    const g = { W: 0, cw: 0, bh: 0, bw: 0, yc: 0, S: 1, L: 6, R: 1, p: 1, capW: 0, capGap: 0, speed: 0, sRead: 0, fadeEnd: 0, fadeLength: 1 }
    const st = {
      hover: -1,
      focus: -1,
      active: -1,
      onScreen: true,
      pageVisible: document.visibilityState === 'visible',
      busy: false,
      glide: null as null | { from: number; to: number; t0: number },
    }
    let phase = 0
    let raf = 0
    let last = 0
    let grace = 0
    const sOf = new Array<number>(n).fill(0)
    const fadeOf = new Array<number>(n).fill(1)
    const xOf = new Array<number>(n).fill(0)
    /** Width of each caption's always-visible part (name and "View case study"), and of its description. */
    const textW = new Array<number>(n).fill(0)
    const descW = new Array<number>(n).fill(0)
    const written = {
      tile: new Array<string>(n).fill(''),
      caption: new Array<string>(n).fill(''),
      fade: new Array<string>(n).fill(''),
      op: new Array<string>(n).fill(''),
      off: new Array<boolean | null>(n).fill(null),
    }
    const dpr = window.devicePixelRatio || 1
    const snap = (v: number) => Math.round(v * dpr) / dpr

    const wrap = (s: number) => ((((s + g.L / 2) % g.L) + g.L) % g.L) - g.L / 2
    /** Horizontal screen offset of the centre of a tile at angle θ (relative to the stage centre), per unit radius. */
    const f = (theta: number) => (cfg.perspective * Math.sin(theta)) / (cfg.perspective - 1 + Math.cos(theta))
    /** Screen position (relative to the stage centre and the tiles' centre line) of the point (u, v) on a tile at angle θ. */
    const project = (u: number, v: number, theta: number) => {
      const X = g.R * Math.sin(theta) + u * Math.cos(theta)
      const Z = u * Math.sin(theta) + g.R * (1 - Math.cos(theta))
      const k = g.p / (g.p - Z)
      return { x: X * k, y: v * k }
    }
    /**
     * Caption box and its fade for a tile at arc position s. The fade
     * depends on the width of the visible text (`width`), so a name is fully
     * readable or fully faded before it could meet the stage edge.
     */
    const captionAt = (s: number, width: number, fadeLength: number) => {
      const theta = s / g.R
      const cx = project(0, 0, theta).x
      const bottom = Math.max(project(-g.bw / 2, g.bh / 2, theta).y, project(g.bw / 2, g.bh / 2, theta).y)
      const room = g.W / 2 - Math.abs(cx) - width / 2 - g.fadeEnd
      const fade = Math.max(0, Math.min(1, room / fadeLength))
      return { x: g.W / 2 + cx - g.capW / 2, y: g.yc + bottom + g.capGap, fade }
    }

    const measure = () => {
      const tile = tiles[0] as HTMLElement
      g.W = stage.clientWidth
      g.cw = tile.offsetWidth
      const ch = tile.offsetHeight
      // The image fills the tile, so the visible body is the whole box.
      g.bh = ch
      g.bw = g.cw
      g.yc = tile.offsetTop + ch / 2
      const cs = getComputedStyle(root)
      g.capGap = parseFloat(cs.getPropertyValue('--cap-gap')) || 12
      g.fadeEnd = CAROUSEL.captionFadeEnd + (g.W * CAROUSEL.edgeMask) / 2
      const measureText = () => {
        captions.forEach((c, i) => {
          const el = c as HTMLElement
          const name = el.querySelector<HTMLElement>('.arc-caption__name')
          const cta = el.querySelector<HTMLElement>('.arc-caption__cta')
          const desc = el.querySelector<HTMLElement>('.arc-caption__desc')
          textW[i] = Math.max(name?.offsetWidth ?? 0, cta?.offsetWidth ?? 0)
          descW[i] = desc?.offsetWidth ?? 0
        })
        return Math.max(...textW)
      }
      let widest: number
      if (moving) {
        widest = measureText()
        g.capW = parseFloat(cs.getPropertyValue('--cap-w')) || CAROUSEL.captionWidth
        g.fadeLength = CAROUSEL.captionFadeLength
        g.S = Math.max(CAROUSEL.arc.spacing * g.W, CAROUSEL.arc.minSpacing * g.cw, widest + CAROUSEL.captionGap)
        g.R = g.S / cfg.step
      } else {
        // All seven in view: the outer tiles (±3 spacings) keep their names
        // inside the stage. The spacing follows from the stage width, so each
        // caption is limited to the spacing less the gap between neighbours
        // (a long name wraps: home.css); narrower names leave more room, so
        // this settles in a few passes.
        g.fadeLength = 8
        g.capW = CAROUSEL.still.maxCaption
        for (let pass = 0; pass < 4; pass++) {
          root.style.setProperty('--cap-w', `${g.capW}px`)
          widest = measureText()
          const room = Math.max(g.W / 2 - widest / 2 - g.fadeEnd - g.fadeLength, 40)
          g.R = room / f(((n - 1) / 2) * cfg.step)
          g.S = cfg.step * g.R
          const capW = Math.floor(Math.min(CAROUSEL.still.maxCaption, g.S - CAROUSEL.captionGap))
          if (capW === g.capW) break
          g.capW = capW
        }
        root.style.setProperty('--cap-w', `${g.capW}px`)
        widest = measureText()
      }
      g.p = cfg.perspective * g.R
      g.L = n * g.S
      g.speed = (CAROUSEL.speed * g.bh) / CAROUSEL.referenceBodyHeight
      // The largest |s| at which every name is fully readable (keyboard focus glides a tile there).
      let lo = 0
      let hi = g.L / 2
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2
        if (captionAt(mid, widest, g.fadeLength).fade >= 1) lo = mid
        else hi = mid
      }
      g.sRead = lo
      written.tile.fill('')
      written.caption.fill('')
    }

    const layout = () => {
      for (let i = 0; i < n; i++) {
        const s = wrap(i * g.S - phase)
        sOf[i] = s
        const theta = s / g.R
        const t = `perspective(${g.p.toFixed(1)}px) translateZ(${g.R.toFixed(2)}px) rotateY(${(-theta).toFixed(5)}rad) translateZ(${(-g.R).toFixed(2)}px)`
        if (t !== written.tile[i]) {
          ;(tiles[i] as HTMLElement).style.transform = t
          written.tile[i] = t
        }
        // A safety fade just before the recycling point (normally far outside the stage).
        const edge = g.L / 2 - Math.abs(s)
        const op = Math.min(1, edge / (CAROUSEL.recycleFade * g.S))
        const opText = op >= 1 ? '' : op.toFixed(3)
        if (opText !== written.op[i]) {
          ;(tiles[i] as HTMLElement).style.opacity = opText
          written.op[i] = opText
        }
        const c = captionAt(s, textW[i], g.fadeLength)
        xOf[i] = c.x
        const ct = `translate3d(${snap(c.x)}px, ${snap(c.y)}px, 0)`
        if (ct !== written.caption[i]) {
          ;(captions[i] as HTMLElement).style.transform = ct
          written.caption[i] = ct
        }
        const fade = Math.min(c.fade, op)
        fadeOf[i] = fade
        const fadeText = fade.toFixed(3)
        if (fadeText !== written.fade[i]) {
          ;(captions[i] as HTMLElement).style.setProperty('--fade', fadeText)
          written.fade[i] = fadeText
        }
        // A tile mostly outside the stage (past the middle of its edge fade) is not interactive.
        const off = op <= 0.5 || visibleShare(theta) < CAROUSEL.minVisible
        if (off !== written.off[i]) {
          const item = items[i] as HTMLLIElement
          if (off) item.dataset.off = ''
          else delete item.dataset.off
          written.off[i] = off
        }
      }
    }
    /** Share of a tile's projected width inside the stage, measured to the middle of the edge fades. */
    const visibleShare = (theta: number) => {
      const a = project(-g.bw / 2, 0, theta).x
      const b = project(g.bw / 2, 0, theta).x
      const left = g.W / 2 + Math.min(a, b)
      const right = g.W / 2 + Math.max(a, b)
      const inset = (g.W * CAROUSEL.edgeMask) / 2
      return Math.max(0, Math.min(right, g.W - inset) - Math.max(left, inset)) / Math.max(1, right - left)
    }

    const running = () => moving && (!CAROUSEL.pauseOnHover || st.hover < 0) && st.focus < 0 && st.onScreen && st.pageVisible && !st.busy

    const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
    const tick = (now: number) => {
      raf = 0
      if (st.glide) {
        const k = Math.min(1, (now - st.glide.t0) / CAROUSEL.focusGlideMs)
        phase = st.glide.from + (st.glide.to - st.glide.from) * ease(k)
        if (k >= 1) st.glide = null
        layout()
        shiftDescription()
        savedPhase = phase / g.S
        last = 0
        raf = requestAnimationFrame(tick)
        return
      }
      if (!running()) {
        last = 0
        return
      }
      const dt = last ? Math.min((now - last) / 1000, CAROUSEL.maxStep) : 0
      last = now
      phase += g.speed * dt
      if (phase > g.L * 1000) phase -= g.L * 1000
      savedPhase = phase / g.S
      layout()
      recheckHover()
      shiftDescription()
      raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf && (running() || st.glide)) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    }

    const descOf = (i: number) => (captions[i] as HTMLElement).querySelector<HTMLElement>('.arc-caption__desc')
    /** Horizontal shift (px) that keeps a box starting at `left`, `width` wide, inside the readable part of the stage. */
    const inward = (left: number, width: number) => Math.round(Math.max(0, g.fadeEnd - left) - Math.max(0, left + width - (g.W - g.fadeEnd)))
    const setTranslate = (el: HTMLElement | null | undefined, shift: number) => {
      if (!el) return
      if (shift) el.style.setProperty('translate', `${shift}px 0`)
      else el.style.removeProperty('translate')
    }
    /**
     * Near the stage edges, the active tile's caption (shown whole while it
     * is active, even where it had faded) moves inward just enough for its
     * name and label to stay inside the stage, and its revealed description
     * moves on as far as it needs to as well.
     */
    const shifted = { caption: 0, desc: 0 }
    const shiftDescription = () => {
      const i = st.active
      if (i < 0) return
      const caption = inward(xOf[i] + (g.capW - textW[i]) / 2, textW[i])
      const desc = inward(xOf[i] + caption + (g.capW - descW[i]) / 2, descW[i])
      if (caption !== shifted.caption) setTranslate(captions[i], caption)
      if (desc !== shifted.desc) setTranslate(descOf(i), desc)
      shifted.caption = caption
      shifted.desc = desc
    }
    /** Hover or keyboard focus: lift that tile and reveal its description (only keyboard focus pauses the motion). */
    const update = () => {
      const next = st.hover >= 0 ? st.hover : st.focus
      if (next !== st.active) {
        if (st.active >= 0) {
          delete (items[st.active] as HTMLLIElement).dataset.active
          setTranslate(captions[st.active], 0)
          setTranslate(descOf(st.active), 0)
          shifted.caption = 0
          shifted.desc = 0
        }
        if (next >= 0) (items[next] as HTMLLIElement).dataset.active = ''
        st.active = next
        shiftDescription()
      }
      kick()
    }

    measure()
    phase = moving ? (savedPhase ?? CAROUSEL.startOffset) * g.S : ((n - 1) / 2) * g.S
    layout()
    root.dataset.ready = 'true'

    // Pointer: a tile and its caption belong to one link. Hover does not
    // pause the motion (unless CAROUSEL.pauseOnHover); it lifts the tile
    // under the pointer. Because the tiles move under a still pointer, the
    // tile under the pointer is also re-checked while the carousel moves
    // (recheckHover, a few times a second), from the last pointer position
    // in the window: only the tiles and captions take pointer events, so the
    // browser reports "leaving" the carousel whenever the pointer is between
    // tiles, although the next tile may be about to arrive under it. After
    // leaving, a short grace (scheduled once) lets the pointer cross between
    // a tile and its caption without the lift dropping and returning.
    const indexOf = (el: EventTarget | null) => {
      const link = el instanceof Element ? el.closest('.arc__link') : null
      return link ? links.indexOf(link as HTMLAnchorElement) : -1
    }
    /** The last known position of a mouse or pen in the window (`inside`: known and still in the window). */
    const pointer = { inside: false, x: 0, y: 0, checked: 0 }
    /** The tile whose lift is due to drop when `grace` fires (-1: none pending). */
    let graceFor = -1
    const clearGrace = () => {
      window.clearTimeout(grace)
      graceFor = -1
    }
    const setHover = (i: number) => {
      if (i >= 0) {
        clearGrace()
        if (st.hover !== i) {
          st.hover = i
          update()
        }
        return
      }
      // Scheduled once per leave: the re-check under a still pointer repeats
      // every few frames and must not keep postponing the drop.
      if (st.hover < 0 || graceFor === st.hover) return
      const leaving = st.hover
      clearGrace()
      graceFor = leaving
      grace = window.setTimeout(() => {
        graceFor = -1
        if (st.hover === leaving) st.hover = -1
        update()
      }, CAROUSEL.hoverGraceMs)
    }
    function recheckHover() {
      if (!pointer.inside || st.busy) return
      const now = performance.now()
      if (now - pointer.checked < 80) return
      pointer.checked = now
      setHover(indexOf(document.elementFromPoint(pointer.x, pointer.y)))
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      pointer.inside = true
      pointer.x = e.clientX
      pointer.y = e.clientY
    }
    const onLeaveRoot = () => setHover(-1)
    const onLeaveWindow = () => {
      pointer.inside = false
      setHover(-1)
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || st.busy) return
      onMove(e)
      const i = indexOf(e.target)
      if (i >= 0) setHover(i)
    }
    const onOut = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const i = indexOf(e.target)
      if (i < 0 || indexOf(e.relatedTarget) === i) return
      setHover(indexOf(e.relatedTarget))
    }
    root.addEventListener('pointerover', onOver)
    root.addEventListener('pointerout', onOut)
    root.addEventListener('pointerleave', onLeaveRoot)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)

    // Keyboard focus pauses, so the focused link stays in view and can be
    // opened (focus from a pointer click does not pause).
    const onFocusIn = (e: FocusEvent) => {
      const i = indexOf(e.target)
      if (i < 0 || !(e.target instanceof Element) || !e.target.matches(':focus-visible')) return
      st.focus = i
      if (moving && fadeOf[i] < 1 && Math.abs(sOf[i]) > g.sRead) {
        const target = Math.sign(sOf[i]) * g.sRead * 0.98
        st.glide = { from: phase, to: phase + (sOf[i] - target), t0: performance.now() }
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
    io.observe(root)
    const onVisibility = () => {
      st.pageVisible = document.visibilityState === 'visible'
      kick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const ro = new ResizeObserver(() => {
      const at = phase / g.S
      measure()
      phase = at * g.S
      layout()
    })
    ro.observe(stage)
    // Caption widths change once the web font has loaded (the stage size does not).
    let disposed = false
    void document.fonts?.ready.then(() => {
      if (disposed) return
      const at = phase / g.S
      measure()
      phase = at * g.S
      layout()
    })

    controls.current = {
      // A project is opening: everything stops where it is; the others dim.
      freeze: (i) => {
        st.busy = true
        st.glide = null
        clearGrace()
        root.dataset.leaving = ''
        ;(items[i] as HTMLLIElement).dataset.selected = ''
      },
      // The opening was cancelled (Back, another navigation): carry on.
      resume: (i) => {
        if (!root.isConnected) return
        st.busy = false
        delete root.dataset.leaving
        delete (items[i] as HTMLLIElement).dataset.selected
        kick()
      },
    }

    kick()
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearTimeout(grace)
      io.disconnect()
      ro.disconnect()
      controls.current = null
      document.removeEventListener('visibilitychange', onVisibility)
      root.removeEventListener('pointerover', onOver)
      root.removeEventListener('pointerout', onOut)
      root.removeEventListener('pointerleave', onLeaveRoot)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
      root.removeEventListener('focusin', onFocusIn)
      root.removeEventListener('focusout', onFocusOut)
    }
  }, [moving])

  const onOpen = (e: MouseEvent<HTMLAnchorElement>, i: number, path: string) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    const result = openProject({ path, source: liftRefs.current[i], navigate, onCancel: () => controls.current?.resume(i) })
    if (result === 'tile') controls.current?.freeze(i)
  }

  return (
    <div ref={rootRef} className="arc" data-mode={moving ? 'moving' : 'static'}>
      <div className="arc__stage">
        <ul className="arc__list" role="list">
          {CAROUSEL_ITEMS.map((p, i) => {
            const path = p.path
            const id = `arc-${p.id}`
            return (
              <li
                key={p.id}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="arc__item"
                data-accent={p.accent}
              >
                <a
                  ref={(el) => {
                    linkRefs.current[i] = el
                  }}
                  href={path}
                  className="arc__link"
                  draggable={false}
                  aria-labelledby={`${id}-name ${id}-cta`}
                  aria-describedby={`${id}-desc`}
                  onClick={(e) => onOpen(e, i, path)}
                  onPointerEnter={() => warmProject(path)}
                  onFocus={() => warmProject(path)}
                >
                  <span
                    ref={(el) => {
                      tileRefs.current[i] = el
                    }}
                    className="arc__tile"
                  >
                    <Tile
                      item={p}
                      sizes={moving ? ARC_SIZES : STATIC_SIZES}
                      priority={i < 4}
                      liftRef={(el) => {
                        liftRefs.current[i] = el
                      }}
                    />
                  </span>
                  <Caption
                    item={p}
                    id={id}
                    className="arc-caption arc__caption"
                    captionRef={(el) => {
                      captionRefs.current[i] = el
                    }}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** Touch, narrow windows and narrow reduced motion: a static, swipeable row. Nothing depends on hover. */
function SwipeRow() {
  const navigate = useNavigate()
  const liftRefs = useRef<Array<HTMLElement | null>>([])
  return (
    <div className="arc-row">
      <ul className="arc-row__list" role="list">
        {CAROUSEL_ITEMS.map((p, i) => {
          const path = p.path
          const id = `arc-row-${p.id}`
          return (
            <li key={p.id} className="arc-row__item" data-accent={p.accent}>
              <a
                href={path}
                className="arc-row__link"
                draggable={false}
                aria-labelledby={`${id}-name ${id}-cta`}
                aria-describedby={`${id}-desc`}
                onClick={(e) => {
                  if (!isPlainClick(e)) return
                  e.preventDefault()
                  openProject({ path, source: liftRefs.current[i], navigate })
                }}
                onPointerEnter={() => warmProject(path)}
                onPointerDown={() => warmProject(path)}
                onFocus={() => warmProject(path)}
              >
                <span className="arc-row__tile">
                  <Tile
                    item={p}
                    sizes={ROW_SIZES}
                    priority={i < 2}
                    liftRef={(el) => {
                      liftRefs.current[i] = el
                    }}
                  />
                </span>
                <Caption item={p} id={id} className="arc-caption arc-row__caption" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

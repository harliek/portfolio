/*
 * CaseScroll: the scroll-driven case study (opening + sections beside ONE
 * sticky media region). Usage note for page authors:
 *
 *   <CaseLayout project={project} className="page-x">
 *     <CaseScroll
 *       project={project}
 *       situation={<p>One short situation paragraph.</p>}
 *       note="Optional one-line boundary note, stated once."
 *       opening={{ kind: 'image', image: 'x-hero', caption: 'What the opening image shows.' }}
 *       frameRatio="16 / 10"                     // ONE ratio for every state; crops should match it
 *       sizes="(min-width: 960px) 620px, calc(100vw - 32px)"   // optional
 *       demo={{ video: 'x-video', label: 'Play dashboard demo' }}  // optional
 *       sections={[
 *         { id: 'problem', title: 'Problem', blocks: [{ id: 'p1', body: <p>…</p> }] },   // no visual: keeps the previous one
 *         { id: 'decisions', title: 'Design decisions', blocks: [
 *           { id: 'request', title: 'Request', body: <p>…</p>,
 *             visual: { kind: 'image', image: 'x-crop-request', caption: '…', highlight: { x: 10, y: 20, w: 40, h: 15 } } },
 *           { id: 'diagram', title: '…', body: <p>…</p>,
 *             visual: { kind: 'placeholder', placeholder: { id: 'x-diagram', ratio: '16 / 10', label: 'One sentence.', description: 'Full brief.' } } },
 *         ] },
 *       ]}
 *     />
 *     <Results figure={…}>…</Results>
 *     <NextProject current={project.id} />
 *   </CaseLayout>
 *
 * - Title, "Company:/Role:/Dates:/Project status:" come from `project`; do not repeat them in the copy.
 * - Section `title` is the h2; block `title` is an h3 (optional). All text is ordinary document content.
 * - `highlight` is a Rect in PERCENT OF THE IMAGE (x, y from the top-left). Mark ONE meaningful region;
 *   prefer a focused crop over a small highlight in a mostly empty screenshot.
 * - `enlarge`: the image the "Enlarge image" button opens (default: the state's image; e.g. the full
 *   conversation behind a crop). `false` hides the button for that state.
 * - Use crops whose ratio matches `frameRatio` so nothing letterboxes; transparent PNGs (phones,
 *   monitors) keep their alpha and get no backing panel.
 * - `project.hero` (projects.ts) should name the opening image with these `sizes` so the route
 *   transition preloads the same file.
 * - Placeholders: `Placeholder` (media/Placeholder.tsx) shows "Image to come" + `label` at the
 *   intended ratio; `description` is the fuller brief for docs/asset-requests.md (not shown). Report
 *   every one you add. Outside CaseScroll use <Placeholder spec={…} /> directly.
 * - Section ids become DOM ids (h2 = `${id}-title`); avoid 'results' (used by <Results>). Block ids
 *   are React keys and `data-block` values only. Keep each block to one or two short paragraphs;
 *   there is no extra spacing to "give an animation time", except that the LAST block is kept just
 *   tall enough for its visual to activate while the media region is still pinned.
 * - The demo button, "Enlarge image" and "Return to walkthrough" are rendered for you; do not add
 *   step buttons, tabs or section pills. Optional supplementary material may use a clearly labelled
 *   <details> (secondary look) inside a block body or `children`.
 * - `<NextProject current description?>`: `description` replaces the next project's sentence (e.g.
 *   CafePress UK → "A separate, later independent prototype…"), so no extra related-project link is
 *   needed. `<Results figure={{ image, caption }}>` shows a small evidence image with "Enlarge image".
 *
 * Desktop (≥960px): 44% text / 6% gap / 50% media, max 1240px. The media region is sticky from the
 * opening to the end of the last section. The active block is the last block whose top has passed a
 * line at 40% of the viewport (scroll position, rAF-throttled); the frame then waits until the next
 * image has decoded (the current one stays fully visible), removes the old highlight (60ms), fades the
 * new layer in over the old (120ms) and reveals the new highlight after it settles (150ms). Only the
 * latest target is kept, so fast or backward scrolling never plays a queue of missed changes, and
 * there is never more than one highlight. "Play … demo" shows the recording in the same frame with
 * native controls and suspends scroll switching until "Return to walkthrough".
 * Below 960px: stacked in reading order; each block is followed by its own visual.
 */
import '../../styles/case.css'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { fallbackSrc, getImage, getVideo, type ImageId, type VideoAsset, type VideoId } from '../../content/media'
import type { Project } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { CaptionText, EnlargeButton } from '../media/Figure'
import { Placeholder, type PlaceholderSpec } from '../media/Placeholder'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isTransitionPending } from '../transition/projectTransition'

export type { PlaceholderSpec }

/** A region in percent of the image (x, y from its top-left corner). */
export type Rect = { x: number; y: number; w: number; h: number }

export type Visual =
  | { kind: 'image'; image: ImageId; caption: ReactNode; highlight?: Rect; enlarge?: ImageId | false; alt?: string }
  | { kind: 'placeholder'; placeholder: PlaceholderSpec; caption?: ReactNode }

/** No `visual` = keep the previous one. */
export interface Block {
  id: string
  title?: string
  body: ReactNode
  visual?: Visual
}

/** `title` is the h2; block titles are h3. */
export interface Section {
  id: string
  title: string
  blocks: Block[]
}

export interface CaseScrollProps {
  project: Project
  /** Situation paragraph under the title and metadata (one short paragraph). */
  situation: ReactNode
  /** Optional one-line boundary note (e.g. "Independent prototype with synthetic data. No production backend.") shown once in the opening. */
  note?: ReactNode
  /** The representative visual beside the opening (state 0). */
  opening: Visual
  sections: Section[]
  /** Stable frame ratio for the sticky media region, e.g. '16 / 10' or '944 / 1744'. */
  frameRatio: string
  /** Literal `sizes` for frame images. Default '(min-width: 960px) 620px, calc(100vw - 32px)'. */
  sizes?: string
  /** A product recording that plays inside the frame. */
  demo?: { video: VideoId; label: 'Play dashboard demo' | 'Play spreadsheet demo' }
  /** Extra content inside the text column after the last section (rare). */
  children?: ReactNode
}

const DESKTOP = '(min-width: 960px)'
const DEFAULT_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'
/** Share of the viewport height where a block becomes active. */
const ACTIVATION_LINE = 0.4
/** Distance (px) between the sticky region and the end of its column at which the last block takes over. */
const END_ROOM = 12

/** Frame change timings (ms): highlight out, layer in, settle, same-image pause, highlight in. */
const T = { hlOut: 60, layerIn: 120, settle: 30, sameLayer: 60, hlIn: 150 }

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

/** '944 / 1744', '16/10' or '1.6' → a number. */
function ratioNumber(ratio: string): number {
  const [a, b] = ratio.split('/').map((s) => Number.parseFloat(s))
  const n = b ? a / b : a
  return Number.isFinite(n) && n > 0 ? n : 16 / 10
}

const layerKey = (v: Visual) => (v.kind === 'image' ? `img:${v.image}` : `ph:${v.placeholder.id}`)

const visualRatio = (v: Visual) => (v.kind === 'image' ? getImage(v.image).width / getImage(v.image).height : ratioNumber(v.placeholder.ratio))

const isTransparent = (v: Visual | undefined) => Boolean(v && v.kind === 'image' && getImage(v.image).transparent)

const hasHighlight = (v: Visual) => v.kind === 'image' && Boolean(v.highlight)

/** The variant for the current viewport (smallest suitable). */
function pickVariant(video: VideoAsset) {
  const vw = window.innerWidth
  return video.variants.find((v) => v.maxViewport !== undefined && vw <= v.maxViewport) ?? video.variants[video.variants.length - 1]
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/** True once the layer's image has loaded or failed (or there is no image). */
function isReady(layer: Element | null) {
  const img = layer?.querySelector('img')
  return !img || img.complete
}

/** Resolves when the layer's image has decoded (or failed). */
function whenDecoded(layer: Element | null): Promise<void> {
  const img = layer?.querySelector('img')
  if (!img) return Promise.resolve()
  if (img.complete) return img.naturalWidth ? img.decode().catch(() => {}) : Promise.resolve()
  return new Promise((resolve) => {
    const done = () => resolve()
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(done), { once: true })
    img.addEventListener('error', done, { once: true })
  })
}

/* ----------------------------------------------------------------------- */
/* Active block: scroll-position based (no IntersectionObserver band)       */
/* ----------------------------------------------------------------------- */

/**
 * Tracks the last block whose top has passed the activation line (-1 = the
 * opening). An external store so scroll updates never set state inside an
 * effect; the snapshot only changes when the active block changes.
 *
 * The end of the section: once the sticky region is about to be carried
 * away by the end of the grid, the last block is active even if it is too
 * short to reach the line, so its visual shows beside it without adding
 * empty space under the last paragraph.
 */
class ActiveTracker {
  private els: Array<HTMLElement | null> = []
  private column: HTMLElement | null = null
  private sticky: HTMLElement | null = null
  private active = -1
  private frame = 0
  private listeners = new Set<() => void>()
  private ro: ResizeObserver | null = null

  setEl(i: number, el: HTMLElement | null) {
    this.els[i] = el
    this.schedule()
  }

  /** The media column and its sticky region (desktop only; null when stacked). */
  setMedia(column: HTMLElement | null, sticky: HTMLElement | null) {
    this.column = column
    this.sticky = sticky
    this.schedule()
  }

  /** Drops elements beyond the current block count (after sections change). */
  setCount(n: number) {
    this.els.length = n
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.schedule)
      this.ro = new ResizeObserver(this.schedule)
      this.ro.observe(document.body)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.schedule)
      this.ro?.disconnect()
      this.ro = null
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  getSnapshot = () => this.active

  private schedule = () => {
    if (!this.frame && this.listeners.size) this.frame = requestAnimationFrame(this.measure)
  }

  private measure = () => {
    this.frame = 0
    const vh = window.innerHeight
    const line = vh * ACTIVATION_LINE
    let active = -1
    for (let i = 0; i < this.els.length; i++) {
      const el = this.els[i]
      if (!el) continue
      if (el.getBoundingClientRect().top <= line) active = i
      else break
    }
    const last = this.els.length - 1
    const lastEl = this.els[last]
    if (active < last && lastEl && this.column && this.sticky) {
      const room = this.column.getBoundingClientRect().bottom - this.sticky.getBoundingClientRect().bottom
      if (room < END_ROOM && lastEl.getBoundingClientRect().top < vh * 0.8) active = last
    }
    if (active !== this.active) {
      this.active = active
      this.listeners.forEach((l) => l())
    }
  }
}

/* ----------------------------------------------------------------------- */
/* Frame sequencer: decode first, one highlight, only the latest target     */
/* ----------------------------------------------------------------------- */

/** What React renders from the sequencer: the shown state (caption, alt, Enlarge) and whose highlight exists. */
interface View {
  front: number
  /** The state whose highlight element is mounted (at most one exists). */
  hl: number
}

interface SequencerConfig {
  target: number
  paused: boolean
  reduced: boolean
  keys: string[]
  highlights: boolean[]
}

/**
 * Drives the frame. Layer visibility (`data-state`) and the highlight
 * (`data-on`) are set here directly on the DOM, and every fade is a Web
 * Animation that is awaited, so the old layer is hidden only after the new
 * one has completely appeared (CSS transitions can start late or end early
 * during fast scrolling). React renders the layers once and re-renders only
 * the caption, alt text and controls from `view`.
 */
class FrameSequencer {
  view: View = { front: 0, hl: 0 }
  private cfg: SequencerConfig = { target: 0, paused: false, reduced: false, keys: [], highlights: [] }
  private root: HTMLElement | null = null
  private running = false
  private alive = true
  private wake: (() => void) | null = null
  private listeners = new Set<() => void>()
  private anims = new Set<Animation>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => this.view

  /** Before the first paint: the current state's layer is shown, everything else hidden (its highlight follows once the image has decoded). */
  attach(root: HTMLElement | null, cfg: SequencerConfig) {
    this.root = root
    this.cfg = cfg
    this.alive = true
    this.showOnly(this.view.front)
  }

  destroy() {
    this.alive = false
    this.wake?.()
    this.anims.forEach((a) => a.cancel())
    this.anims.clear()
  }

  configure(cfg: SequencerConfig) {
    const resumed = this.cfg.paused && !cfg.paused
    this.cfg = cfg
    this.wake?.()
    if (cfg.paused || !this.alive) return
    // Back from the demo: show the current position's visual at once when it is ready.
    if (resumed && cfg.target !== this.view.front && isReady(this.layer(cfg.target))) {
      this.showOnly(cfg.target)
      this.set({ front: cfg.target, hl: cfg.target })
    }
    void this.run()
  }

  private set(patch: Partial<View>) {
    this.view = { ...this.view, ...patch }
    this.listeners.forEach((l) => l())
  }

  private layer(state: number) {
    return this.root?.querySelector<HTMLElement>(`[data-layer="${CSS.escape(this.cfg.keys[state] ?? '')}"]`) ?? null
  }

  private hlEl(state: number) {
    return this.layer(state)?.querySelector<HTMLElement>('.cs-hl') ?? null
  }

  private showOnly(state: number) {
    const front = this.layer(state)
    this.root?.querySelectorAll<HTMLElement>('[data-layer]').forEach((el) => {
      el.dataset.state = el === front ? 'shown' : 'hidden'
    })
  }

  /**
   * Animates opacity and resolves when the animation has really finished
   * (at once with reduced motion). The end value holds until the returned
   * release function is called, after the final states are in place.
   */
  private async fade(el: HTMLElement | null, from: number, to: number, ms: number, easing = 'linear'): Promise<() => void> {
    if (!el || this.cfg.reduced || ms <= 0) return () => {}
    const anim = el.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing, fill: 'both' })
    this.anims.add(anim)
    await anim.finished.catch(() => {})
    return () => {
      anim.cancel()
      this.anims.delete(anim)
    }
  }

  private async highlight(state: number, on: boolean) {
    const el = this.hlEl(state)
    if (!el || el.hasAttribute('data-on') === on) return
    if (on) el.dataset.on = ''
    else delete el.dataset.on
    const release = await this.fade(el, on ? 0 : 1, on ? 1 : 0, on ? T.hlIn : T.hlOut, on ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'linear')
    release()
  }

  /** Waits for the state's image, or returns early when the target changes. */
  private ready(state: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.wake = () => resolve()
      void whenDecoded(this.layer(state)).then(() => resolve())
    }).then(() => {
      this.wake = null
    })
  }

  private stale(next: number) {
    return !this.alive || this.cfg.paused || this.cfg.target !== next
  }

  private wait(ms: number) {
    return wait(this.cfg.reduced ? 0 : ms)
  }

  private async run() {
    if (this.running) return
    this.running = true
    try {
      // Bounded: each pass either settles or follows a newer target (never a queue of old ones).
      for (let pass = 0; pass < 64 && this.alive && !this.cfg.paused; pass++) {
        const next = this.cfg.target
        const current = this.view.front
        if (next === current) {
          // Settled: make sure the current state's highlight is showing (never over an image still loading).
          if (this.cfg.highlights[current]) {
            await this.ready(current)
            if (this.stale(next)) continue
            if (this.view.hl !== current) {
              this.set({ hl: current })
              await this.wait(T.settle)
              if (this.stale(next)) continue
            }
            await this.highlight(current, true)
            if (this.stale(next)) continue
          }
          return
        }
        await this.ready(next)
        if (this.stale(next)) continue
        // 1. The old highlight goes first.
        await this.highlight(this.view.hl, false)
        if (this.stale(next)) continue
        const from = this.view.front
        const oldLayer = this.layer(from)
        const newLayer = this.layer(next)
        if (oldLayer === newLayer) {
          // 2a. Same image: only the highlight moves.
          this.set({ front: next, hl: next })
          await this.wait(T.sameLayer)
        } else if (this.cfg.reduced || !oldLayer || !newLayer) {
          this.showOnly(next)
          this.set({ front: next, hl: next })
          await this.wait(T.settle)
        } else {
          // 2b. A clean, short image change: the new layer fades in on top while the old one stays
          // fully visible underneath (transparent artwork: the old one fades out at the same time).
          const crossfade = isTransparentLayer(oldLayer) || isTransparentLayer(newLayer)
          oldLayer.dataset.state = 'under'
          newLayer.dataset.state = 'shown'
          this.set({ front: next, hl: next })
          const releases = await Promise.all([this.fade(newLayer, 0, 1, T.layerIn), crossfade ? this.fade(oldLayer, 1, 0, T.layerIn) : () => {}])
          oldLayer.dataset.state = 'hidden'
          releases.forEach((release) => release())
          await this.wait(T.settle)
        }
        if (this.stale(next)) continue
        // 3. The new highlight, once the image has settled.
        if (this.cfg.highlights[next]) await this.highlight(next, true)
      }
    } finally {
      this.running = false
    }
  }
}

const isTransparentLayer = (el: HTMLElement) => el.hasAttribute('data-transparent')

/* ----------------------------------------------------------------------- */
/* Media frame                                                              */
/* ----------------------------------------------------------------------- */

interface FrameProps {
  /** Visual states (the sticky frame: all; an inline figure: one). */
  states: Visual[]
  target: number
  /** Frame ratio string (stable for the sticky frame). */
  ratio: string
  sizes: string
  demo?: CaseScrollProps['demo']
  /** Carries data-case-hero for the route transition. */
  hero?: boolean
  /** Eager-load the first state's image with high priority. */
  priority?: boolean
  variant: 'sticky' | 'inline'
}

/** `data-on` is set by the sequencer, never by React. */
function HighlightBox({ rect, dim }: { rect: Rect; dim: boolean }) {
  const style = { left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` } as CSSProperties
  return <span className="cs-hl" data-dim={dim || undefined} style={style} aria-hidden="true" />
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  )
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M6 3.5 2.5 7 6 10.5M2.8 7h6.7a4 4 0 0 1 0 8H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * One media frame: every state's layer is mounted (the images preload at
 * low priority), the sequencer decides which is shown, one highlight at
 * most, and an optional demo recording in the same frame.
 */
function MediaFrame({ states, target, ratio, sizes, demo, hero = false, priority = false, variant }: FrameProps) {
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const frameRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const highlights = states.map(hasHighlight)
  const keys = states.map(layerKey)
  const [sequencer] = useState(() => new FrameSequencer())
  const view = useSyncExternalStore(sequencer.subscribe, sequencer.getSnapshot, sequencer.getSnapshot)
  // Demo: 'off' → the walkthrough; 'on' → the recording (playing, paused or ended) until Return.
  const [demoOn, setDemoOn] = useState(false)
  const [demoSrc, setDemoSrc] = useState<string | null>(null)
  const [focusAfter, setFocusAfter] = useState<'video' | 'play' | null>(null)
  // Hidden until the route transition (projectTransition.ts) reveals it; read once, so React never re-adds it.
  const [pending] = useState(() => hero && isTransitionPending(pathname))

  const keysSig = keys.join('|')
  const highlightsSig = highlights.join('|')
  // Before the first paint: the current layer is visible (the frame is never empty).
  useLayoutEffect(() => {
    sequencer.attach(frameRef.current, { target: 0, paused: false, reduced: prefersReducedMotion(), keys: keysSig.split('|'), highlights: highlightsSig.split('|').map((v) => v === 'true') })
    return () => sequencer.destroy()
  }, [sequencer, keysSig, highlightsSig])
  useEffect(() => {
    sequencer.configure({ target, paused: demoOn, reduced, keys: keysSig.split('|'), highlights: highlightsSig.split('|').map((v) => v === 'true') })
  }, [sequencer, target, demoOn, reduced, keysSig, highlightsSig])

  // Start the recording after the click, then move focus to its native controls.
  useEffect(() => {
    if (focusAfter === 'video') {
      const el = videoRef.current
      // A stacked frame may sit partly above the viewport when its button is pressed: bring the player into view.
      const frame = frameRef.current
      if (variant === 'inline' && frame) {
        const top = frame.getBoundingClientRect().top
        const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
        if (top < header) frame.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
      el?.focus({ preventScroll: true })
      el?.play().catch(() => {
        /* A refused play still leaves the native controls. */
      })
    } else if (focusAfter === 'play') {
      playRef.current?.focus({ preventScroll: true })
    }
  }, [focusAfter, variant])

  // Safety net: if the route transition never reveals this frame (e.g. it was remounted by a resize
  // mid-transition), show it anyway.
  useEffect(() => {
    if (!pending) return
    const id = window.setTimeout(() => frameRef.current?.removeAttribute('data-transition-pending'), 2500)
    return () => window.clearTimeout(id)
  }, [pending])

  const video = demo ? getVideo(demo.video) : null
  const front = states[view.front]
  const frontKey = keys[view.front]
  const hlState = states[view.hl]
  const hlKey = keys[view.hl]

  // Unique layers, in order of first appearance (the opening first).
  const layers: Array<{ key: string; visual: Visual; index: number }> = []
  states.forEach((v, index) => {
    if (!layers.some((l) => l.key === keys[index])) layers.push({ key: keys[index], visual: v, index })
  })

  const shownVisual = front
  const enlargeTarget = shownVisual.kind === 'image' && shownVisual.enlarge !== false ? (shownVisual.enlarge ?? shownVisual.image) : null

  const startDemo = () => {
    if (!video) return
    setDemoSrc((src) => src ?? pickVariant(video).src)
    setDemoOn(true)
    setFocusAfter('video')
  }
  const endDemo = () => {
    videoRef.current?.pause()
    setDemoOn(false)
    setFocusAfter('play')
  }

  const frameR = ratioNumber(ratio)
  const frameStyle = { '--cs-frame-r': frameR, aspectRatio: ratio } as CSSProperties

  return (
    <div className="cs-mf" data-variant={variant} data-portrait={frameR < 0.9 || undefined}>
      <figure className="cs-figure">
        <div
          ref={frameRef}
          className="cs-frame"
          style={frameStyle}
          data-demo={demoOn || undefined}
          data-state={view.front}
          data-target={target}
          data-case-hero={hero ? '' : undefined}
          data-transition-pending={pending ? 'true' : undefined}
        >
          {layers.map(({ key, visual, index }) => {
            const isFront = key === frontKey
            const r = visualRatio(visual)
            const transparent = isTransparent(visual)
            const frontVisual = isFront ? shownVisual : visual
            const hl = key === hlKey && hlState.kind === 'image' && hlState.highlight ? hlState.highlight : null
            return (
              // data-state (shown / under / hidden) is set by the sequencer.
              <div key={key} className="cs-layer" data-layer={key} data-transparent={transparent || undefined} aria-hidden={!isFront || demoOn || undefined}>
                <div className="cs-canvas" style={{ '--r': r } as CSSProperties}>
                  {visual.kind === 'image' ? (
                    <ResponsiveImage
                      image={visual.image}
                      sizes={sizes}
                      fit="contain"
                      priority={priority && index === 0}
                      loading={priority && index === 0 ? undefined : variant === 'sticky' ? 'eager' : 'lazy'}
                      fetchPriority={priority && index === 0 ? undefined : variant === 'sticky' ? 'low' : 'auto'}
                      alt={frontVisual.kind === 'image' ? frontVisual.alt : undefined}
                    />
                  ) : (
                    <Placeholder spec={visual.placeholder} fill />
                  )}
                  {hl && <HighlightBox rect={hl} dim={!transparent} />}
                </div>
              </div>
            )
          })}
          {video && demoSrc && (
            <div className="cs-layer cs-layer--video" data-state={demoOn ? 'shown' : 'hidden'} aria-hidden={!demoOn || undefined}>
              <div className="cs-canvas" style={{ '--r': video.width / video.height } as CSSProperties}>
                <video
                  ref={videoRef}
                  className="cs-video"
                  src={demoSrc}
                  poster={fallbackSrc(getImage(video.poster), 1600)}
                  width={video.width}
                  height={video.height}
                  controls
                  playsInline
                  preload="auto"
                  tabIndex={demoOn ? undefined : -1}
                  aria-label={video.title}
                />
              </div>
            </div>
          )}
        </div>
        <figcaption className="cs-caption" aria-live={variant === 'sticky' ? 'polite' : undefined}>
          {demoOn && video ? (
            <CaptionText provenance={video.provenance}>{video.caption}</CaptionText>
          ) : shownVisual.kind === 'image' ? (
            <CaptionText provenance={getImage(shownVisual.image).provenance}>{shownVisual.caption}</CaptionText>
          ) : (
            shownVisual.caption
          )}
        </figcaption>
      </figure>
      {(video || enlargeTarget || variant === 'sticky') && (
        <div className="cs-controls">
          {video &&
            (demoOn ? (
              <button type="button" className="button button--secondary cs-return" onClick={endDemo}>
                <ReturnIcon />
                Return to walkthrough
              </button>
            ) : (
              <button ref={playRef} type="button" className="button cs-play" onClick={startDemo}>
                <PlayIcon />
                {demo?.label}
              </button>
            ))}
          {!demoOn && enlargeTarget && (
            <EnlargeButton image={enlargeTarget} caption={shownVisual.kind === 'image' && enlargeTarget === shownVisual.image ? shownVisual.caption : undefined} />
          )}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* CaseScroll                                                               */
/* ----------------------------------------------------------------------- */

function Meta({ project }: { project: Project }) {
  const rows = [
    ['Company:', project.meta.company],
    ['Role:', project.meta.role],
    ['Dates:', project.meta.dates],
    ['Project status:', project.meta.status],
  ] as const
  return (
    <dl className="cs-meta">
      {rows.map(([label, value]) => (
        <div key={label} className="cs-meta__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

const asProse = (node: ReactNode) => (typeof node === 'string' ? <p>{node}</p> : node)

export function CaseScroll({ project, situation, note, opening, sections, frameRatio, sizes = DEFAULT_SIZES, demo, children }: CaseScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new ActiveTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)

  // Visual states: the opening, then every block that brings a visual.
  const states: Visual[] = [opening]
  const blockState: number[] = []
  const blocks: Array<{ block: Block; section: Section; index: number }> = []
  sections.forEach((section) => {
    section.blocks.forEach((block) => {
      if (block.visual) states.push(block.visual)
      blockState.push(states.length - 1)
      blocks.push({ block, section, index: blocks.length })
    })
  })
  const target = active < 0 ? 0 : (blockState[active] ?? 0)
  const blockCount = blocks.length
  useEffect(() => tracker.setCount(blockCount), [tracker, blockCount])

  // The sticky region's height (--cs-media-h): the last block is just tall enough to keep the
  // region pinned until it is active (case.css), so no state is skipped at the end.
  const gridRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const grid = gridRef.current
    const sticky = grid?.querySelector<HTMLElement>('.cs-sticky')
    if (!desktop || !grid || !sticky) return
    const write = () => grid.style.setProperty('--cs-media-h', `${Math.ceil(sticky.offsetHeight)}px`)
    write()
    const ro = new ResizeObserver(write)
    ro.observe(sticky)
    return () => {
      ro.disconnect()
      grid.style.removeProperty('--cs-media-h')
    }
  }, [desktop])

  return (
    <div ref={gridRef} className="cs" data-layout={desktop ? 'sticky' : 'stacked'}>
      <header className="cs-opening">
        <h1 className="cs-title" tabIndex={-1}>
          {project.name}
        </h1>
        <Meta project={project} />
        {note && <div className="cs-note">{asProse(note)}</div>}
        <div className="cs-situation case-prose">{asProse(situation)}</div>
      </header>

      {desktop ? (
        <div className="cs-media" ref={(el) => tracker.setMedia(el, el?.querySelector<HTMLElement>('.cs-sticky') ?? null)}>
          <div className="cs-sticky">
            <MediaFrame states={states} target={target} ratio={frameRatio} sizes={sizes} demo={demo} hero priority variant="sticky" />
          </div>
        </div>
      ) : (
        <div className="cs-inline cs-inline--opening">
          <MediaFrame states={[opening]} target={0} ratio={inlineRatio(opening)} sizes={sizes} demo={demo} hero priority variant="inline" />
        </div>
      )}

      <div className="cs-body">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="cs-section" aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="cs-heading">
              {section.title}
            </h2>
            {blocks
              .filter((b) => b.section === section)
              .map(({ block, index }) => (
                <div
                  key={block.id}
                  ref={(el) => tracker.setEl(index, el)}
                  className="cs-block"
                  data-block={block.id}
                  data-last={index === blockCount - 1 || undefined}
                  data-active={(desktop && index === active) || undefined}
                >
                  {block.title && <h3 className="cs-block__title">{block.title}</h3>}
                  <div className="case-prose">{asProse(block.body)}</div>
                  {!desktop && block.visual && (
                    <div className="cs-inline">
                      <MediaFrame states={[block.visual]} target={0} ratio={inlineRatio(block.visual)} sizes={sizes} variant="inline" />
                    </div>
                  )}
                </div>
              ))}
          </section>
        ))}
        {children}
      </div>
    </div>
  )
}

/** Stacked figures use the visual's own ratio (no letterboxing on narrow screens). */
function inlineRatio(v: Visual) {
  if (v.kind === 'placeholder') return v.placeholder.ratio
  const a = getImage(v.image)
  return `${a.width} / ${a.height}`
}

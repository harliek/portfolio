import { useId, useLayoutEffect, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref, type RefObject } from 'react'
import { CROP_REGIONS } from '../../content/crops'
import { getImage, type ImageId } from '../../content/media'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { ExpandIcon } from '../media/ExpandIcon'
import { useImageDialog, type Region } from '../media/ImageDialog'
import { ResponsiveImage } from '../media/ResponsiveImage'
import type { Rect, Visual } from './CaseScroll'

/*
 * The `states` media of CaseScroll: one stable stage whose image follows the
 * active section (StatesStage, desktop), and the stacked figures below 960px
 * (InlineVisual). Every image opens the shared ImageDialog directly: a click
 * or Enter on the image itself (a real button with the image's exact bounds),
 * never a detached "Enlarge image" button. On phones a visual's `phone` crop
 * reads in place instead, without an enlarge control.
 */

/** Phones: a zoom opens the tapped image itself (ZoomButton); a visual's `phone` crop replaces its figure. */
const PHONE = '(max-width: 599.98px)'
/** The whole image as a focus region (its centre). */
const WHOLE: Region = { x: 0, y: 0, w: 100, h: 100 }
/** Frame change timings (ms): highlight out, layer in, settle, same-image pause, highlight in. */
const T = { hlOut: 60, layerIn: 120, settle: 30, sameLayer: 60, hlIn: 150 }

/** '944 / 1744', '16/10' or '1.6' → a number. */
export function ratioNumber(ratio: string): number {
  const [a, b] = ratio.split('/').map((s) => Number.parseFloat(s))
  const n = b ? a / b : a
  return Number.isFinite(n) && n > 0 ? n : 16 / 10
}

const layerKey = (v: Visual) => `img:${v.image}`
const ratioOf = (id: ImageId) => getImage(id).width / getImage(id).height
const imageRatio = (v: Visual) => ratioOf(v.image)
const isTransparent = (v: Visual) => Boolean(getImage(v.image).transparent)
const expandTarget = (v: Visual) => v.expandTo ?? v.image
/** The sequencer's layer keys and highlight flags from their string signatures (stable effect dependencies). */
const parseSignatures = (keysSig: string, highlightsSig: string) => ({ keys: keysSig.split('|'), highlights: highlightsSig.split('|').map((v) => v === 'true') })
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

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
/* Sequencer: decode first, one highlight, only the latest target           */
/* ----------------------------------------------------------------------- */

/** What React renders from the sequencer: the shown state (caption, alt, zoom target) and whose highlight is mounted. */
interface View {
  front: number
  hl: number
}

interface SequencerConfig {
  target: number
  reduced: boolean
  keys: string[]
  highlights: boolean[]
}

/**
 * Drives the stage. Layer visibility (`data-state`) and the highlight
 * (`data-on`) are set here directly on the DOM, and every fade is an awaited
 * Web Animation, so the old layer is hidden only after the new one has fully
 * appeared (CSS transitions can start late or end early during fast
 * scrolling). React renders the layers once and re-renders only the caption,
 * alt text and zoom target from `view`.
 *
 * A change: wait until the target image has decoded (the current one stays
 * fully visible, so the stage is never empty), remove the old highlight
 * (60ms), fade the new layer in over the old one (120ms), then show the new
 * highlight (150ms). Only the latest target is kept, so fast or backward
 * scrolling never plays a queue of missed changes, and there is never more
 * than one highlight. Reduced motion: every step is instant.
 */
class FrameSequencer {
  view: View = { front: 0, hl: 0 }
  private cfg: SequencerConfig = { target: 0, reduced: false, keys: [], highlights: [] }
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

  /** Before the first paint: the current state's layer is shown, every other one hidden. */
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
    this.cfg = cfg
    this.wake?.()
    if (this.alive) void this.run()
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

  /** Animates opacity and resolves when it has really finished; the end value holds until release() (instant with reduced motion). */
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
    return !this.alive || this.cfg.target !== next
  }

  private pause(ms: number) {
    return wait(this.cfg.reduced ? 0 : ms)
  }

  private async run() {
    if (this.running) return
    this.running = true
    try {
      // Bounded: each pass either settles or follows a newer target (never a queue of old ones).
      for (let pass = 0; pass < 64 && this.alive; pass++) {
        const next = this.cfg.target
        const current = this.view.front
        if (next === current) {
          // Settled: make sure the current state's highlight is showing (never over an image still loading).
          if (this.cfg.highlights[current]) {
            await this.ready(current)
            if (this.stale(next)) continue
            if (this.view.hl !== current) {
              this.set({ hl: current })
              await this.pause(T.settle)
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
        const oldLayer = this.layer(this.view.front)
        const newLayer = this.layer(next)
        if (oldLayer === newLayer) {
          // 2a. Same image: only the highlight moves.
          this.set({ front: next, hl: next })
          await this.pause(T.sameLayer)
        } else if (this.cfg.reduced || !oldLayer || !newLayer) {
          this.showOnly(next)
          this.set({ front: next, hl: next })
          await this.pause(T.settle)
        } else {
          // 2b. The new layer fades in on top while the old one stays fully visible underneath
          // (transparent artwork: the old one fades out at the same time, so the two never add up).
          const crossfade = oldLayer.hasAttribute('data-transparent') || newLayer.hasAttribute('data-transparent')
          oldLayer.dataset.state = 'under'
          newLayer.dataset.state = 'shown'
          this.set({ front: next, hl: next })
          const releases = await Promise.all([this.fade(newLayer, 0, 1, T.layerIn), crossfade ? this.fade(oldLayer, 1, 0, T.layerIn) : () => {}])
          oldLayer.dataset.state = 'hidden'
          releases.forEach((release) => release())
          await this.pause(T.settle)
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

/* ----------------------------------------------------------------------- */
/* Pieces                                                                   */
/* ----------------------------------------------------------------------- */

/** One meaningful region, in percent of the image. `data-on` is set by the sequencer (or statically in stacked figures). */
function HighlightBox({ rect, dim, on }: { rect: Rect; dim: boolean; on?: boolean }) {
  const style = { left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` } as CSSProperties
  return <span className="cs-hl" data-dim={dim || undefined} data-on={on ? '' : undefined} style={style} aria-hidden="true" />
}

/** The caption line: an optional label (e.g. "Illustrative conversation") and a middle dot, then the caption. */
function Caption({ visual, showLabel = true }: { visual: Visual; showLabel?: boolean }) {
  return (
    <>
      {showLabel && visual.label && (
        <>
          <span className="cs-label">{visual.label}</span>
          {/* A no-break space before the dot, so the dot never starts a line. */}
          <span className="cs-label__sep">{' · '}</span>
        </>
      )}
      {visual.caption}
    </>
  )
}

/**
 * Where a crop sits in the image its larger view opens, in percent of that
 * image (CROP_REGIONS), and the visual's highlight mapped onto it; null when
 * the visual is not a registered crop of `target`.
 */
function spotIn(visual: Visual, target: ImageId): { focus: Region; highlight?: Region } | null {
  const region = CROP_REGIONS[visual.image]
  if (!region || region.of !== target) return null
  const { width, height } = getImage(target)
  const pct = (x: number, y: number, w: number, h: number): Region => ({ x: (x / width) * 100, y: (y / height) * 100, w: (w / width) * 100, h: (h / height) * 100 })
  const hl = visual.highlight
  return {
    focus: pct(region.x, region.y, region.w, region.h),
    highlight: hl && pct(region.x + (hl.x / 100) * region.w, region.y + (hl.y / 100) * region.h, (hl.w / 100) * region.w, (hl.h / 100) * region.h),
  }
}

/**
 * Opens the enlarged view of a visual: `expandTo` (e.g. the whole
 * conversation behind a crop). A crop of it opens there at actual size,
 * centred on the crop, with the section's highlight at its place (Fit to
 * screen shows the whole image), so the view enlarges what was clicked. On a
 * phone that whole image would fit the screen smaller than the crop the
 * visitor tapped, so there the tapped image itself opens, a wide one at actual
 * size from its centre. Focus returns to `trigger`.
 */
function useZoom(visual: Visual) {
  const dialog = useImageDialog()
  const target = expandTarget(visual)
  return (trigger: HTMLElement) => {
    const caption = visual.caption ? <Caption visual={visual} /> : undefined
    const labelled = Boolean(visual.label)
    if (window.matchMedia(PHONE).matches) {
      const id = visual.image
      const { width, height } = getImage(id)
      const detail = width > height && width > window.innerWidth
      dialog.open(id, trigger, { gallery: [id], caption, labelled, detail, focus: detail ? WHOLE : undefined })
      return
    }
    const spot = spotIn(visual, target)
    dialog.open(target, trigger, { gallery: [target], caption, labelled, ...(spot && { detail: true, focus: spot.focus, highlight: spot.highlight }) })
  }
}

/**
 * The image's own zoom control: a real button laid exactly over the shown
 * image (same box as its canvas), labelled "Enlarge image" and described by
 * the caption. Hover and focus scale the image 1.5% and give it an accent
 * edge (case.css). Nothing is drawn on the image itself.
 */
function ZoomButton({ visual, captionId, open, ref }: { visual: Visual; captionId?: string; open: (trigger: HTMLElement) => void; ref: Ref<HTMLButtonElement> }) {
  return (
    <span className="cs-zoomlayer">
      <button
        ref={ref}
        type="button"
        className="cs-zoom"
        style={{ '--r': imageRatio(visual) } as CSSProperties}
        data-zoom-id={expandTarget(visual)}
        aria-label="Enlarge image"
        aria-describedby={captionId}
        onClick={(e) => open(e.currentTarget)}
      />
    </span>
  )
}

/**
 * The visible expand icon at the right end of the caption row, outside the
 * artwork (case.css .cs-expand): shown on hover and keyboard focus with a
 * mouse, always on touch (44px). The image above is the accessible control,
 * so this pointer and touch shortcut stays out of the tab order and the
 * accessibility tree, and focus returns to the image when the view closes.
 */
function ExpandShortcut({ open, zoomRef }: { open: (trigger: HTMLElement) => void; zoomRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <button
      type="button"
      className="cs-expand"
      tabIndex={-1}
      aria-hidden="true"
      onClick={(e) => open(zoomRef.current ?? e.currentTarget)}
    >
      <ExpandIcon />
    </button>
  )
}

/* ----------------------------------------------------------------------- */
/* StatesStage (desktop, sticky)                                            */
/* ----------------------------------------------------------------------- */

interface StatesStageProps {
  /** The opening visual, then every section visual in order. */
  states: Visual[]
  /** The state to show (from the active section). */
  target: number
  /** The stage's stable ratio (CaseMedia frameRatio). */
  ratio: string
  sizes: string
}

/**
 * The stable stage: every distinct image is mounted as a layer (the opening
 * at high priority; the others at low priority once the opening image has
 * loaded, so on a slow connection the opening gets the bandwidth first, or at
 * once when the visitor has already moved on), the sequencer decides which is
 * shown, at most one highlight exists, and the caption below has a reserved
 * height, so neither the stage nor anything under it moves.
 */
export function StatesStage({ states, target, ratio, sizes }: StatesStageProps) {
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const captionId = useId()
  const [sequencer] = useState(() => new FrameSequencer())
  const view = useSyncExternalStore(sequencer.subscribe, sequencer.getSnapshot, sequencer.getSnapshot)

  const keys = states.map(layerKey)
  const keysSig = keys.join('|')
  const highlightsSig = states.map((v) => Boolean(v.highlight)).join('|')

  // The opening image first; the other layers' images are requested after it (in the same render as any change of
  // target, so the sequencer always finds the image it waits for).
  const [openingLoaded, setOpeningLoaded] = useState(false)
  const loadAll = openingLoaded || target !== 0
  useEffect(() => {
    if (openingLoaded) return
    const img = stageRef.current?.querySelector<HTMLImageElement>(`[data-layer="${CSS.escape(keysSig.split('|')[0] ?? '')}"] img`)
    const done = () => setOpeningLoaded(true)
    if (!img || img.complete) {
      done()
      return
    }
    img.addEventListener('load', done)
    img.addEventListener('error', done)
    return () => {
      img.removeEventListener('load', done)
      img.removeEventListener('error', done)
    }
  }, [openingLoaded, keysSig])

  // Before the first paint: the current layer is visible (the stage is never empty).
  useLayoutEffect(() => {
    sequencer.attach(stageRef.current, { target: sequencer.view.front, reduced: prefersReducedMotion(), ...parseSignatures(keysSig, highlightsSig) })
    return () => sequencer.destroy()
  }, [sequencer, keysSig, highlightsSig])
  useEffect(() => {
    sequencer.configure({ target, reduced, ...parseSignatures(keysSig, highlightsSig) })
  }, [sequencer, target, reduced, keysSig, highlightsSig])

  const stageR = ratioNumber(ratio)
  const front = states[view.front] ?? states[0]
  const frontKey = keys[view.front]
  const hlVisual = states[view.hl]
  const hlKey = keys[view.hl]
  const zoomRef = useRef<HTMLButtonElement>(null)
  const open = useZoom(front)

  // Unique layers, in order of first appearance (the opening first).
  const layers: Array<{ key: string; visual: Visual; index: number }> = []
  states.forEach((visual, index) => {
    if (!layers.some((l) => l.key === keys[index])) layers.push({ key: keys[index], visual, index })
  })

  return (
    <figure className="cs-figure" data-variant="sticky" data-portrait={stageR < 0.9 || undefined} style={{ '--stage-r': stageR } as CSSProperties}>
      <div ref={stageRef} className="cs-stage" data-kind="states" data-state={view.front} data-target={target}>
        {layers.map(({ key, visual, index }) => {
          const isFront = key === frontKey
          const transparent = isTransparent(visual)
          const hl = key === hlKey && hlVisual?.highlight ? hlVisual.highlight : null
          return (
            // data-state (shown / under / hidden) is set by the sequencer, never by React.
            <div key={key} className="cs-layer" data-layer={key} data-transparent={transparent || undefined} aria-hidden={!isFront || undefined}>
              <div className="cs-canvas" style={{ '--r': imageRatio(visual) } as CSSProperties}>
                {(index === 0 || loadAll) && (
                  <ResponsiveImage
                    image={visual.image}
                    sizes={sizes}
                    fit="contain"
                    priority={index === 0}
                    loading={index === 0 ? undefined : 'eager'}
                    fetchPriority={index === 0 ? undefined : 'low'}
                    alt={isFront ? front.alt : visual.alt}
                  />
                )}
                {hl && <HighlightBox rect={hl} dim={!transparent} />}
              </div>
            </div>
          )
        })}
        <ZoomButton ref={zoomRef} visual={front} captionId={captionId} open={open} />
      </div>
      <ExpandShortcut open={open} zoomRef={zoomRef} />
      <figcaption id={captionId} className="cs-caption" aria-live="polite">
        <Caption visual={front} />
      </figcaption>
    </figure>
  )
}

/* ----------------------------------------------------------------------- */
/* InlineVisual (stacked, below 960px)                                      */
/* ----------------------------------------------------------------------- */

/**
 * A stacked figure in reading order: the image at its own ratio (bounded by
 * the viewport height, so phones never fill the screen), its highlight shown
 * at once, the caption below, and the same direct zoom. On a phone, a visual
 * with a `phone` crop shows that narrower crop, which reads in place, with no
 * enlarge control.
 *
 * `showLabel={false}`: the label (e.g. "Illustrative conversation") has
 * already appeared in an earlier figure on the page, so this caption leaves it
 * out (a qualification is stated once). The enlarged view still carries it.
 */
export function InlineVisual({ visual, sizes, priority = false, showLabel = true }: { visual: Visual; sizes: string; priority?: boolean; showLabel?: boolean }) {
  const captionId = useId()
  const zoomRef = useRef<HTMLButtonElement>(null)
  const open = useZoom(visual)
  const inPlace = useMediaQuery(PHONE) ? (visual.phone ?? null) : null
  const image = inPlace?.image ?? visual.image
  const highlight = inPlace ? inPlace.highlight : visual.highlight
  const transparent = Boolean(getImage(image).transparent)
  const r = ratioOf(image)
  const hasCaption = Boolean(visual.caption || (showLabel && visual.label))
  return (
    <figure className="cs-figure" data-variant="inline" data-in-place={inPlace ? '' : undefined} style={{ '--stage-r': r } as CSSProperties}>
      <div className="cs-stage" data-kind="inline">
        <div className="cs-layer" data-state="shown" data-transparent={transparent || undefined}>
          <div className="cs-canvas" style={{ '--r': r } as CSSProperties}>
            {/* The phone crop's own description (the visual's alt describes the wider crop). */}
            <ResponsiveImage key={image} image={image} sizes={sizes} fit="contain" priority={priority} alt={inPlace ? undefined : visual.alt} />
            {highlight && <HighlightBox rect={highlight} dim={!transparent} on />}
          </div>
        </div>
        {!inPlace && <ZoomButton ref={zoomRef} visual={visual} captionId={hasCaption ? captionId : undefined} open={open} />}
      </div>
      {!inPlace && <ExpandShortcut open={open} zoomRef={zoomRef} />}
      {hasCaption && (
        <figcaption id={captionId} className="cs-caption">
          <Caption visual={visual} showLabel={showLabel} />
        </figcaption>
      )}
    </figure>
  )
}

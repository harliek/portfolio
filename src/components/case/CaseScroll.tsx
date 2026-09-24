/*
 * CaseScroll: the case-study layout (brief-v5 sections 13 to 16). Usage for page owners:
 *
 *   <CaseLayout project={project} className="page-x">
 *     <CaseScroll
 *       project={project}
 *       meta={['Independent project · 2026', 'Product design and prototyping']}   // lines, no colons
 *       summary={<p>First-person opening, 35 to 55 words.</p>}
 *       media={{ kind: 'video', video: 'merch-console' }}                          // autoplaying recording
 *       //  or { kind: 'states', frameRatio: '16 / 9', opening: { image: 'x-full', caption: '…' } }
 *       sections={[                                                               // three, 25 to 45 words each
 *         { id: 'problem', title: 'The problem', body: <p>…</p> },
 *         { id: 'built', title: 'What I built', body: <p>…</p>,
 *           visual: { image: 'x-crop', caption: '…', highlight: { x: 10, y: 20, w: 40, h: 15 }, expandTo: 'x-full' } },
 *       ]}
 *       outcome={{ id: 'result', title: 'The result', body: <p>…</p> }}            // 20 to 40 words
 *     />
 *     <NextProject current={project.id} />
 *   </CaseLayout>
 *
 * Rendered for you: the H1 (project.name), the metadata lines, the summary, the cover PNG
 * (<CoverSlot id={project.accent} scale={coverScale} />, the landing place of the carousel
 * transition) and ONE media stage. Do not add section links, Play/Return buttons, "Enlarge image"
 * buttons, Results blocks or placeholders; there is no "Context and role" section.
 *
 * - `media.kind: 'video'` (Merchandising Platform, Spreadsheet Agent): the real recording
 *   (DemoVideo) autoplays muted with native controls when 35% visible, keeps playing while the text
 *   scrolls, pauses when fully offscreen, respects a visitor's pause, falls back to the poster with
 *   "Play demo" when autoplay is refused or motion is reduced, and has an expand control inside the
 *   player. Section `visual`s are ignored in this mode (the recording is the one visual).
 * - `media.kind: 'states'` (CafePress UK, AI Leasing Agent, Jumpstart Finance): the stage shows
 *   `opening`, then each section's `visual` while that section is active (no `visual` = keep the
 *   current one; the outcome may carry one too). `frameRatio` is the stage's ONE stable ratio: use
 *   crops of that ratio; other ratios (a portrait phone) are contained and centred in the same stage.
 * - Visual: `image` (ImageId), `caption` (short, below the stage, no provenance boilerplate),
 *   `highlight` (ONE region in percent of the image: x, y from its top-left), `expandTo` (the image
 *   the click opens, e.g. the full conversation behind a crop; default `image`), `alt` (overrides
 *   the manifest alt), `label` (a short visible tag before the caption, e.g. 'Illustrative
 *   conversation'; state a qualification once).
 * - Every stage image is itself the zoom control (hover: 1.5% larger with an accent edge; click or
 *   Enter opens the shared ImageDialog; Escape or Close returns focus).
 * - Ids: section ids become DOM ids (the h2 is `${id}-title`); keep them unique on the page.
 * - Bold one or two meaningful phrases per paragraph at most. No colons or em dashes in copy.
 * - The accent (CaseLayout sets --accent from project.accent) marks the active section heading,
 *   highlights, media hover and focus edges, and link hover. Body text is never recoloured.
 *
 * Desktop (≥960px): grid max 1240px, 42% text / 6% gap / 52% media. Left: title, metadata,
 * summary, cover, then the sections and the outcome (h2 each). Right: one sticky stage (top =
 * header + 24px) of stable size from the opening until the outcome ends, then released with the
 * story. The document scrolls naturally. The active section is the last one whose top has passed
 * a line at 40% of the viewport (scroll position, rAF-throttled; near the end the line moves down,
 * at most to 75%, so the outcome becomes active while the stage is still pinned).
 * Below 960px: title, metadata, summary, a smaller cover, then the media next to its text (the
 * recording right after the opening; image states after their sections), then the outcome. No sticky.
 *
 * `data-cover-reveal` marks the opening text, the story and the stage: the carousel transition
 * (components/transition) hides them while the cover PNG travels into its slot, then fades them in.
 */
import '../../styles/case.css'
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { ImageId, VideoId } from '../../content/media'
import type { Project } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { DemoVideo } from '../media/DemoVideo'
import { CoverSlot } from '../transition/CoverSlot'
import { InlineVisual, StatesStage } from './StatesStage'

/** A region in percent of the image (x, y from its top-left corner). */
export type Rect = { x: number; y: number; w: number; h: number }

export interface Visual {
  image: ImageId
  caption?: ReactNode
  highlight?: Rect
  /** The image a click opens (default: `image`). */
  expandTo?: ImageId
  alt?: string
  /** A short visible tag before the caption. */
  label?: 'Illustrative conversation' | string
}

/** `visual` omitted = keep the current one (states media only). */
export interface StorySection {
  id: string
  title: string
  body: ReactNode
  visual?: Visual
}

export type CaseMedia =
  /** Autoplaying muted recording (Merchandising Platform, Spreadsheet Agent). */
  | { kind: 'video'; video: VideoId; poster?: ImageId }
  /** Scroll-driven images (CafePress UK, AI Leasing Agent, Jumpstart Finance). */
  | { kind: 'states'; opening: Visual; frameRatio: string }

export interface CaseScrollProps {
  project: Project
  /** Metadata lines, no colons (e.g. ['Independent project · 2026', 'Product design and prototyping']). */
  meta: string[]
  /** First-person opening, 35 to 55 words. */
  summary: ReactNode
  media: CaseMedia
  /** Three concise sections (25 to 45 words each). */
  sections: StorySection[]
  /** The outcome (20 to 40 words); the media stays present through it. */
  outcome: StorySection
  /** CoverSlot scale (default 0.72). */
  coverScale?: number
}

const DESKTOP = '(min-width: 960px)'
/** The stage's rendered width: 52% of the 1240px grid, 52% of the viewport minus gutters, or the stacked column. */
const STAGE_SIZES = '(min-width: 1280px) 645px, (min-width: 960px) 51vw, calc(100vw - 40px)'
/** Share of the viewport height where a section becomes active. */
const ACTIVATION_LINE = 0.4
/** The last section stays active for at least this share of the viewport height while the stage is pinned. */
const LAST_DWELL = 0.22
/** The lowest the activation line may move near the end (share of the viewport). */
const MAX_LINE = 0.75
/** The line moves down over RAMP × the distance it moves, so the sections before the last keep most of their time. */
const RAMP = 3

/* ----------------------------------------------------------------------- */
/* Active section: scroll-position based                                    */
/* ----------------------------------------------------------------------- */

/**
 * Tracks the last section whose top has passed the activation line (-1 = the
 * opening). An external store, so scroll updates never set state inside an
 * effect; the snapshot changes only when the active section changes.
 *
 * The end (desktop): the sticky stage is carried away once the bottom of the
 * text column reaches it, which usually happens before a short outcome
 * reaches the 40% line. So the line moves down gradually over the last part
 * of the pinned range (never above 40%, never below 75% of the viewport),
 * timed so the outcome becomes active LAST_DWELL of the viewport before the
 * stage starts to move. The line is a pure function of the scroll position,
 * so fast and backward scrolling land on the same state. Only when the stage
 * is too tall for that does the text column get a short tail (--cs-tail).
 */
class ActiveTracker {
  private els: Array<HTMLElement | null> = []
  private grid: HTMLElement | null = null
  private column: HTMLElement | null = null
  private sticky: HTMLElement | null = null
  private body: HTMLElement | null = null
  private active = -1
  private frame = 0
  private listeners = new Set<() => void>()
  private ro: ResizeObserver | null = null
  /** Layout values that do not change with scrolling (re-read after a resize or a content change). */
  private dirty = true
  private stickyTop = 0
  /** The tail under the last section (px). Grows with content changes; recomputed from zero on resize. */
  private tail = 0

  setEl(i: number, el: HTMLElement | null) {
    this.els[i] = el
    this.relayout()
  }

  /** Ref callback for the media column (desktop only). Its grid, sticky stage and text column are found from it. Stable identity. */
  attachMedia = (column: HTMLElement | null) => {
    if (column === this.column) return
    this.setTail(0)
    this.column = column
    this.grid = column?.parentElement ?? null
    this.sticky = column?.querySelector<HTMLElement>('.cs-sticky') ?? null
    this.body = this.grid?.querySelector<HTMLElement>(':scope > .cs-body') ?? null
    this.relayout()
  }

  /** Drops elements beyond the current section count. */
  setCount(n: number) {
    this.els.length = n
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.resized)
      this.ro = new ResizeObserver(this.relayout)
      this.ro.observe(document.body)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.resized)
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

  private relayout = () => {
    this.dirty = true
    this.schedule()
  }

  private resized = () => {
    this.setTail(0)
    this.relayout()
  }

  private setTail(px: number) {
    this.tail = px
    if (px > 0) this.grid?.style.setProperty('--cs-tail', `${px}px`)
    else this.grid?.style.removeProperty('--cs-tail')
  }

  /** The activation line (px from the viewport top) at the current scroll position. */
  private line(vh: number) {
    const base = vh * ACTIVATION_LINE
    const n = this.els.length
    const lastEl = this.els[n - 1]
    const { column, sticky, body } = this
    if (!lastEl || !column || !sticky || !body) return base
    const y = window.scrollY
    if (this.dirty) {
      this.dirty = false
      this.stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0
    }
    const region = this.stickyTop + sticky.offsetHeight
    const dwell = vh * LAST_DWELL
    const lastTop = lastEl.getBoundingClientRect().top + y
    // The tail: only what a stage too tall for the viewport needs (none on most pages).
    const after = body.getBoundingClientRect().bottom + y - this.tail - lastTop
    const tail = Math.max(0, Math.ceil(region + dwell - after - vh * MAX_LINE))
    if (tail > this.tail) this.setTail(tail)
    // Scroll position at which the stage starts to move with the column, and where the last section takes over.
    const unpin = column.getBoundingClientRect().bottom + y - region
    const end = unpin - dwell
    const shift = Math.min(Math.max(lastTop - end - base, 0), vh * (MAX_LINE - ACTIVATION_LINE))
    if (!shift) return base
    // Never before arrival, so the opening visual always has its turn.
    const start = Math.max(0, end - RAMP * shift)
    const progress = end > start ? Math.min(Math.max((y - start) / (end - start), 0), 1) : y >= end ? 1 : 0
    return base + shift * progress
  }

  private measure = () => {
    this.frame = 0
    const line = this.line(window.innerHeight)
    let active = -1
    for (let i = 0; i < this.els.length; i++) {
      const el = this.els[i]
      if (!el) continue
      if (el.getBoundingClientRect().top <= line) active = i
      else break
    }
    if (active !== this.active) {
      this.active = active
      this.listeners.forEach((l) => l())
    }
  }
}

/* ----------------------------------------------------------------------- */
/* CaseScroll                                                               */
/* ----------------------------------------------------------------------- */

const asProse = (node: ReactNode) => (typeof node === 'string' ? <p>{node}</p> : node)

export function CaseScroll({ project, meta, summary, media, sections, outcome, coverScale = 0.72 }: CaseScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new ActiveTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const story = [...sections, outcome]
  const count = story.length
  useEffect(() => tracker.setCount(count), [tracker, count])
  // Stable, so re-renders never detach the media column (which would reset the tail).
  const attachMedia = useCallback((el: HTMLDivElement | null) => tracker.attachMedia(el), [tracker])

  // States media: the opening, then every section that brings a visual; each section shows the latest state at or before it.
  const states: Visual[] = []
  const sectionState: number[] = []
  if (media.kind === 'states') {
    states.push(media.opening)
    story.forEach((s) => {
      if (s.visual) states.push(s.visual)
      sectionState.push(states.length - 1)
    })
  }
  const target = active < 0 ? 0 : (sectionState[active] ?? 0)
  const stacked = !desktop

  return (
    <div className="cs" data-layout={desktop ? 'sticky' : 'stacked'} data-media={media.kind}>
      <header className="cs-opening">
        <div className="cs-intro" data-cover-reveal="">
          <h1 className="cs-title" tabIndex={-1}>
            {project.name}
          </h1>
          {meta.length > 0 && (
            <p className="cs-meta">
              {meta.map((line) => (
                <span key={line} className="cs-meta__line">
                  {line}
                </span>
              ))}
            </p>
          )}
          <div className="cs-summary case-prose">{asProse(summary)}</div>
        </div>
        <div className="cs-cover">
          <CoverSlot id={project.accent} scale={coverScale} />
        </div>
      </header>

      {/* The same element in both layouts, so a playing recording is never remounted by a resize. */}
      <div className="cs-media" ref={desktop ? attachMedia : undefined}>
        <div className="cs-sticky" data-cover-reveal="">
          {media.kind === 'video' ? (
            <DemoVideo video={media.video} poster={media.poster} sizes={STAGE_SIZES} variant={stacked ? 'inline' : 'sticky'} />
          ) : desktop ? (
            <StatesStage states={states} target={target} ratio={media.frameRatio} sizes={STAGE_SIZES} />
          ) : (
            <InlineVisual visual={media.opening} sizes={STAGE_SIZES} priority />
          )}
        </div>
      </div>

      <div className="cs-body" data-cover-reveal="">
        {story.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            ref={(el) => tracker.setEl(i, el)}
            className="cs-section"
            data-outcome={i === count - 1 || undefined}
            data-active={(desktop && i === active) || undefined}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`} className="cs-heading">
              {section.title}
            </h2>
            <div className="case-prose">{asProse(section.body)}</div>
            {stacked && media.kind === 'states' && section.visual && <InlineVisual visual={section.visual} sizes={STAGE_SIZES} />}
          </section>
        ))}
      </div>
    </div>
  )
}

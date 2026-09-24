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
 * header + 24px) of stable size from the opening through the outcome: on a short viewport the
 * text column gets a tail, so the stage leaves only when the outcome has reached its top, and the
 * two leave together (storyTracker.ts). The document scrolls naturally. The active section is the
 * last one whose top has passed a line at 40% of the viewport (scroll position, rAF-throttled).
 * Below 960px: title, metadata, summary, a smaller cover, then the media next to its text (the
 * recording right after the opening; image states after their sections, only where the image
 * changes: a moved highlight alone would repeat the screenshot), then the outcome. No sticky.
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
import { StoryTracker } from './storyTracker'

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

/* ----------------------------------------------------------------------- */
/* CaseScroll                                                               */
/* ----------------------------------------------------------------------- */

const asProse = (node: ReactNode) => (typeof node === 'string' ? <p>{node}</p> : node)

export function CaseScroll({ project, meta, summary, media, sections, outcome, coverScale = 0.72 }: CaseScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new StoryTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const story = [...sections, outcome]
  const count = story.length
  useEffect(() => tracker.setCount(count), [tracker, count])
  // Stable, so re-renders never detach the media column (which would reset the tail).
  const attachMedia = useCallback((el: HTMLDivElement | null) => tracker.attachMedia(el), [tracker])

  // States media: the opening, then every section that brings a visual; each section shows the latest state at or before it.
  const states: Visual[] = []
  const sectionState: number[] = []
  // Stacked: a section's figure only where the image changes (the same screenshot with a moved highlight is not repeated).
  const inline: Array<Visual | undefined> = []
  if (media.kind === 'states') {
    states.push(media.opening)
    let shown = media.opening.image
    story.forEach((s) => {
      if (s.visual) states.push(s.visual)
      sectionState.push(states.length - 1)
      const fresh = s.visual && s.visual.image !== shown ? s.visual : undefined
      if (fresh) shown = fresh.image
      inline.push(fresh)
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
            {stacked && inline[i] && <InlineVisual visual={inline[i]} sizes={STAGE_SIZES} />}
          </section>
        ))}
      </div>
    </div>
  )
}

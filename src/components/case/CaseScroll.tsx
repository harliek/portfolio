/*
 * CaseScroll: the case-study layout (brief-v8 sections 5, 7 and 8). Usage for page authors:
 *
 *   <CaseLayout project={project} className="page-x">
 *     <CaseScroll
 *       project={project}
 *       meta={['Role · Organization', 'Dates · Scope']}                    // two lines, middle dots, no colons
 *       status="Working prototype with synthetic data"                     // optional: ONE short evidence line under the summary
 *       summary={<p>First-person opening, 35 to 55 words.</p>}
 *       media={{ kind: 'video', video: 'merch-console' }}                  // one of the four forms below
 *       stage={{ align: 'center', fill: 1 }}                               // optional, per page (see StageConfig)
 *       sections={[{ id: 'problem', title: 'The problem', body: <p>…</p> }, …]}
 *       outcome={{ id: 'result', title: 'The result', body: <p>…</p> }}    // the media stays beside it
 *     />
 *     <NextProject current={project.id} />                                 // small PNG, "Next project", displayName, arrow
 *   </CaseLayout>
 *
 * Media, in ONE stage beside the story (desktop) or after the opening / beside its section (stacked):
 * - { kind: 'video', video } : the real recording autoplays muted, its picture clean; compact controls
 *   below it (play or pause, seek, sound, expand; DemoControls) and Expand opens a larger view at the
 *   same moment.
 * - { kind: 'video', video, preview: { video, label, map? } } : `preview.video` (an edited, accelerated
 *   derivative) plays inline with `label` as the player's caption (e.g. 'Edited preview · 1.5× speed');
 *   expand opens `video`, the complete recording at original speed, labelled as such. `map` lists
 *   matching moments [previewSeconds, fullSeconds] (ascending) so it continues at the same point;
 *   without it the complete recording starts from the beginning and the view says so.
 * - { kind: 'states', frameRatio, opening } : the opening Visual, then each section's `visual` while
 *   that section is active (no `visual` = keep the current one). The same image with a new
 *   `highlight` only moves the highlight (the image is never replaced). Crops of `frameRatio`.
 * - { kind: 'custom', render } : your own stage content (e.g. a group of phones) in the same sticky,
 *   centred stage. `render({ active, layout })`: `active` is the index in [...sections, outcome]
 *   (-1 while the opening is in view); `layout` is 'sticky' (desktop) or 'stacked' (below 960px,
 *   rendered once, after the opening). It fills the stage box (StageConfig `ratio` gives it a ratio).
 *
 * Visual: `image`, `highlight` (ONE region, percent of the image), `expandTo` (what a click opens,
 * default `image`), `alt`, `label` (a discreet media label such as 'Illustrative conversation', shown
 * under the image beside the expand control; state it once), `phone` (a narrower crop that reads in
 * place below 600px). `caption` is DEPRECATED and not rendered (brief-v8 section 8): routine
 * captions are gone; put evidence distinctions in `status` or a `label`.
 *
 * Opening (rendered for you, brief-v13): the H1 (project.name, the accurate case name), the metadata
 * lines, the summary and the `status` line on the left, and beside them the concept cover PNG (the
 * carousel transition's landing slot), lit in the project's own accent, standing on the same floor as
 * the text: its base and its caption ("Concept cover", `coverLabel`, null to omit; styled like every
 * media label) end level with the lede's last line, and it fits the height of the text beside it
 * (`coverSize` scales it, default 1). Phones: one column, the smaller cover between the metadata and
 * the summary. CaseOpening is exported for layouts that share this opening (the Creative Production page).
 *
 * Desktop (≥960px): a centred grid (the site's 1240px content width), 42% text / 6% gap / 52% media,
 * body 18 to 19px. The opening spans both columns (text left, cover right); below it the story and,
 * in the media column under the cover, one sticky figure whose top is level with the first section
 * heading, as large as the column and the visible stage (the viewport below the navigation) allow and
 * centred in that stage once it sticks (StageConfig `align: 'start'` places it just below the
 * navigation; `fill` caps its height as a share of the stage). It stays through the outcome and is
 * released with the outcome's end, its bottom level with the outcome's, so it leaves beside the
 * outcome and the next-project link below never sits beside an empty media column.
 * The document scrolls naturally (no inner scroll boxes). The active section is the last one whose
 * top has passed a line at 40% of the viewport; its heading takes the accent with a short marker.
 * Below 960px: the opening, the media (video and custom after the opening; still-image states after
 * the section where the image changes), the story. No sticky.
 *
 * Every image is its own zoom control (click or Enter; Escape or Close returns focus); the expand
 * glyph beside the label is a pointer shortcut. Ids: section ids become DOM ids (h2 `${id}-title`).
 * Bold one or two meaningful phrases per paragraph at most; no colons or em dashes in copy.
 * `data-cover-reveal` marks the opening text, the story and the stage for the route transition.
 */
import '../../styles/case.css'
import { Fragment, useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import type { ObjectKind } from '../../content/carousel'
import { getImage, getVideo, type ImageId, type VideoId } from '../../content/media'
import type { Project } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { DemoVideo, type TimeMap } from '../media/DemoVideo'
import { CoverSlot } from '../transition/CoverSlot'
import { coverItem, coverSlotWidth } from '../transition/coverGeometry'
import { metaSegments } from './metaLine'
import { InlineVisual, ratioNumber, StatesStage } from './StatesStage'
import { StoryTracker } from './storyTracker'

/** A region in percent of the image (x, y from its top-left corner). */
export type Rect = { x: number; y: number; w: number; h: number }

export interface Visual {
  image: ImageId
  /** @deprecated Not rendered (brief-v8 section 8). Use the page `status` line or a `label`. */
  caption?: ReactNode
  highlight?: Rect
  /** The image a click opens (default: `image`). */
  expandTo?: ImageId
  alt?: string
  /** A discreet media label under the image (e.g. 'Illustrative conversation'); also shown in the enlarged view. */
  label?: 'Illustrative conversation' | 'Original 2024 prototype' | 'Concept cover' | string
  /**
   * Phones (below 600px): a narrower crop of the same evidence that reads in place (its text at about 10px or
   * more in the 350px column), with its own highlight in percent of that crop. The stacked figure shows it
   * instead of `image`, without an enlarge control.
   */
  phone?: { image: ImageId; highlight?: Rect }
}

/** `visual` omitted = keep the current one (states media only). */
export interface StorySection {
  id: string
  title: string
  body: ReactNode
  visual?: Visual
}

/** An edited, accelerated derivative of a recording for inline playback. */
export interface VideoPreview {
  video: VideoId
  /** Shown inside the player, e.g. 'Edited preview · 1.5× speed' (no colon). */
  label: string
  /** Matching moments [previewSeconds, fullSeconds], ascending: expand continues at the same point of the complete recording. */
  map?: TimeMap
}

export interface StageContext {
  /** The active story section, an index in [...sections, outcome]; -1 while the opening is in view. */
  active: number
  layout: 'sticky' | 'stacked'
}

export type CaseMedia =
  /** The real recording (the complete one when `preview` is given), autoplaying muted inline. */
  | { kind: 'video'; video: VideoId; poster?: ImageId; preview?: VideoPreview }
  /** Scroll-driven images (the opening, then each section's visual). */
  | { kind: 'states'; opening: Visual; frameRatio: string }
  /** The page's own stage content, told which section is active. */
  | { kind: 'custom'; render: (ctx: StageContext) => ReactNode }

/** Per-page stage configuration (desktop). */
export interface StageConfig {
  /** Media shorter than the visible stage: 'center' (default) sits in its middle, 'start' just below the navigation. */
  align?: 'center' | 'start'
  /** The media's greatest height as a share of the visible stage, 0.4 to 1 (default 1). */
  fill?: number
  /** Custom media only: the stage box's ratio (e.g. '4 / 5'); by default it fills the visible stage. */
  ratio?: string
}

export interface CaseScrollProps {
  project: Project
  /** Two metadata lines, no colons: Role · Organization, then Dates · Scope. */
  meta: string[]
  /** First-person opening, 35 to 55 words. */
  summary: ReactNode
  /** ONE concise project-status line under the summary (e.g. 'Working prototype with synthetic data', 'Original 2024 prototype'). */
  status?: ReactNode
  media: CaseMedia
  stage?: StageConfig
  /** Three concise sections (25 to 45 words each). */
  sections: StorySection[]
  /** The outcome (20 to 40 words); the media stays present beside it. */
  outcome: StorySection
  /** Scales the opening cover's greatest size (default 1). */
  coverSize?: number
  /** The caption under the cover (default 'Concept cover'); null omits it. */
  coverLabel?: string | null
  /** @deprecated Ignored: the cover is sized per object (coverSize scales it). */
  coverScale?: number
}

const DESKTOP = '(min-width: 960px)'
/** The stage's rendered width: 52% of the 1240px grid, 52% of the viewport minus gutters, or the stacked column. */
const STAGE_SIZES = '(min-width: 1368px) 645px, (min-width: 960px) 47vw, calc(100vw - 40px)'

/* ----------------------------------------------------------------------- */
/* Opening                                                                  */
/* ----------------------------------------------------------------------- */

/**
 * The opening cover's greatest height (CSS px) per object, balanced by eye so a thin phone and a wide
 * laptop carry comparable weight. Independent of the homepage's object sizes. Beside the text it is
 * also fitted to the height of the title, metadata, summary and status line (case.css .cs-cover);
 * phones scale it down (--cover-hmax).
 */
const COVER_HEIGHT: Record<ObjectKind, number> = {
  monitor: 232,
  laptop: 232,
  mug: 236,
  tablet: 272,
  camera: 228,
  phone: 292,
  headshot: 280,
}

const asProse = (node: ReactNode) => (typeof node === 'string' ? <p>{node}</p> : node)

/**
 * The cover PNG in its transition slot, lit in the project's own accent (case.css), with its caption directly under
 * it in the same style as every other media label (e.g. "Concept cover").
 */
function CaseCover({ project, size = 1, label }: { project: Project; size?: number; label: string | null }) {
  const item = coverItem(project.accent)
  if (!item) return null
  const image = getImage(item.image)
  const r = image.width / image.height
  const width = COVER_HEIGHT[item.kind] * r * size
  const scale = width / coverSlotWidth(item, 1)
  return (
    <div className="cs-cover" data-kind={item.kind} style={{ '--cover-r': r, '--cover-max': `${Math.round(width)}px` } as CSSProperties}>
      <CoverSlot id={project.accent} scale={scale} />
      {label && (
        <span className="cs-media-label cs-cover__label" data-cover-reveal="">
          {label}
        </span>
      )}
    </div>
  )
}

export interface CaseOpeningProps {
  project: Project
  meta: string[]
  summary: ReactNode
  status?: ReactNode
  coverSize?: number
  coverLabel?: string | null
}

/**
 * The case opening: H1, metadata lines, the summary and the status line, with the concept cover
 * beside them (from 700px; on phones, a smaller cover between the metadata and the summary, so the
 * route transition's object lands in view and the status line leads straight into the media).
 * Shared by CaseScroll and any page with its own story layout (the Creative Production page).
 */
export function CaseOpening({ project, meta, summary, status, coverSize, coverLabel = 'Concept cover' }: CaseOpeningProps) {
  return (
    <header className="cs-opening">
      <div className="cs-intro" data-cover-reveal="">
        <h1 className="cs-title" tabIndex={-1}>
          {project.name}
        </h1>
        {meta.length > 0 && (
          <p className="cs-meta">
            {meta.map((line) => (
              <span key={line} className="cs-meta__line">
                {metaSegments(line).map((seg, i) => (
                  <Fragment key={seg}>
                    {i > 0 && ' '}
                    <span className="cs-meta__seg">{seg}</span>
                  </Fragment>
                ))}
              </span>
            ))}
          </p>
        )}
      </div>
      <CaseCover project={project} size={coverSize} label={coverLabel} />
      <div className="cs-lede" data-cover-reveal="">
        <div className="cs-summary case-prose">{asProse(summary)}</div>
        {status && <p className="cs-status">{status}</p>}
      </div>
    </header>
  )
}

/* ----------------------------------------------------------------------- */
/* CaseScroll                                                               */
/* ----------------------------------------------------------------------- */

export function CaseScroll({ project, meta, summary, status, media, stage, sections, outcome, coverSize, coverLabel }: CaseScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new StoryTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const story = [...sections, outcome]
  const count = story.length
  useEffect(() => tracker.setCount(count), [tracker, count])
  // Stable, so re-renders never detach and re-measure the media column.
  const attachMedia = useCallback((el: HTMLDivElement | null) => tracker.attachMedia(el), [tracker])

  // States media: the opening, then every section that brings a visual; each section shows the latest state at or before it.
  const states: Visual[] = []
  const sectionState: number[] = []
  // Stacked: a section's figure only where the image changes (the same screenshot with a moved highlight is not repeated),
  // and a figure's label only the first time it appears on the page (the opening figure first).
  const inline: Array<Visual | undefined> = []
  const inlineLabel: boolean[] = []
  if (media.kind === 'states') {
    states.push(media.opening)
    let shown = media.opening.image
    const labels = new Set(media.opening.label ? [media.opening.label] : [])
    story.forEach((s) => {
      if (s.visual) states.push(s.visual)
      sectionState.push(states.length - 1)
      const fresh = s.visual && s.visual.image !== shown ? s.visual : undefined
      if (fresh) shown = fresh.image
      inline.push(fresh)
      inlineLabel.push(Boolean(fresh?.label && !labels.has(fresh.label)))
      if (fresh?.label) labels.add(fresh.label)
    })
  }
  const target = active < 0 ? 0 : (sectionState[active] ?? 0)
  const stacked = !desktop
  const layout = stacked ? 'stacked' : 'sticky'
  const fill = Math.min(1, Math.max(0.4, stage?.fill ?? 1))
  const customRatio = media.kind === 'custom' && stage?.ratio ? ratioNumber(stage.ratio) : undefined
  // The media's ratio, so the sticky stage can centre it in the visible area below the navigation (case.css).
  const videoAsset = media.kind === 'video' ? getVideo(media.preview?.video ?? media.video) : null
  const stageR = videoAsset ? videoAsset.width / videoAsset.height : media.kind === 'states' ? ratioNumber(media.frameRatio) : customRatio

  let mediaNode: ReactNode
  if (media.kind === 'video') {
    const { preview } = media
    mediaNode = (
      <DemoVideo
        video={preview?.video ?? media.video}
        full={preview ? media.video : undefined}
        label={preview?.label}
        map={preview?.map}
        poster={media.poster}
        sizes={STAGE_SIZES}
        variant={layout}
      />
    )
  } else if (media.kind === 'states') {
    mediaNode = desktop ? (
      <StatesStage states={states} target={target} ratio={media.frameRatio} sizes={STAGE_SIZES} />
    ) : (
      <InlineVisual visual={media.opening} sizes={STAGE_SIZES} priority />
    )
  } else {
    mediaNode = (
      <div className="cs-custom" data-variant={layout} data-ratio={customRatio ? '' : undefined} style={customRatio ? ({ '--stage-r': customRatio } as CSSProperties) : undefined}>
        {media.render({ active, layout })}
      </div>
    )
  }

  return (
    <div
      className="cs"
      data-layout={layout}
      data-media={media.kind}
      data-stage={stage?.align ?? 'center'}
      style={{ '--cs-fill': fill } as CSSProperties}
    >
      <CaseOpening project={project} meta={meta} summary={summary} status={status} coverSize={coverSize} coverLabel={coverLabel} />

      {/* The same element in both layouts, so a playing recording is never remounted by a resize. */}
      <div className="cs-media" ref={desktop ? attachMedia : undefined}>
        <div className="cs-sticky" data-cover-reveal="" data-fixed-ratio={stageR ? '' : undefined} style={stageR ? ({ '--stage-r': stageR } as CSSProperties) : undefined}>
          {mediaNode}
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
            {stacked && inline[i] && <InlineVisual visual={inline[i]} sizes={STAGE_SIZES} showLabel={inlineLabel[i]} />}
          </section>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getImage, type ImageId } from '../../../content/media'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { useStickyFigureHeight } from '../../case/StickyVisual'
import { CaptionText } from '../../media/Figure'
import { useImageDialog } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/** A rectangle in the source image's pixels (valiance-messages is 1672 × 941). */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface ConversationStep {
  id: string
  /** Short heading for the paragraph (h3). */
  title: string
  /** The paragraph, ordinary page content. */
  body: ReactNode
  /** The message (or messages) this paragraph refers to. */
  region: Rect
  /** Stacked layout: the part of the conversation shown under the paragraph. */
  excerpt: Rect
  /** Alt text for that excerpt. */
  excerptAlt: string
  /** What the highlighted message shows. */
  caption: ReactNode
}

interface ConversationStepsProps {
  image: ImageId
  /** The one conversation frame: the thread, cropped from the full illustration. */
  frame: Rect
  /** Alt text for the frame (a text equivalent of the conversation). */
  frameAlt: string
  /** Persistent line under the frame that identifies the conversation as illustrative. */
  note: ReactNode
  steps: ConversationStep[]
  /** Content after the steps (both layouts). */
  children?: ReactNode
}

const DESKTOP = '(min-width: 960px)'
/* The crop shows the thread at about 2× the frame's width of the full image. */
const FRAME_SIZES = '(min-width: 1320px) 1310px, (min-width: 960px) 106vw, 210vw'
const EXCERPT_SIZES = '(min-width: 960px) 1310px, 230vw'
const pct = (n: number) => `${Math.round(n * 10000) / 100}%`

/** An inset rectangle, clamped inside the crop so the ring and its glow stay visible. */
function within(region: Rect, crop: Rect, inset = 8): Rect {
  const x0 = Math.max(region.x, crop.x + inset)
  const y0 = Math.max(region.y, crop.y + inset)
  const x1 = Math.min(region.x + region.w, crop.x + crop.w - inset)
  const y1 = Math.min(region.y + region.h, crop.y + crop.h - inset)
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

/** A CSS crop of the source image: only `crop` is visible, at the frame's width. */
function Crop({ image, crop, sizes, alt, children }: { image: ImageId; crop: Rect; sizes: string; alt: string; children?: ReactNode }) {
  const asset = getImage(image)
  const style = {
    aspectRatio: `${crop.w} / ${crop.h}`,
    '--crop-w': pct(asset.width / crop.w),
    '--crop-x': pct(-crop.x / crop.w),
    '--crop-y': pct(-crop.y / crop.h),
  } as CSSProperties
  return (
    <div className="sv-frame conv-frame" style={style}>
      <div className="conv-crop">
        <ResponsiveImage image={image} sizes={sizes} alt={alt} />
      </div>
      {children}
    </div>
  )
}

function Highlight({ region, crop, active, dim }: { region: Rect; crop: Rect; active: boolean; dim: boolean }) {
  const r = within(region, crop)
  const style = {
    left: pct((r.x - crop.x) / crop.w),
    top: pct((r.y - crop.y) / crop.h),
    width: pct(r.w / crop.w),
    height: pct(r.h / crop.h),
  } as CSSProperties
  return <span className="sv-highlight conv-highlight" data-active={active || undefined} data-dim={dim || undefined} style={style} aria-hidden="true" />
}

function EnlargeButton({ image }: { image: ImageId }) {
  const dialog = useImageDialog()
  return (
    <button
      type="button"
      className="conv-enlarge"
      data-zoom-id={image}
      aria-label="Enlarge the full illustrative conversation"
      onClick={(e) => dialog.open(image, e.currentTarget)}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Enlarge
    </button>
  )
}

/**
 * The Approach section's one conversation frame, following the shared
 * StickyVisual pattern (same classes, breakpoint and active-paragraph band)
 * with one difference. The illustration is a whole web page, so at the
 * frame's width its chat text would be about 7px. The frame therefore shows
 * a crop of the message thread (≈14px text), and an Enlarge button under the
 * caption (not over the image, where it would cover a highlighted message)
 * opens the full illustration.
 *
 * Desktop (≥960px): the paragraphs scroll as ordinary content; the frame is
 * sticky in the right column within this section. The paragraph crossing
 * the middle of the viewport (IntersectionObserver, no wheel interception,
 * no snapping) highlights its message and gently dims the rest (≈220ms),
 * and the caption updates. Three states at most.
 *
 * Below 960px: no sticky behaviour. Each paragraph is followed by an excerpt
 * of the conversation with the same message highlighted.
 */
export function ConversationSteps({ image, frame, frameAlt, note, steps, children }: ConversationStepsProps) {
  const desktop = useMediaQuery(DESKTOP)
  return (
    <div className="sticky-visual conv" data-layout={desktop ? 'sticky' : 'stacked'}>
      {desktop ? (
        <StickyConversation image={image} frame={frame} frameAlt={frameAlt} note={note} steps={steps} />
      ) : (
        <StackedConversation image={image} steps={steps} />
      )}
      {children}
    </div>
  )
}

function StickyConversation({ image, frame, frameAlt, note, steps }: Omit<ConversationStepsProps, 'children'>) {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<Array<HTMLElement | null>>([])
  const gridRef = useRef<HTMLDivElement>(null)
  useStickyFigureHeight(gridRef)
  const current = steps[active]

  // The paragraph crossing the middle of the viewport is the active one.
  useEffect(() => {
    const els = stepRefs.current.filter((el): el is HTMLElement => Boolean(el))
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const i = els.indexOf(entry.target as HTMLElement)
          if (i >= 0) setActive(i)
        }
      },
      { rootMargin: '-46% 0px -53% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [steps.length])

  return (
    <div ref={gridRef} className="sv-grid">
      <ol className="sv-steps" role="list">
        {steps.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => {
              stepRefs.current[i] = el
            }}
            className="sv-step"
            data-active={i === active || undefined}
          >
            <h3 className="sv-step__title">{s.title}</h3>
            <div className="case-prose">{s.body}</div>
          </li>
        ))}
      </ol>
      <div className="sv-media">
        <div className="sv-sticky conv-sticky" style={{ '--conv-ratio': frame.w / frame.h } as CSSProperties}>
          <figure className="conv-figure">
            <Crop image={image} crop={frame} sizes={FRAME_SIZES} alt={frameAlt}>
              {steps.map((s, i) => (
                <Highlight key={s.id} region={s.region} crop={frame} active={i === active} dim />
              ))}
            </Crop>
            <figcaption className="case-caption conv-caption">
              <span className="conv-caption__step" aria-live="polite">
                {current.caption}
              </span>
              <span className="conv-caption__note">
                <CaptionText provenance={getImage(image).provenance}>{note}</CaptionText>
              </span>
            </figcaption>
          </figure>
          <EnlargeButton image={image} />
        </div>
      </div>
    </div>
  )
}

function StackedConversation({ image, steps }: Pick<ConversationStepsProps, 'image' | 'steps'>) {
  const provenance = getImage(image).provenance
  return (
    <div className="sv-stack">
      <ol className="sv-steps" role="list">
        {steps.map((s) => (
          <li key={s.id} className="sv-step" data-active="true">
            <h3 className="sv-step__title">{s.title}</h3>
            <div className="case-prose">{s.body}</div>
            <div className="sv-inline conv-inline">
              <figure className="conv-figure">
                <Crop image={image} crop={s.excerpt} sizes={EXCERPT_SIZES} alt={s.excerptAlt}>
                  <Highlight region={s.region} crop={s.excerpt} active dim />
                </Crop>
                <figcaption className="case-caption conv-caption">
                  <span className="conv-caption__step">
                    <CaptionText provenance={provenance}>{s.caption}</CaptionText>
                  </span>
                </figcaption>
              </figure>
              <EnlargeButton image={image} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

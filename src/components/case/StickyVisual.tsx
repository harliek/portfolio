import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { fallbackSrc, getImage, getVideo, type ImageId, type VideoId } from '../../content/media'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { CaptionText } from '../media/Figure'
import { useImageDialog } from '../media/ImageDialog'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { VideoFigure } from '../media/VideoFigure'

/** A region of the frame, in percent of its width and height. */
export interface Highlight {
  x: number
  y: number
  w: number
  h: number
}

export interface VisualStep {
  id: string
  /** Short heading for the paragraph (h3). */
  title: string
  /** One or two ordinary paragraphs. */
  body: ReactNode
  /** The screenshot for this step. Steps sharing an image keep it on screen (no crossfade). */
  image: ImageId
  /** The corresponding area of the image, highlighted while the step is active. */
  highlight?: Highlight
  /** Dim everything outside the highlight a little (unrelated content stays legible). */
  dim?: boolean
  /** Show the step number as a small marker on the highlight. */
  marker?: boolean
  /** The image caption while this step is active. */
  caption: ReactNode
}

interface StickyVisualProps {
  /** Two or three steps (three visual states at most). */
  steps: VisualStep[]
  /** Frame aspect ratio, e.g. '2940 / 1486'. Defaults to the first image's ratio. */
  ratio?: string
  /** Literal `sizes` for the frame's images. */
  sizes?: string
  /**
   * A recorded walkthrough that plays inside the same frame ("Watch demo"
   * under it). `poster` replaces the recording's poster in the stacked
   * layout (a different real frame, when the default repeats the opening image).
   */
  demo?: { video: VideoId; label?: string; poster?: ImageId }
  /** Content after the steps (both layouts), e.g. a small related note. */
  children?: ReactNode
  className?: string
}

const DESKTOP = '(min-width: 960px)'
const FRAME_SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

/**
 * The one short sticky visual section of a case study.
 *
 * Desktop: the paragraphs scroll as ordinary page content in the left
 * column while the image stays sticky in the right column, only within this
 * section. When a paragraph reaches the middle of the viewport (an
 * IntersectionObserver; no wheel interception, no snapping) it becomes
 * active: its area of the image is highlighted (≈220ms), or the frame
 * crossfades to its screenshot (≈250ms), and the caption updates. Inactive
 * paragraphs stay fully readable. After the section, the image scrolls away.
 *
 * Below 960px: no sticky behaviour; each paragraph is followed by its own
 * image with the same highlight, in natural reading order.
 */
export function StickyVisual({ steps, ratio, sizes = FRAME_SIZES, demo, children, className }: StickyVisualProps) {
  const desktop = useMediaQuery(DESKTOP)
  const first = getImage(steps[0].image)
  const frameRatio = ratio ?? `${first.width} / ${first.height}`
  return (
    <div className={['sticky-visual', className].filter(Boolean).join(' ')} data-layout={desktop ? 'sticky' : 'stacked'}>
      {desktop ? (
        <StickyLayout steps={steps} ratio={frameRatio} sizes={sizes} demo={demo} />
      ) : (
        <StackedLayout steps={steps} ratio={frameRatio} sizes={sizes} demo={demo} />
      )}
      {children}
    </div>
  )
}

/**
 * Writes the sticky figure's height on the grid as --sv-fig-h. case.css uses
 * it to make the last step tall enough that the figure stays pinned until
 * the last paragraph has passed the middle of the viewport, whatever the
 * figure's size (a phone, a conversation, a wide interface).
 */
export function useStickyFigureHeight(gridRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const grid = gridRef.current
    const figure = grid?.querySelector<HTMLElement>('.sv-sticky')
    if (!grid || !figure) return
    const write = () => grid.style.setProperty('--sv-fig-h', `${Math.ceil(figure.offsetHeight)}px`)
    write()
    const ro = new ResizeObserver(write)
    ro.observe(figure)
    return () => ro.disconnect()
  }, [gridRef])
}

function ZoomButton({ image }: { image: ImageId }) {
  const dialog = useImageDialog()
  const alt = getImage(image).alt
  return (
    <button
      type="button"
      className="sv-zoom"
      data-zoom-id={image}
      aria-label={alt ? `Enlarge image. ${alt}` : 'Enlarge image'}
      onClick={(e) => dialog.open(image, e.currentTarget)}
    >
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
        <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function HighlightBox({ step, index, active }: { step: VisualStep; index: number; active: boolean }) {
  if (!step.highlight) return null
  const { x, y, w, h } = step.highlight
  const style = { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` } as CSSProperties
  return (
    <span className="sv-highlight" data-active={active || undefined} data-dim={step.dim || undefined} style={style} aria-hidden="true">
      {step.marker && <span className="sv-marker tabular">{index + 1}</span>}
    </span>
  )
}

function StepCaption({ step, index }: { step: VisualStep; index: number }) {
  const asset = getImage(step.image)
  return (
    <>
      {step.marker && (
        <span className="sv-caption__num tabular" aria-hidden="true">
          {index + 1}
        </span>
      )}
      <span>
        <CaptionText provenance={asset.provenance}>{step.caption}</CaptionText>
      </span>
    </>
  )
}

function StickyLayout({ steps, ratio, sizes, demo }: Required<Pick<StickyVisualProps, 'steps' | 'ratio' | 'sizes'>> & Pick<StickyVisualProps, 'demo'>) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const stepRefs = useRef<Array<HTMLElement | null>>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useStickyFigureHeight(gridRef)
  const images = Array.from(new Set(steps.map((s) => s.image)))
  const current = steps[active]
  const transparent = Boolean(getImage(steps[0].image).transparent)

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

  useEffect(() => {
    if (playing) videoRef.current?.focus({ preventScroll: true })
  }, [playing])

  const video = demo ? getVideo(demo.video) : null
  const variant = video ? (video.variants.find((v) => v.maxViewport === undefined) ?? video.variants[video.variants.length - 1]) : null

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
        <figure className="sv-sticky" data-demo={video ? '' : undefined}>
          <div className="sv-frame" data-transparent={transparent || undefined} data-playing={playing || undefined} style={{ aspectRatio: ratio }}>
            {images.map((id, i) => (
              <div key={id} className="sv-layer" data-active={(!playing && current.image === id) || undefined}>
                <ResponsiveImage image={id} sizes={sizes} fit="contain" priority={i === 0} decorative={current.image !== id} />
              </div>
            ))}
            {!playing && steps.map((s, i) => <HighlightBox key={s.id} step={s} index={i} active={i === active} />)}
            {playing && variant && video && (
              <video
                ref={videoRef}
                className="sv-video"
                src={variant.src}
                poster={fallbackSrc(getImage(video.poster), 1600)}
                controls
                autoPlay
                playsInline
                preload="auto"
                aria-label={video.title}
              />
            )}
            {!playing && <ZoomButton image={current.image} />}
          </div>
          <figcaption className="sv-caption case-caption" aria-live="polite">
            {playing && video ? (
              <span>
                <CaptionText provenance={video.provenance}>{video.caption}</CaptionText>
              </span>
            ) : (
              <StepCaption step={current} index={active} />
            )}
          </figcaption>
          {video && (
            // A plain button whose label says what it does (no pressed state, so the label may change).
            <button type="button" className="button sv-demo" onClick={() => setPlaying((p) => !p)}>
              {playing ? (
                'Close demo'
              ) : (
                <>
                  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                    <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
                  </svg>
                  {demo?.label ?? 'Watch demo'}
                </>
              )}
            </button>
          )}
        </figure>
      </div>
    </div>
  )
}

function StackedLayout({ steps, ratio, sizes, demo }: Required<Pick<StickyVisualProps, 'steps' | 'ratio' | 'sizes'>> & Pick<StickyVisualProps, 'demo'>) {
  return (
    <div className="sv-stack">
      {demo && (
        <div className="sv-stack__demo">
          <VideoFigure video={demo.video} sizes={sizes} label={demo.label ?? 'Watch demo'} poster={demo.poster} />
        </div>
      )}
      <ol className="sv-steps" role="list">
        {steps.map((s, i) => {
          const transparent = Boolean(getImage(s.image).transparent)
          return (
            <li key={s.id} className="sv-step" data-active="true">
              <h3 className="sv-step__title">{s.title}</h3>
              <div className="case-prose">{s.body}</div>
              <figure className="sv-inline">
                <div className="sv-frame" data-transparent={transparent || undefined} style={{ aspectRatio: transparent ? undefined : ratio }}>
                  <div className="sv-layer" data-active="true">
                    <ResponsiveImage image={s.image} sizes={sizes} fit="contain" />
                  </div>
                  <HighlightBox step={s} index={i} active />
                  {/* Phone screens are readable at this size; interface screenshots and slides can be enlarged. */}
                  {!transparent && <ZoomButton image={s.image} />}
                </div>
                <figcaption className="sv-caption case-caption">
                  <StepCaption step={s} index={i} />
                </figcaption>
              </figure>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

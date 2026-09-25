import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getImage, type ImageId } from '../../content/media'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { CaseTitle } from './CasePage'

export interface StoryStep {
  title: string
  text: ReactNode
}

/** A rectangle of a picture, in its source pixels. */
export interface Region {
  x: number
  y: number
  w: number
  h: number
}

/**
 * What the fixed stage shows, one state per step:
 * - video: the recording, its time following the scroll through each step's segment;
 * - images: one screenshot per step;
 * - phones: the three app screens, the step's own phone brought forward;
 * - zoom: one picture, moving to the part each step is about (null shows all of it).
 */
export type Stage =
  | {
      kind: 'video'
      src: string
      poster: string
      width: number
      height: number
      /** Seconds [start, end] for each step. */
      segments: readonly (readonly [number, number])[]
      /** One still (seconds) per step, used under reduced motion. */
      stills: readonly number[]
      label: string
    }
  | { kind: 'images'; images: readonly ImageId[] }
  | { kind: 'phones'; phones: readonly { image: ImageId; name: string }[] }
  | { kind: 'zoom'; image: ImageId; regions: readonly (Region | null)[] }

/** The line in the window where a step becomes the current one (a share of the height from the top). */
const line = () => (window.matchMedia('(max-width: 899.98px)').matches ? 0.72 : 0.55)

const STAGE_SIZES = '(min-width: 1408px) 620px, (min-width: 900px) 46vw, calc(100vw - 48px)'

/**
 * A case study told in a few steps (brief v19). The introduction and then
 * the steps run down the left; the stage stays fixed on the right (sticky,
 * inside the content grid, sized to fit the window) and follows them: as
 * each step reaches the middle of the window it becomes the current one (the
 * others step back a little) and the stage shows its state at the same time.
 * A recording follows the scroll itself, through each step's segment:
 * faster when scrolling faster, holding when scrolling stops, backwards when
 * scrolling up. No timers, no buttons. Before the first step the stage shows
 * its opening state and every step reads at full strength.
 *
 * Phones (below 900px): the introduction, then the stage held under the
 * header while the steps pass beneath it.
 *
 * The stage is the landing point of the project opening (`data-hero-media`);
 * the introduction waits for it (`data-hero-reveal`). Reduced motion: the
 * stage changes state without easing, and a recording shows one still per
 * step.
 */
export function CaseStory({
  title,
  meta,
  lede,
  status,
  steps,
  stage,
  caption,
  note,
}: {
  title: string
  meta: readonly string[]
  lede: ReactNode
  status?: ReactNode
  steps: readonly StoryStep[]
  stage: Stage
  /** A short line under the stage (what the picture is). */
  caption?: ReactNode
  /** A scope line after the steps. */
  note?: ReactNode
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(-1)
  /** The stage's per-frame listener (a recording's time). */
  const follow = useRef<((k: number, local: number) => void) | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const m = { top: 0, height: 1, offsets: [0], r0: 0, r1: 1, line: 0 }
    const measure = () => {
      const box = list.getBoundingClientRect()
      m.top = box.top + window.scrollY
      m.height = box.height || 1
      m.offsets = [...list.children].map((el) => el.getBoundingClientRect().top - box.top)
      m.offsets.push(m.height)
      m.line = line() * window.innerHeight
      // Where the line falls in the list at the top and at the bottom of the page's scroll.
      m.r0 = m.line - m.top
      m.r1 = ScrollTrigger.maxScroll(window) + m.line - m.top
    }
    /**
     * The point of the list under the line. One to one wherever the page allows; where the list already
     * starts above the line, or the page ends before the line reaches the list's end, the first or last
     * 240px of scrolling are stretched so the story still begins at its start and finishes at its end.
     */
    const place = () => {
      const raw = window.scrollY + m.line - m.top
      const { r0, r1, height: L } = m
      const E = 240
      if (r0 > 0 && r1 < L && r1 - r0 < 2 * E) return ((raw - r0) / Math.max(1, r1 - r0)) * L
      let pos = raw
      if (r0 > 0 && raw < r0 + E) pos = ((raw - r0) / E) * (r0 + E)
      if (r1 < L && raw > r1 - E) pos = r1 - E + ((raw - (r1 - E)) / E) * (L - (r1 - E))
      return pos
    }
    const update = () => {
      const pos = place()
      const n = steps.length
      if (pos < 0) {
        setActive(-1)
        follow.current?.(-1, 0)
        return
      }
      if (pos >= m.height) {
        setActive(n - 1)
        follow.current?.(n - 1, 1)
        return
      }
      let k = 0
      while (k < n - 1 && pos >= m.offsets[k + 1]) k++
      setActive(k)
      follow.current?.(k, Math.min(1, Math.max(0, (pos - m.offsets[k]) / (m.offsets[k + 1] - m.offsets[k] || 1))))
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onRefresh: () => {
        measure()
        update()
      },
      onUpdate: update,
    })
    return () => trigger.kill()
  }, [steps.length])

  const bind = useCallback((fn: ((k: number, local: number) => void) | null) => {
    follow.current = fn
  }, [])

  return (
    <div className="cs story cx-wrap" data-started={active >= 0 || undefined}>
      <header className="cs__intro" data-hero-reveal>
        <CaseTitle title={title} meta={meta} />
        <div className="cx-lede">{lede}</div>
        {status && <p className="cx-status">{status}</p>}
      </header>
      <div className="cs__media story__media">
        <StageView stage={stage} active={active} bind={bind} />
        {caption && (
          <p className="cx-caption story__caption" data-hero-reveal>
            {caption}
          </p>
        )}
      </div>
      <div className="cs__body" data-hero-reveal>
        <ol ref={listRef} className="story__steps" role="list">
          {steps.map((s, k) => (
            <li key={s.title} className="story__step" data-current={k === active || undefined}>
              <h2 className="story__title">{s.title}</h2>
              <p className="story__text">{s.text}</p>
            </li>
          ))}
        </ol>
        {note && <p className="cs__note">{note}</p>}
      </div>
    </div>
  )
}

function StageView({ stage, active, bind }: { stage: Stage; active: number; bind: (fn: ((k: number, local: number) => void) | null) => void }) {
  if (stage.kind === 'video') return <VideoStage stage={stage} bind={bind} />
  if (stage.kind === 'images') {
    const asset = getImage(stage.images[0])
    const shown = Math.max(0, active)
    return (
      <div className="story__stage story__frame" data-hero-media="" style={{ '--aspect': asset.width / asset.height } as CSSProperties}>
        {stage.images.map((id, k) => (
          <div key={id} className="story__layer" data-on={k === shown || undefined} aria-hidden={k === shown ? undefined : true}>
            <ResponsiveImage image={id} sizes={STAGE_SIZES} priority={k === 0} />
          </div>
        ))}
      </div>
    )
  }
  if (stage.kind === 'phones') {
    return (
      <div className="story__stage story__phones" data-hero-media="" data-focus={active >= 0 || undefined}>
        {stage.phones.map((p, k) => (
          <div key={p.image} className="story__phone" data-on={k === active || undefined}>
            <ResponsiveImage image={p.image} sizes="(min-width: 1100px) 190px, 28vw" alt={`${p.name} screen`} priority />
          </div>
        ))}
      </div>
    )
  }
  return <ZoomStage stage={stage} active={active} />
}

/** The recording, its time eased toward the scroll's (and one still per step under reduced motion). */
function VideoStage({ stage, bind }: { stage: Extract<Stage, { kind: 'video' }>; bind: (fn: ((k: number, local: number) => void) | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    let target = stage.segments[0][0]
    let frame = 0
    const tick = () => {
      frame = 0
      if (video.readyState >= 1 && !video.seeking) {
        const d = target - video.currentTime
        if (Math.abs(d) > 1 / 60) video.currentTime = prefersReducedMotion() ? target : video.currentTime + d * 0.45
      }
      if (Math.abs(target - video.currentTime) > 1 / 60) frame = requestAnimationFrame(tick)
    }
    bind((k, local) => {
      const i = Math.max(0, k)
      const [a, b] = stage.segments[i]
      target = prefersReducedMotion() ? (k < 0 ? a : stage.stills[i]) : k < 0 ? a : a + (b - a) * local
      if (!frame) frame = requestAnimationFrame(tick)
    })
    // Some browsers paint a seeked frame only once the video has played: play and pause it once, muted, when it first shows.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (video.paused && video.currentTime === 0) void video.play().then(() => video.pause(), () => {})
    })
    io.observe(video)
    return () => {
      bind(null)
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [stage, bind])

  return (
    <div className="story__stage story__frame" data-hero-media="" style={{ '--aspect': stage.width / stage.height } as CSSProperties}>
      <video
        ref={ref}
        className="story__video"
        src={stage.src}
        poster={stage.poster}
        width={stage.width}
        height={stage.height}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-label={stage.label}
      />
    </div>
  )
}

/** One picture; each step moves it to its region (scaled to fit the frame, kept inside the picture's edges). */
function ZoomStage({ stage, active }: { stage: Extract<Stage, { kind: 'zoom' }>; active: number }) {
  const asset = getImage(stage.image)
  const W = asset.width
  const H = asset.height
  const r = active >= 0 ? stage.regions[active] : null
  let transform = 'none'
  if (r) {
    const s = Math.max(1, Math.min(W / r.w, H / r.h))
    const clamp = (v: number, lo: number) => Math.min(0, Math.max(lo, v))
    const tx = clamp(W / 2 - (r.x + r.w / 2) * s, W - W * s)
    const ty = clamp(H / 2 - (r.y + r.h / 2) * s, H - H * s)
    transform = `translate(${((tx / W) * 100).toFixed(3)}%, ${((ty / H) * 100).toFixed(3)}%) scale(${s.toFixed(4)})`
  }
  return (
    <div className="story__stage story__frame" data-hero-media="" style={{ '--aspect': W / H } as CSSProperties}>
      <div className="story__zoom" style={{ transform }}>
        <ResponsiveImage image={stage.image} sizes="(min-width: 1408px) 1240px, (min-width: 900px) 92vw, 200vw" priority />
      </div>
    </div>
  )
}

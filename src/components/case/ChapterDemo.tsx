import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export interface Chapter {
  label: string
  /** One or two lines, shown under the picture while this chapter is selected. */
  caption: string
  /** Video chapters: where the chapter starts and ends (s); selecting it shows its still at `still`. */
  start?: number
  end?: number
  still?: number
  /** Still chapters: the picture itself (an image or a composed close-up). */
  visual?: ReactNode
}

interface ChapterDemoProps {
  chapters: readonly Chapter[]
  /** A recording to seek (a keyframe-dense encode); without it, chapters show their own visuals. */
  video?: { src: string; poster: string; width: number; height: number }
  /** The picture's proportions (default 16 / 10). */
  aspect?: string
  /** Accessible name of the whole demonstration. */
  label: string
  /** Text above the tabs (a scope line, a persistent quote). */
  head?: ReactNode
  /** 18px tabs instead of 16px. */
  large?: boolean
  /** Seconds each still chapter holds during the walkthrough. */
  hold?: number
  numbered?: boolean
}

/**
 * A demonstration in explicit chapters (brief v17): equal-width tabs above
 * the picture (sentence case, the active one with a pink line), one caption
 * below it with two lines reserved (its text is simply replaced), and a
 * visible Play walkthrough control. Selecting a tab shows that chapter and
 * holds it still for inspection; Play walkthrough runs through the chapters
 * in order (a recording plays each chapter's segment; stills hold for
 * `hold` seconds) and stops at the end or on any tab. Ordinary scrolling
 * is never captured. Tabs follow the ARIA tabs pattern (arrow keys move
 * between them). Reduced motion: the walkthrough steps without playing
 * video.
 */
export function ChapterDemo({ chapters, video, aspect = '16 / 10', label, head, large, hold = 3.6, numbered = true }: ChapterDemoProps) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const id = useId()
  const [near, setNear] = useState(false)

  // The recording loads only as the demonstration approaches.
  useEffect(() => {
    const root = rootRef.current
    if (!root || !video) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '60% 0px' })
    io.observe(root)
    return () => io.disconnect()
  }, [video])

  /** Shows chapter i still (its inspection frame). */
  const show = useCallback(
    (i: number) => {
      setIndex(i)
      const v = videoRef.current
      const c = chapters[i]
      if (v && c.still !== undefined) {
        v.pause()
        v.currentTime = c.still
      }
    },
    [chapters],
  )

  // The first chapter's frame once the recording can seek.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !near) return
    const onMeta = () => {
      if (v.paused && chapters[0].still !== undefined) v.currentTime = chapters[0].still
    }
    v.addEventListener('loadedmetadata', onMeta)
    return () => v.removeEventListener('loadedmetadata', onMeta)
  }, [near, chapters])

  // The walkthrough.
  useEffect(() => {
    if (!playing) return
    const v = videoRef.current
    if (video && v && !reduced) {
      const c = chapters[index]
      if (c.start !== undefined && (v.currentTime < c.start || v.currentTime >= (c.end ?? Infinity))) v.currentTime = c.start
      void v.play().catch(() => setPlaying(false))
      const onTime = () => {
        const cur = chapters[index]
        if (cur.end !== undefined && v.currentTime >= cur.end) {
          if (index < chapters.length - 1) {
            setIndex(index + 1)
            if (chapters[index + 1].start !== undefined) v.currentTime = chapters[index + 1].start!
          } else {
            v.pause()
            setPlaying(false)
          }
        }
      }
      v.addEventListener('timeupdate', onTime)
      return () => v.removeEventListener('timeupdate', onTime)
    }
    // Stills (or reduced motion): hold each chapter, then move on.
    const t = window.setTimeout(() => {
      if (index < chapters.length - 1) show(index + 1)
      else setPlaying(false)
    }, hold * 1000)
    return () => window.clearTimeout(t)
  }, [playing, index, chapters, video, reduced, hold, show])

  const select = (i: number) => {
    setPlaying(false)
    show(i)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    const n = chapters.length
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (to < 0) return
    e.preventDefault()
    select(to)
    tabRefs.current[to]?.focus()
  }

  const togglePlay = () => {
    if (playing) {
      videoRef.current?.pause()
      setPlaying(false)
      return
    }
    // From the last chapter, the walkthrough starts again at the first.
    if (index === chapters.length - 1) show(0)
    setPlaying(true)
  }

  const current = chapters[index]
  return (
    <section ref={rootRef} className={['chapters', large ? 'chapters--large' : ''].join(' ')} aria-label={label} style={{ '--chapters-aspect': aspect } as CSSProperties}>
      {head}
      <div className="chapters__tabs" role="tablist" aria-label={`${label}: chapters`}>
        {chapters.map((c, i) => (
          <button
            key={c.label}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === index}
            aria-controls={`${id}-panel`}
            tabIndex={i === index ? 0 : -1}
            className="chapters__tab"
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {numbered && <span className="chapters__num">{String(i + 1).padStart(2, '0')}</span>}
            <span>{c.label}</span>
          </button>
        ))}
      </div>
      <div className="chapters__stage" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${index}`}>
        {video ? (
          <div className="cx-frame">
            <video
              ref={videoRef}
              src={near ? video.src : undefined}
              poster={video.poster}
              width={video.width}
              height={video.height}
              muted
              playsInline
              preload={near ? 'auto' : 'none'}
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        ) : (
          current.visual
        )}
      </div>
      <div className="chapters__foot">
        <p className="chapters__caption" aria-live="polite">
          {current.caption}
        </p>
        <button type="button" className="chapters__play" aria-pressed={playing} onClick={togglePlay}>
          <span className="chapters__play-icon" aria-hidden="true" />
          {playing ? 'Pause walkthrough' : 'Play walkthrough'}
        </button>
      </div>
    </section>
  )
}

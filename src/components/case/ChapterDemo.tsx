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
  /** Still chapters: the picture itself. */
  visual?: ReactNode
}

interface ChapterDemoProps {
  chapters: readonly Chapter[]
  /** A recording to play (a keyframe-dense encode); without it, chapters show their own visuals. */
  video?: { src: string; poster: string; width: number; height: number }
  /** The picture's proportions (default 16 / 10). */
  aspect?: string
  /** Accessible name of the whole demonstration. */
  label: string
  /** Text above the tabs (a scope line, a persistent quote). */
  head?: ReactNode
  /** Seconds each still chapter holds during the walkthrough. */
  hold?: number
  numbered?: boolean
  /** The picture is the page's hero (the landing point of the project opening). */
  hero?: boolean
}

/**
 * A walkthrough in explicit chapters (briefs v17 and v18): equal-width tabs
 * above one picture, one caption below it with two lines reserved (its text
 * is simply replaced), and a Pause/Play control.
 *
 * It starts by itself once half of it is in view and pauses when it
 * leaves; a recording plays each chapter's segment muted and inline, stills
 * hold for `hold` seconds each. At the end it stops on the last chapter (no
 * rapid cycling); coming back into view later starts it again from the
 * first. Choosing a tab or pressing Pause hands control to the visitor (it
 * no longer starts by itself until Play is pressed). Only one video plays:
 * this component's, and only while visible. Reduced motion: nothing starts
 * by itself; the first chapter shows, and Play steps through without video
 * motion. Tabs follow the ARIA tabs pattern.
 */
export function ChapterDemo({ chapters, video, aspect = '16 / 10', label, head, hold = 4, numbered = true, hero }: ChapterDemoProps) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [near, setNear] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const state = useRef({ userPaused: false, finished: false, visible: false })
  const id = useId()

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

  // Load as it approaches; start when half visible; pause when it leaves.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const s = state.current
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '60% 0px' })
    const viewIo = new IntersectionObserver(
      ([e]) => {
        const visible = e.intersectionRatio >= 0.5
        if (visible === s.visible) return
        s.visible = visible
        if (visible) {
          if (s.userPaused || reduced) return
          if (s.finished) {
            s.finished = false
            show(0)
          }
          setPlaying(true)
        } else {
          videoRef.current?.pause()
          setPlaying(false)
        }
      },
      { threshold: [0, 0.5, 1] },
    )
    nearIo.observe(root)
    viewIo.observe(root)
    return () => {
      nearIo.disconnect()
      viewIo.disconnect()
    }
  }, [reduced, show])

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
    const s = state.current
    const v = videoRef.current
    const finish = () => {
      s.finished = true
      setPlaying(false)
    }
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
            finish()
          }
        }
      }
      v.addEventListener('timeupdate', onTime)
      return () => v.removeEventListener('timeupdate', onTime)
    }
    // Stills (or reduced motion): hold each chapter at a readable pace, then move on.
    const t = window.setTimeout(() => {
      if (index < chapters.length - 1) show(index + 1)
      else finish()
    }, hold * 1000)
    return () => window.clearTimeout(t)
  }, [playing, index, chapters, video, reduced, hold, show])

  const select = (i: number) => {
    state.current.userPaused = true
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
    const s = state.current
    if (playing) {
      s.userPaused = true
      videoRef.current?.pause()
      setPlaying(false)
      return
    }
    s.userPaused = false
    if (s.finished || index === chapters.length - 1) {
      s.finished = false
      show(0)
    }
    setPlaying(true)
  }

  const current = chapters[index]
  const reveal = hero ? { 'data-hero-reveal': '' } : {}
  return (
    <section ref={rootRef} className="chapters" aria-label={label} style={{ '--chapters-aspect': aspect } as CSSProperties}>
      {head}
      <div className="chapters__tabs" role="tablist" aria-label={`${label}: chapters`} {...reveal}>
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
      <div className="chapters__stage" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${index}`} {...(hero ? { 'data-hero-media': '' } : {})}>
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
      <div className="chapters__foot" {...reveal}>
        <p className="chapters__caption" aria-live="polite">
          {current.caption}
        </p>
        <button type="button" className="chapters__play" aria-pressed={playing} onClick={togglePlay}>
          <span className="chapters__play-icon" aria-hidden="true" />
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </section>
  )
}

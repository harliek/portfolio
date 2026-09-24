import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { fallbackSrc, getImage, getVideo, type ImageId, type VideoAsset, type VideoId } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ExpandIcon } from './Figure'
import { ResponsiveImage } from './ResponsiveImage'

/*
 * DemoVideo: a product recording that plays by itself (CaseScroll `video`
 * media).
 *
 * - Muted, inline, looping, with native controls. It starts when at least
 *   35% of it is visible (IntersectionObserver) and keeps playing while the
 *   text scrolls; scrolling never seeks, scrubs or restarts it.
 * - Autoplay refused (NotAllowedError, e.g. a browser policy): the poster
 *   stays with one obvious "Play demo" button; native controls appear once
 *   it plays.
 * - Paused when it is completely outside the viewport (or the tab is
 *   hidden), resumed when it returns, unless the visitor paused it: an
 *   explicit pause is never overridden.
 * - Reduced motion: no autoplay; the poster with "Play demo".
 * - Expand (a small button inside the player, top right, never on the native
 *   control bar): a larger view continues from the same time; the inline copy
 *   is paused first, so two copies never play. Closing restores the inline
 *   copy at the expanded view's time, playing if the expanded one was
 *   playing, paused (as the visitor's own pause) if it was paused. Focus
 *   returns to the expand button.
 * - Nothing loads twice: the poster is drawn underneath until the first frame
 *   exists, so the stage is never empty.
 */

/** Share of the player that must be visible before it starts by itself. */
const PLAY_RATIO = 0.35

type Status = 'idle' | 'playing' | 'paused' | 'blocked'

/** The smallest variant suited to the current viewport. */
function pickVariant(video: VideoAsset) {
  const vw = window.innerWidth
  return video.variants.find((v) => v.maxViewport !== undefined && vw <= v.maxViewport) ?? video.variants[video.variants.length - 1]
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  )
}

interface DemoVideoProps {
  video: VideoId
  /** A representative frame; defaults to the recording's manifest poster. */
  poster?: ImageId
  /** `sizes` for the poster image. */
  sizes: string
  /** 'sticky': bounded by the viewport height beside the story; 'inline': the stacked layout. */
  variant: 'sticky' | 'inline'
  /** Caption under the player; defaults to the manifest caption. */
  caption?: string
}

interface Expanded {
  time: number
  play: boolean
  muted: boolean
  volume: number
}

export function DemoVideo({ video: id, poster, sizes, variant, caption }: DemoVideoProps) {
  const asset = getVideo(id)
  const posterId = poster ?? asset.poster
  const posterAsset = getImage(posterId)
  const reduced = useReducedMotion()
  const captionId = useId()
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const [src] = useState(() => pickVariant(asset).src)
  const [status, setStatus] = useState<Status>('idle')
  const [hasFrame, setHasFrame] = useState(false)
  const [expanded, setExpanded] = useState<Expanded | null>(null)
  /** Imperative state read by event handlers (never rendered). */
  const ctl = useRef({ inView: false, userPaused: false, selfPause: false, autoStart: false, userStarted: false, expanded: false, reduced })

  /** Starts playback by itself when allowed: visible, not paused by the visitor, not expanded, no reduced motion. */
  const tryPlay = useCallback(() => {
    const v = videoRef.current
    const c = ctl.current
    if (!v || !v.paused || c.reduced || c.userPaused || c.expanded || !c.inView || document.visibilityState === 'hidden') return
    c.autoStart = true
    v.play().then(
      () => {
        c.autoStart = false
      },
      (err: unknown) => {
        c.autoStart = false
        // AbortError: interrupted by a pause (scrolled away quickly); not a refusal.
        if (err instanceof DOMException && err.name === 'NotAllowedError') setStatus('blocked')
      },
    )
  }, [])

  /** Pauses without counting as the visitor's pause. */
  const autoPause = useCallback(() => {
    const v = videoRef.current
    if (!v || v.paused) return
    ctl.current.selfPause = true
    v.pause()
  }, [])

  // Visibility: start at 35% visible, pause only when completely out of view.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.intersectionRatio >= PLAY_RATIO) {
          ctl.current.inView = true
          tryPlay()
        } else if (!entry.isIntersecting) {
          ctl.current.inView = false
          autoPause()
        }
      },
      { threshold: [0, PLAY_RATIO] },
    )
    io.observe(stage)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [tryPlay, autoPause])

  // Reduced motion switched on: stop a recording that started by itself (a visitor's own playback continues).
  useEffect(() => {
    ctl.current.reduced = reduced
    if (reduced && !ctl.current.userStarted) autoPause()
    else if (!reduced) tryPlay()
  }, [reduced, autoPause, tryPlay])

  // Leaving the page always stops playback.
  useEffect(() => {
    const v = videoRef.current
    return () => {
      v?.pause()
    }
  }, [])

  const onPlay = () => {
    const c = ctl.current
    if (!c.autoStart) c.userStarted = true
    c.userPaused = false
    setStatus('playing')
  }

  const onPause = () => {
    const v = videoRef.current
    const c = ctl.current
    if (c.selfPause) c.selfPause = false
    else if (v && !v.ended && !c.expanded && document.visibilityState !== 'hidden') {
      // The visitor's own pause (native controls, keyboard, or another film starting): respected.
      c.userPaused = true
      c.userStarted = false
    }
    setStatus('paused')
  }

  /** "Play demo" (autoplay refused, or reduced motion): a direct gesture, so play() is allowed. */
  const playNow = () => {
    const v = videoRef.current
    if (!v) return
    ctl.current.userPaused = false
    v.play().then(
      () => v.focus({ preventScroll: true }),
      () => {},
    )
  }

  const openExpanded = () => {
    const v = videoRef.current
    if (!v) return
    const playing = !v.paused && !v.ended
    ctl.current.expanded = true
    autoPause()
    // Blocked or never started: the visitor asked to watch, so the larger view plays (a user gesture). A paused
    // recording stays paused.
    const play = playing || status === 'blocked' || (status === 'idle' && !reduced)
    setExpanded({ time: v.currentTime, play, muted: v.muted, volume: v.volume })
  }

  const closeExpanded = (result: { time: number; playing: boolean; muted: boolean; volume: number }) => {
    const v = videoRef.current
    const c = ctl.current
    setExpanded(null)
    c.expanded = false
    if (v) {
      if (Number.isFinite(result.time)) v.currentTime = result.time
      v.muted = result.muted
      v.volume = result.volume
      if (result.playing) {
        c.userPaused = false
        c.userStarted = true
        v.play().catch(() => setStatus('blocked'))
      } else if (result.time > 0) {
        // Paused in the larger view: that pause is the visitor's.
        c.userPaused = true
      }
    }
    expandRef.current?.focus({ preventScroll: true })
  }

  const ratio = asset.width / asset.height
  const showPlay = status === 'blocked' || (status === 'idle' && reduced)
  const label = caption ?? asset.caption

  return (
    <figure className="cs-figure cs-demo" data-variant={variant}>
      <div ref={stageRef} className="cs-stage" data-kind="video" data-status={status} style={{ '--stage-r': ratio } as CSSProperties}>
        {/* Drawn underneath until the recording has a frame: the stage is never empty. */}
        {!hasFrame && <ResponsiveImage image={posterId} sizes={sizes} decorative fit="contain" priority className="cs-demo__poster" />}
        <video
          ref={videoRef}
          className="cs-demo__video"
          src={src}
          poster={fallbackSrc(posterAsset, 1600)}
          width={asset.width}
          height={asset.height}
          muted
          loop
          playsInline
          controls={!showPlay}
          preload={reduced ? 'metadata' : 'auto'}
          aria-label={asset.title}
          aria-describedby={captionId}
          onLoadedData={() => setHasFrame(true)}
          onPlay={onPlay}
          onPause={onPause}
        />
        {showPlay && (
          <span className="cs-demo__playwrap">
            <button type="button" className="button cs-demo__play" onClick={playNow}>
              <PlayIcon />
              Play demo
            </button>
          </span>
        )}
        <button ref={expandRef} type="button" className="cs-demo__expand" aria-label="Expand video" onClick={openExpanded}>
          <ExpandIcon />
        </button>
      </div>
      <figcaption id={captionId} className="cs-caption">
        {label}
      </figcaption>
      {expanded && <VideoDialog asset={asset} posterSrc={fallbackSrc(posterAsset, 1600)} caption={label} start={expanded} onClose={closeExpanded} />}
    </figure>
  )
}

/* ----------------------------------------------------------------------- */
/* The larger view                                                          */
/* ----------------------------------------------------------------------- */

interface VideoDialogProps {
  asset: VideoAsset
  posterSrc: string
  caption: string
  start: Expanded
  onClose: (result: { time: number; playing: boolean; muted: boolean; volume: number }) => void
}

/**
 * A native modal <dialog> (focus contained, Escape and a click on the
 * backdrop close it, page scrolling locked) with the largest variant, which
 * is shown only once it has reached the inline copy's time (no flash of the
 * first frame). Mounted only while open.
 */
function VideoDialog({ asset, posterSrc, caption, start, onClose }: VideoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)
  const titleId = useId()
  const src = asset.variants[asset.variants.length - 1].src

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-dialog-open')
    closeRef.current?.focus()
    // No dialog.close() here: that would fire 'close' (and restore the inline copy) when React re-runs this
    // effect in development; unmounting removes the dialog from the top layer anyway.
    return () => document.documentElement.classList.remove('is-dialog-open')
  }, [])

  const onLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = start.muted
    v.volume = start.volume
    if (start.time > 0.05 && Math.abs(v.currentTime - start.time) > 0.05) v.currentTime = start.time
    else show()
  }

  const show = () => {
    setReady(true)
    const v = videoRef.current
    if (v && start.play) v.play().catch(() => {})
  }

  // Every close path (button, Escape, backdrop) ends here.
  const handleClose = () => {
    const v = videoRef.current
    // Closed before the larger copy reached its start time: the inline copy continues as it was.
    if (!v || !ready) {
      onClose({ time: start.time, playing: start.play, muted: start.muted, volume: start.volume })
      return
    }
    onClose({ time: v.currentTime, playing: !v.paused && !v.ended, muted: v.muted, volume: v.volume })
  }

  return (
    <dialog
      ref={dialogRef}
      className="image-dialog cs-video-dialog"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) dialogRef.current?.close()
      }}
    >
      <div className="image-dialog__panel">
        <div className="image-dialog__bar">
          <p id={titleId} className="image-dialog__count t-small">
            {asset.title}
          </p>
          <div className="image-dialog__controls">
            <button ref={closeRef} type="button" className="button button--small" onClick={() => dialogRef.current?.close()}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="m3.5 3.5 9 9m0-9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Close
            </button>
          </div>
        </div>
        <div className="cs-video-dialog__stage">
          <video
            ref={videoRef}
            className="cs-video-dialog__video"
            data-ready={ready || undefined}
            src={src}
            poster={start.time > 0.05 ? undefined : posterSrc}
            width={asset.width}
            height={asset.height}
            controls
            loop
            playsInline
            muted={start.muted}
            preload="auto"
            aria-label={asset.title}
            onLoadedMetadata={onLoadedMetadata}
            onSeeked={() => {
              if (!ready) show()
            }}
          />
        </div>
        <p className="image-dialog__caption t-small">{caption}</p>
      </div>
    </dialog>
  )
}

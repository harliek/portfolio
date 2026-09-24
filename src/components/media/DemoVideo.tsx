import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { fallbackSrc, getImage, getVideo, type ImageId, type VideoAsset, type VideoId } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ExpandIcon } from './ExpandIcon'
import { enterFullscreen, NATIVE_FULLSCREEN } from './fullscreen'
import { closeOnCancel, closeWithFade } from './dialogExit'
import { ResponsiveImage } from './ResponsiveImage'
import { drawUnderlay, onFramePresented, type Underlay } from './videoFrame'

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
 * - A manifest `startAt` (e.g. the Spreadsheet Agent's 16.5s, just before its
 *   build plan appears) is applied once, right before the recording first
 *   plays (by itself, through "Play demo", or in the larger view); the loop
 *   then restarts from 0. Nothing seeks until playback is requested, so the
 *   poster stays for visitors who never start it.
 * - While "Play demo" is offered, the poster image lies over the player, so a
 *   seek or a closed larger view never replaces it with an arbitrary frame;
 *   likewise while the first seek to the start time is under way.
 * - Expand (a small button at the right end of the caption row, never on the
 *   recording, always visible; the native full screen button is removed so
 *   it is the player's one enlarge control, and full screen stays available
 *   inside the larger view): a larger view continues from the same time; the inline copy
 *   is paused first, so two copies never play. Closing restores the inline
 *   copy at the expanded view's time, playing if the expanded one was
 *   playing, paused (as the visitor's own pause) if it was paused. Focus
 *   returns to the expand button. On a phone or a touch screen, Expand puts
 *   the recording itself in the browser's full screen instead (it can turn
 *   to landscape there; a dialog would be no larger than the inline player).
 * - The poster wins the bandwidth: the recording is neither requested in
 *   full nor started until the poster image has loaded, so a slow connection
 *   shows the poster (not an empty frame with a spinner) first.
 * - Nothing loads twice: the poster is drawn underneath, so the stage is never
 *   empty, and the video's own poster reuses the file the picture already
 *   loaded. The recording stays transparent until it has put a frame on
 *   screen, then fades in over the poster (videoFrame.ts; at once under
 *   reduced motion): no black frame, and poster to recording is a short
 *   dissolve rather than a cut.
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
  /** What the inline player shows as the larger view opens (its frame, or the poster): drawn there until its own copy has a frame. */
  from: Underlay | null
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
  const startAt = asset.startAt ?? 0
  const [status, setStatus] = useState<Status>('idle')
  /** The recording has put a frame on screen (it is shown from then on, over the poster). */
  const [hasFrame, setHasFrame] = useState(false)
  const [expanded, setExpanded] = useState<Expanded | null>(null)
  /** The poster file the picture loaded (undefined until then; '' if it failed). */
  const [posterSrc, setPosterSrc] = useState<string>()
  /** The recording itself is in full screen (Expand on a phone or touch screen): its native controls are always there. */
  const [fullscreen, setFullscreen] = useState(false)
  /** Seeking to the start time from a frame already on screen: the poster covers the frame until the seek lands. */
  const [covering, setCovering] = useState(false)
  const posterReady = posterSrc !== undefined
  /** Imperative state read by event handlers (never rendered). */
  const ctl = useRef({ inView: false, userPaused: false, selfPause: false, autoStart: false, userStarted: false, expanded: false, reduced, posterReady, startDone: !(startAt > 0) })

  /** The manifest's start time, once, when playback is about to begin (needs the recording's metadata; see onLoadedMetadata). */
  const seekToStart = useCallback(() => {
    const v = videoRef.current
    const c = ctl.current
    if (!v || c.startDone || v.readyState < HTMLMediaElement.HAVE_METADATA) return
    c.startDone = true
    const last = Number.isFinite(v.duration) ? v.duration - 1 : startAt
    if (v.currentTime >= 0.05) return
    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setCovering(true)
    v.currentTime = Math.max(0, Math.min(startAt, last))
  }, [startAt])

  /** Starts playback by itself when allowed: visible, not paused by the visitor, not expanded, no reduced motion. */
  const tryPlay = useCallback(() => {
    const v = videoRef.current
    const c = ctl.current
    if (!v || !v.paused || !c.posterReady || c.reduced || c.userPaused || c.expanded || !c.inView || document.visibilityState === 'hidden') return
    seekToStart()
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
  }, [seekToStart])

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
        } else if (!entry.isIntersecting && !document.fullscreenElement) {
          // (In full screen the page behind is not what the visitor is watching.)
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

  // The poster first: note the file it loaded, then the recording may load and start.
  useEffect(() => {
    const img = stageRef.current?.querySelector<HTMLImageElement>('.cs-demo__poster img')
    if (!img) {
      setPosterSrc('')
      return
    }
    const done = () => setPosterSrc(img.naturalWidth ? img.currentSrc || img.src : '')
    if (img.complete) {
      done()
      return
    }
    img.addEventListener('load', done)
    img.addEventListener('error', done)
    return () => {
      img.removeEventListener('load', done)
      img.removeEventListener('error', done)
    }
  }, [])

  useEffect(() => {
    ctl.current.posterReady = posterReady
    if (posterReady) tryPlay()
  }, [posterReady, tryPlay])

  // Reduced motion switched on: stop a recording that started by itself (a visitor's own playback continues).
  useEffect(() => {
    ctl.current.reduced = reduced
    if (reduced && !ctl.current.userStarted) autoPause()
    else if (!reduced) tryPlay()
  }, [reduced, autoPause, tryPlay])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(videoRef.current) && document.fullscreenElement === videoRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // The recording appears once it has a frame of its own (never the black box of a playing video without one).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    return onFramePresented(v, () => setHasFrame(true))
  }, [])

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
    seekToStart()
    v.play().then(
      () => v.focus({ preventScroll: true }),
      () => {},
    )
  }

  const openExpanded = () => {
    const v = videoRef.current
    if (!v) return
    const playing = !v.paused && !v.ended
    // Blocked or never started: the visitor asked to watch, so the larger view plays (a user gesture). A paused
    // recording stays paused.
    const play = playing || status === 'blocked' || (status === 'idle' && !reduced)
    const c = ctl.current
    if (window.matchMedia(NATIVE_FULLSCREEN).matches) {
      // The same element in full screen: it simply continues (started first, within the gesture, if the visitor
      // asked to watch). Without full screen support, the dialog below takes over.
      if (play && !playing) playNow()
      if (enterFullscreen(v)) return
    }
    // Never played yet and about to play: the larger view begins where the first play would.
    const time = !c.startDone && play ? startAt : v.currentTime
    if (play) c.startDone = true
    c.expanded = true
    autoPause()
    // The larger view opens on what is on screen here: this frame, or the poster.
    const from = hasFrame && !showPlay && !covering ? v : (stageRef.current?.querySelector<HTMLImageElement>('.cs-demo__poster img') ?? null)
    setExpanded({ time, play, muted: v.muted, volume: v.volume, from })
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

  const onLoadedMetadata = () => {
    // Playback was requested before the metadata arrived: begin at the start time, before the first frame shows.
    if (videoRef.current && !videoRef.current.paused) seekToStart()
  }

  return (
    <figure className="cs-figure cs-demo" data-variant={variant} style={{ '--stage-r': ratio } as CSSProperties}>
      <div ref={stageRef} className="cs-stage" data-kind="video" data-status={status}>
        {/* Underneath (the stage is never empty, and the recording fades in over it), and over it while "Play demo" is offered. */}
        <ResponsiveImage
          image={posterId}
          sizes={sizes}
          decorative
          fit="contain"
          priority
          className={showPlay || covering ? 'cs-demo__poster cs-demo__poster--over' : 'cs-demo__poster'}
        />
        <video
          ref={videoRef}
          className="cs-demo__video"
          src={src}
          poster={posterSrc || undefined}
          width={asset.width}
          height={asset.height}
          muted
          loop
          playsInline
          controls={!showPlay || fullscreen}
          // One enlarge control per player (R4-01): Expand below the recording. The native full screen button
          // returns only while the recording is in full screen (touch Expand), so it can be left there.
          controlsList={fullscreen ? undefined : 'nofullscreen'}
          preload={!posterReady ? 'none' : reduced ? 'metadata' : 'auto'}
          data-frame={hasFrame || undefined}
          aria-label={asset.title}
          aria-describedby={captionId}
          onLoadedMetadata={onLoadedMetadata}
          onSeeked={() => setCovering(false)}
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
      </div>
      {/* At the right end of the caption row, off the recording (case.css .cs-expand). */}
      <button ref={expandRef} type="button" className="cs-expand" aria-label="Expand video" onClick={openExpanded}>
        <ExpandIcon />
      </button>
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
 * backdrop close it, page scrolling locked) with the largest variant. It
 * opens on the inline player's frame (or poster), drawn underneath, and its
 * own copy fades in over it once that copy has a frame at the inline time
 * (never a black stage, nor the first frame). It leaves with a short fade
 * (dialogExit.ts). Mounted only while open.
 */
function VideoDialog({ asset, posterSrc, caption, start, onClose }: VideoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const underRef = useRef<HTMLCanvasElement>(null)
  const stopRef = useRef<() => void>(undefined)
  const [ready, setReady] = useState(false)
  const titleId = useId()
  const src = asset.variants[asset.variants.length - 1].src

  // Before the first paint: the inline frame, in place of the larger copy until it has one.
  useLayoutEffect(() => {
    if (underRef.current) drawUnderlay(underRef.current, start.from)
  }, [start.from])
  useEffect(() => () => stopRef.current?.(), [])

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

  // Shown once its frame at the inline time is on screen: after the seek (then it plays, if the inline copy was
  // playing), or after play() when there is nothing to seek. Paused at the start: its own poster, at once.
  const onLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = start.muted
    v.volume = start.volume
    if (start.time > 0.05 && Math.abs(v.currentTime - start.time) > 0.05) {
      stopRef.current = onFramePresented(v, () => {
        setReady(true)
        if (start.play) v.play().catch(() => {})
      })
      v.currentTime = start.time
    } else if (start.play) {
      stopRef.current = onFramePresented(v, () => setReady(true))
      v.play().catch(() => setReady(true))
    } else setReady(true)
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
      onCancel={closeOnCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeWithFade(dialogRef.current)
      }}
    >
      <div className="image-dialog__panel">
        <div className="image-dialog__bar">
          <p id={titleId} className="image-dialog__count t-small">
            {asset.title}
          </p>
          <div className="image-dialog__controls">
            <button ref={closeRef} type="button" className="button button--small" onClick={() => closeWithFade(dialogRef.current)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="m3.5 3.5 9 9m0-9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Close
            </button>
          </div>
        </div>
        <div className="cs-video-dialog__stage">
          <canvas ref={underRef} className="cs-video-dialog__under" width={asset.width} height={asset.height} aria-hidden="true" />
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
          />
        </div>
        <p className="image-dialog__caption t-small">{caption}</p>
      </div>
    </dialog>
  )
}

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import { fallbackSrc, getImage, getVideo, type ImageId, type VideoAsset, type VideoId } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { DemoControls } from './DemoControls'
import { enterFullscreen, NATIVE_FULLSCREEN, returnFocus } from './fullscreen'
import { closeOnCancel, closeWithFade } from './dialogExit'
import { ResponsiveImage } from './ResponsiveImage'
import { drawUnderlay, onFramePresented, type Underlay } from './videoFrame'

/*
 * DemoVideo: a product recording that plays by itself (CaseScroll `video`
 * media).
 *
 * - Muted, inline, looping. It starts when at least 35% of it is visible
 *   (IntersectionObserver) and keeps playing while the text scrolls;
 *   scrolling never seeks, scrubs or restarts it.
 * - A clean picture (brief-v13): no native controls, timer or timeline over
 *   the recording. Its compact controls sit BELOW it, inside the player's
 *   frame (DemoControls: play or pause, a seek slider, sound, expand), and
 *   read the <video> element itself, so there is one playback state. A click
 *   on the picture plays or pauses it as well.
 * - Preview and full sources: `video` plays inline; `full` (optional) is the
 *   complete recording the larger view plays. With `full`, the inline copy is
 *   an edited, accelerated preview: its `label` (e.g. "Edited preview · 1.5×
 *   speed") is the player's caption, directly under the frame, and the larger
 *   view says it shows the complete recording at original speed. `map` pairs
 *   matching moments [inlineSeconds, fullSeconds], so the larger view
 *   continues at the same point and closing it returns the preview to the
 *   matching moment; without `map` the complete recording starts from the
 *   beginning (the view says so) and the preview resumes where it was.
 * - Autoplay refused (NotAllowedError, e.g. a browser policy): the poster
 *   stays with one obvious "Play demo" button; once it plays, focus moves to
 *   the Pause button below.
 * - Paused when it is completely outside the viewport (or the tab is
 *   hidden), resumed when it returns, unless the visitor paused it: an
 *   explicit pause is never overridden.
 * - Reduced motion: no autoplay; the poster with "Play demo".
 * - A manifest `startAt` is applied once, right before the recording first
 *   plays (by itself, through "Play demo" or Play, or in the larger view);
 *   the loop then restarts from 0. Nothing seeks until playback is requested
 *   (or the visitor seeks), so the poster stays for visitors who never start
 *   it.
 * - While "Play demo" is offered, the poster image lies over the player, so a
 *   seek or a closed larger view never replaces it with an arbitrary frame;
 *   likewise while the first seek to the start time is under way.
 * - Expand (the last control in the bar, keyboard operable): the inline copy
 *   is paused first, so two copies never play. Closing restores the inline
 *   copy, playing if the larger one was playing, paused (as the visitor's own
 *   pause) if it was paused. Focus returns to Expand. On a phone or a touch
 *   screen, Expand puts the recording itself in the browser's full screen
 *   instead (it can turn to landscape there, with the browser's own
 *   controls); with a separate full recording, the larger view opens and asks
 *   for full screen on that recording. The larger view has the same control
 *   bar, whose last control is Full screen.
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

/** Matching moments [inlineSeconds, fullSeconds], ascending in both. */
export type TimeMap = ReadonlyArray<readonly [number, number]>

/** Piecewise-linear lookup in a TimeMap (`from` 0: inline to full; 1: full to inline); one to one beyond either end. */
function mapTime(map: TimeMap, t: number, from: 0 | 1 = 0): number {
  const to = from === 0 ? 1 : 0
  if (!map.length || !Number.isFinite(t)) return t
  if (t <= map[0][from]) return map[0][to] + Math.min(0, t - map[0][from])
  for (let i = 1; i < map.length; i++) {
    const a = map[i - 1]
    const b = map[i]
    if (t <= b[from]) {
      const span = b[from] - a[from]
      return span > 0 ? a[to] + ((t - a[from]) / span) * (b[to] - a[to]) : b[to]
    }
  }
  const last = map[map.length - 1]
  return last[to] + (t - last[from])
}

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
  /** The recording played inline (an edited preview when `full` is given). */
  video: VideoId
  /** The complete recording the larger view plays (default: `video`). */
  full?: VideoId
  /** A discreet label inside the player (e.g. 'Edited preview · 1.5× speed'). */
  label?: string
  /** Matching moments [inlineSeconds, fullSeconds] between `video` and `full`. */
  map?: TimeMap
  /** A representative frame; defaults to the inline recording's manifest poster. */
  poster?: ImageId
  /** `sizes` for the poster image. */
  sizes: string
  /** 'sticky': bounded by the visible stage beside the story; 'stacked': the stacked layout. */
  variant: 'sticky' | 'stacked' | 'inline'
}

interface Expanded {
  time: number
  play: boolean
  muted: boolean
  volume: number
  /** What the inline player shows as the larger view opens (its frame, or the poster): drawn there until its own copy has a frame. */
  from: Underlay | null
  /** Ask for full screen on the larger copy as soon as it can (touch Expand with a separate full recording). */
  fullscreen: boolean
}

export function DemoVideo({ video: id, full: fullId, label, map, poster, sizes, variant }: DemoVideoProps) {
  const asset = getVideo(id)
  const fullAsset = getVideo(fullId ?? id)
  /** The larger view plays a different, complete recording (the inline copy is its edited preview). */
  const separate = fullAsset !== asset
  const posterId = poster ?? asset.poster
  const reduced = useReducedMotion()
  const labelId = useId()
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
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
  const ctl = useRef({ inView: false, userPaused: false, selfPause: false, autoStart: false, userStarted: false, expanded: false, expandedFrom: 0, reduced, posterReady, startDone: !(startAt > 0) })

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

  // The recording itself in full screen (touch Expand): leaving it returns focus to Expand when nothing holds it.
  useEffect(() => {
    const onChange = () => {
      const own = Boolean(videoRef.current) && document.fullscreenElement === videoRef.current
      setFullscreen((was) => {
        if (was && !own) requestAnimationFrame(() => returnFocus(expandRef.current))
        return own
      })
    }
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
      // The visitor's own pause (the bar's Pause, a click on the picture, or another film starting): respected.
      c.userPaused = true
      c.userStarted = false
    }
    setStatus('paused')
  }

  /**
   * Play at the visitor's request ("Play demo", Play in the bar, a click on the picture, Expand on touch): a direct
   * gesture, so play() is allowed. From "Play demo", focus then moves to the bar's Pause button, since the button
   * that held it has gone.
   */
  const playNow = (focusBar = false) => {
    const v = videoRef.current
    if (!v) return
    ctl.current.userPaused = false
    seekToStart()
    v.play().then(
      () => {
        if (focusBar) playRef.current?.focus({ preventScroll: true })
      },
      (err: unknown) => {
        if (err instanceof DOMException && err.name === 'NotAllowedError') setStatus('blocked')
      },
    )
  }

  /** Play or pause (the bar's first control and a click on the picture); a pause here is the visitor's own. */
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) playNow()
    else v.pause()
  }

  const openExpanded = () => {
    const v = videoRef.current
    if (!v) return
    const playing = !v.paused && !v.ended
    // Blocked or never started: the visitor asked to watch, so the larger view plays (a user gesture). A paused
    // recording stays paused.
    const play = playing || status === 'blocked' || (status === 'idle' && !reduced)
    const c = ctl.current
    const touch = window.matchMedia(NATIVE_FULLSCREEN).matches
    if (touch && !separate) {
      // The same element in full screen: it simply continues (started first, within the gesture, if the visitor
      // asked to watch). Without full screen support, the dialog below takes over.
      if (play && !playing) playNow()
      if (enterFullscreen(v)) return
    }
    // Never played yet and about to play: the larger view begins where the first play would.
    const inlineTime = !c.startDone && play ? startAt : v.currentTime
    if (play) c.startDone = true
    // The complete recording: at the matching moment, or from its beginning when the preview has no map.
    const time = separate ? (map?.length ? Math.max(0, mapTime(map, inlineTime)) : 0) : inlineTime
    c.expanded = true
    c.expandedFrom = inlineTime
    autoPause()
    // The larger view opens on what is on screen here (this frame, or the poster), when it shows the same moment.
    const same = !separate || Boolean(map?.length)
    const from = !same ? null : hasFrame && !showPlay && !covering ? v : (stageRef.current?.querySelector<HTMLImageElement>('.cs-demo__poster img') ?? null)
    const next = { time, play, muted: v.muted, volume: v.volume, from, fullscreen: touch && separate }
    if (next.fullscreen) {
      // Mounted within the gesture, so the larger copy may ask for full screen at once (VideoDialog).
      flushSync(() => setExpanded(next))
      return
    }
    setExpanded(next)
  }

  const closeExpanded = (result: { time: number; playing: boolean; muted: boolean; volume: number }) => {
    const v = videoRef.current
    const c = ctl.current
    setExpanded(null)
    c.expanded = false
    if (v) {
      // Back in the preview: the matching moment, or where it was when the complete recording had no map.
      const time = separate ? (map?.length ? mapTime(map, result.time, 1) : c.expandedFrom) : result.time
      if (Number.isFinite(time)) v.currentTime = Math.max(0, Math.min(time, Number.isFinite(v.duration) ? v.duration - 0.05 : time))
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
    const back = () => expandRef.current?.focus({ preventScroll: true })
    back()
    // Leaving full screen can drop focus to the page after this runs: return it once more if nothing holds it.
    requestAnimationFrame(() => {
      if (!document.activeElement || document.activeElement === document.body) back()
    })
  }

  const ratio = asset.width / asset.height
  const showPlay = status === 'blocked' || (status === 'idle' && reduced)
  const fullLabel = separate ? (map?.length ? 'Complete recording · original speed' : 'Complete recording from the start · original speed') : undefined

  const onLoadedMetadata = () => {
    // Playback was requested before the metadata arrived: begin at the start time, before the first frame shows.
    if (videoRef.current && !videoRef.current.paused) seekToStart()
  }

  return (
    <figure className="cs-figure cs-demo" data-variant={variant === 'sticky' ? 'sticky' : 'inline'} style={{ '--stage-r': ratio } as CSSProperties}>
      <div className="cs-player">
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
            // Nothing over the picture inline (DemoControls below it). The browser's own controls appear only while
            // the recording itself is in full screen (touch Expand), so it can be left there.
            controls={fullscreen}
            controlsList={fullscreen ? undefined : 'nofullscreen'}
            preload={!posterReady ? 'none' : reduced ? 'metadata' : 'auto'}
            data-frame={hasFrame || undefined}
            aria-label={asset.title}
            aria-describedby={label ? labelId : undefined}
            onLoadedMetadata={onLoadedMetadata}
            onSeeked={() => setCovering(false)}
            onPlay={onPlay}
            onPause={onPause}
            // A pointer shortcut (the bar's Play and Pause button is the keyboard control); in full screen the
            // browser's own controls handle clicks.
            onClick={fullscreen ? undefined : togglePlay}
          />
          {showPlay && (
            <span className="cs-demo__playwrap">
              <button type="button" className="button button--secondary cs-demo__play" onClick={() => playNow(true)}>
                <PlayIcon />
                Play demo
              </button>
            </span>
          )}
        </div>
        {/* The compact controls, below the recording inside its frame. */}
        <DemoControls
          videoRef={videoRef}
          title={asset.title}
          duration={asset.duration}
          hasAudio={asset.hasAudio}
          onTogglePlay={togglePlay}
          playRef={playRef}
          onExpand={openExpanded}
          expandLabel={separate ? 'Expand the complete recording' : 'Expand video'}
          expandRef={expandRef}
        />
      </div>
      {/* The player's caption (e.g. Edited preview · 1.5× speed), directly under its frame like every media label. */}
      {label && (
        <figcaption id={labelId} className="cs-media-label cs-demo__caption">
          {label}
        </figcaption>
      )}
      {expanded && (
        <VideoDialog
          asset={fullAsset}
          posterSrc={fallbackSrc(getImage(separate ? fullAsset.poster : posterId), 1600)}
          label={fullLabel}
          start={expanded}
          onClose={closeExpanded}
        />
      )}
    </figure>
  )
}

/* ----------------------------------------------------------------------- */
/* The larger view                                                          */
/* ----------------------------------------------------------------------- */

interface VideoDialogProps {
  asset: VideoAsset
  posterSrc: string
  /** A label beside the title (e.g. 'Complete recording · original speed'). */
  label?: string
  start: Expanded
  onClose: (result: { time: number; playing: boolean; muted: boolean; volume: number }) => void
}

/**
 * A native modal <dialog> (focus contained, Escape and a click on the
 * backdrop close it, page scrolling locked) with the largest variant. It
 * opens on the inline player's frame (or poster), drawn underneath, and its
 * own copy fades in over it once that copy has a frame at the start time
 * (never a black stage, nor the first frame). A complete recording opened
 * from its preview is labelled as such beside the title. Below the recording,
 * the same control bar as inline (DemoControls), ending with Full screen. It
 * leaves with a short fade (dialogExit.ts). Mounted only while open.
 */
function VideoDialog({ asset, posterSrc, label, start, onClose }: VideoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const underRef = useRef<HTMLCanvasElement>(null)
  const stopRef = useRef<() => void>(undefined)
  const fullscreenRef = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)
  /** This copy is in the browser's full screen (from the bar's Full screen control). */
  const [fullscreen, setFullscreen] = useState(false)
  const titleId = useId()
  const src = asset.variants[asset.variants.length - 1].src

  // Full screen from the bar: the browser's own controls while it lasts; leaving it returns focus to the control.
  useEffect(() => {
    const onChange = () => {
      const on = Boolean(videoRef.current) && document.fullscreenElement === videoRef.current
      setFullscreen((was) => {
        if (was && !on) requestAnimationFrame(() => fullscreenRef.current?.focus({ preventScroll: true }))
        return on
      })
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toFullscreen = () => {
    const v = videoRef.current
    if (v) enterFullscreen(v)
  }

  /** A click on the picture plays or pauses it (a pointer shortcut for the bar's first control). */
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) v.play().catch(() => {})
    else v.pause()
  }

  // Before the first paint: the inline frame, in place of the larger copy until it has one.
  useLayoutEffect(() => {
    if (underRef.current) drawUnderlay(underRef.current, start.from)
  }, [start.from])
  useEffect(() => () => stopRef.current?.(), [])

  // Open before the first paint. Touch Expand with a separate complete recording also asks for that recording's own
  // full screen here, within the visitor's gesture (the Expand handler mounts this view synchronously); leaving full
  // screen then closes the view as well. Otherwise focus goes to Close.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    const v = videoRef.current
    if (!dialog || !v) return
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-dialog-open')
    let detach = () => {}
    if (start.fullscreen) {
      if (start.play) v.play().catch(() => {})
      if (enterFullscreen(v)) {
        let entered = false
        const onChange = () => {
          if (document.fullscreenElement === v) entered = true
          else if (entered) closeWithFade(dialogRef.current)
        }
        const onEnd = () => closeWithFade(dialogRef.current)
        document.addEventListener('fullscreenchange', onChange)
        v.addEventListener('webkitendfullscreen', onEnd)
        detach = () => {
          document.removeEventListener('fullscreenchange', onChange)
          v.removeEventListener('webkitendfullscreen', onEnd)
        }
      } else closeRef.current?.focus()
    } else closeRef.current?.focus()
    // No dialog.close() here: that would fire 'close' (and restore the inline copy) when React re-runs this
    // effect in development; unmounting removes the dialog from the top layer anyway.
    return () => {
      detach()
      document.documentElement.classList.remove('is-dialog-open')
    }
  }, [start])

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
            {label && (
              <>
                <span className="cs-label__sep">{' · '}</span>
                <span className="cs-media-label">{label}</span>
              </>
            )}
          </p>
          <div className="image-dialog__controls">
            <button ref={closeRef} type="button" className="button button--secondary button--small" onClick={() => closeWithFade(dialogRef.current)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="m3.5 3.5 9 9m0-9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Close
            </button>
          </div>
        </div>
        {/* The recording and its control bar, one frame as wide as the view allows at the recording's ratio. */}
        <div className="cs-video-dialog__stage cs-video-dialog__stage--player" style={{ '--r': asset.width / asset.height } as CSSProperties}>
          <div className="cs-player cs-video-dialog__player">
            <div className="cs-video-dialog__screen">
              <canvas ref={underRef} className="cs-video-dialog__under" width={asset.width} height={asset.height} aria-hidden="true" />
              <video
                ref={videoRef}
                className="cs-video-dialog__video"
                data-ready={ready || undefined}
                src={src}
                poster={start.time > 0.05 ? undefined : posterSrc}
                width={asset.width}
                height={asset.height}
                // The browser's own controls only in full screen; here the bar below is the player's.
                controls={start.fullscreen || fullscreen}
                loop
                playsInline
                muted={start.muted}
                preload="auto"
                aria-label={asset.title}
                onLoadedMetadata={onLoadedMetadata}
                onClick={start.fullscreen || fullscreen ? undefined : togglePlay}
              />
            </div>
            <DemoControls
              videoRef={videoRef}
              title={asset.title}
              duration={asset.duration}
              hasAudio={asset.hasAudio}
              onExpand={toFullscreen}
              expandLabel="Show the recording full screen"
              expandRef={fullscreenRef}
            />
          </div>
        </div>
      </div>
    </dialog>
  )
}

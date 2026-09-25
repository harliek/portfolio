import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { VideoAsset } from '../../../content/media'
import { DemoControls } from '../../media/DemoControls'
import { closeOnCancel, closeWithFade } from '../../media/dialogExit'
import { enterFullscreen } from '../../media/fullscreen'
import { drawUnderlay, onFramePresented, type Underlay } from '../../media/videoFrame'

/** Where the expanded view starts, and how it ends (the inline player takes over from there). */
export interface FilmState {
  time: number
  play: boolean
  muted: boolean
  volume: number
  /** Opening only: what the inline player shows (its frame, or the poster), drawn here until this copy has a frame. */
  from?: Underlay | null
}

interface FilmDialogProps {
  asset: VideoAsset
  title: string
  posterSrc: string
  start: FilmState
  onClose: (result: FilmState) => void
}

/**
 * The larger view of a film: a native modal <dialog> (focus contained,
 * Escape and a click on the backdrop close it, page scrolling locked) with
 * the largest variant. It opens on the inline player's frame (or poster),
 * drawn underneath, and its own copy fades in over it once that copy has a
 * frame at the inline time (never a black stage, nor the first frame). No
 * caption (brief-v8 section 8): the film's name in the bar only. Below the
 * film, the same compact bar as inline (DemoControls: play or pause, seek,
 * sound), ending with Full screen; the browser's own controls appear only in
 * full screen, and leaving it returns focus to that control. It leaves with a
 * short fade (dialogExit.ts). Mounted only while open. Every close path
 * (Close, Escape, backdrop) reports the time, playing and sound state back to
 * the inline player.
 */
export function FilmDialog({ asset, title, posterSrc, start, onClose }: FilmDialogProps) {
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

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-dialog-open')
    closeRef.current?.focus()
    // No dialog.close() here: that would report a close when React re-runs this effect in development;
    // unmounting removes the dialog from the top layer anyway.
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

  const handleClose = () => {
    const v = videoRef.current
    // Closed before the larger copy reached its start time: the inline player continues as it was.
    if (!v || !ready) onClose({ time: start.time, play: start.play, muted: start.muted, volume: start.volume })
    else onClose({ time: v.currentTime, play: !v.paused && !v.ended, muted: v.muted, volume: v.volume })
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
            {title}
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
        {/* The film and its control bar, one frame as wide as the view allows at the film's ratio. */}
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
                controls={fullscreen}
                playsInline
                preload="auto"
                aria-label={`${title} film`}
                onLoadedMetadata={onLoadedMetadata}
                onClick={fullscreen ? undefined : togglePlay}
              />
            </div>
            <DemoControls
              videoRef={videoRef}
              title={`${title} film`}
              noun="film"
              duration={asset.duration}
              hasAudio={asset.hasAudio}
              onExpand={toFullscreen}
              expandLabel="Show the film full screen"
              expandRef={fullscreenRef}
            />
          </div>
        </div>
      </div>
    </dialog>
  )
}

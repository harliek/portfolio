// The viewer's frame and bar styles (.cs-video-dialog, .cs-player) live with the case styles.
import '../../../styles/case.css'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import type { VideoAsset } from '../../../content/media'
import { DemoControls } from '../../media/DemoControls'
import { closeOnCancel, closeWithFade } from '../../media/dialogExit'
import { CloseIcon } from '../../media/ExpandIcon'
import { enterFullscreen } from '../../media/fullscreen'
import { onFramePresented } from '../../media/videoFrame'

interface FilmDialogProps {
  asset: VideoAsset
  title: string
  posterSrc: string
  onClose: () => void
}

/**
 * The file for this window: the first variant meant for a viewport this narrow (VideoVariant.maxViewport), else the
 * largest (Harlie's brief, 2026-09-28: a phone loaded the 20MB Aristocracy file although a 9.8MB one is listed for it).
 */
const fileFor = (asset: VideoAsset) =>
  (asset.variants.find((v) => v.maxViewport !== undefined && window.innerWidth <= v.maxViewport) ?? asset.variants[asset.variants.length - 1]).src

/**
 * The larger view of a film: a native modal <dialog> (focus contained,
 * Escape and a click on the backdrop close it, page scrolling locked) with
 * the variant for the window's width (fileFor). It opens at the start of the film, playing with
 * sound, and the film fades in over the black screen once its first frame is
 * on screen. No caption (brief-v8 section 8): the film's name in the bar
 * only. Below the film, a compact bar (DemoControls: play or pause, seek,
 * sound), ending with Full screen; the browser's own controls appear only in
 * full screen, and leaving it returns focus to that control. It leaves with a
 * short fade (dialogExit.ts). Mounted only while open. Every close path
 * (Close, Escape, backdrop) calls `onClose`.
 */
export function FilmDialog({ asset, title, posterSrc, onClose }: FilmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const stopRef = useRef<() => void>(undefined)
  const fullscreenRef = useRef<HTMLButtonElement>(null)
  const [ready, setReady] = useState(false)
  /** This copy is in the browser's full screen (from the bar's Full screen control). */
  const [fullscreen, setFullscreen] = useState(false)
  const titleId = useId()
  // Chosen once, as the viewer opens (turning a phone while it plays keeps the file).
  const [src] = useState(() => fileFor(asset))

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

  // Shown once its first frame is on screen after play(); if the browser will not play it, its own poster, at once.
  const onLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    stopRef.current = onFramePresented(v, () => setReady(true))
    v.play().catch(() => setReady(true))
  }

  return (
    <dialog
      ref={dialogRef}
      className="image-dialog cs-video-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
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
              <CloseIcon />
              Close
            </button>
          </div>
        </div>
        {/* The film and its control bar, one frame as wide as the view allows at the film's ratio. */}
        <div className="cs-video-dialog__stage cs-video-dialog__stage--player" style={{ '--r': asset.width / asset.height } as CSSProperties}>
          <div className="cs-player cs-video-dialog__player">
            <div className="cs-video-dialog__screen">
              <video
                ref={videoRef}
                className="cs-video-dialog__video"
                data-ready={ready || undefined}
                src={src}
                poster={posterSrc}
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

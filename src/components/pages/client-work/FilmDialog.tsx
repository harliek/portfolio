import { useEffect, useId, useRef, useState } from 'react'
import type { VideoAsset } from '../../../content/media'

/** Where the expanded view starts, and how it ends (the inline player takes over from there). */
export interface FilmState {
  time: number
  play: boolean
  muted: boolean
  volume: number
}

interface FilmDialogProps {
  asset: VideoAsset
  title: string
  caption: string
  posterSrc: string
  start: FilmState
  onClose: (result: FilmState) => void
}

/**
 * The larger view of a film: a native modal <dialog> (focus contained,
 * Escape and a click on the backdrop close it, page scrolling locked) with
 * the largest variant, shown only once it has reached the inline player's
 * time, so there is no flash of the first frame. Mounted only while open.
 * Every close path (Close, Escape, backdrop) reports the time, playing and
 * sound state back to the inline player.
 */
export function FilmDialog({ asset, title, caption, posterSrc, start, onClose }: FilmDialogProps) {
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
    // No dialog.close() here: that would report a close when React re-runs this effect in development;
    // unmounting removes the dialog from the top layer anyway.
    return () => document.documentElement.classList.remove('is-dialog-open')
  }, [])

  const show = () => {
    setReady(true)
    const v = videoRef.current
    if (v && start.play) v.play().catch(() => {})
  }

  const onLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = start.muted
    v.volume = start.volume
    if (start.time > 0.05 && Math.abs(v.currentTime - start.time) > 0.05) v.currentTime = start.time
    else show()
  }

  const handleClose = () => {
    const v = videoRef.current
    // Closed before the larger copy reached its start time: the inline player continues as it was.
    if (!v || !ready) onClose(start)
    else onClose({ time: v.currentTime, play: !v.paused && !v.ended, muted: v.muted, volume: v.volume })
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
            {title}
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
            playsInline
            preload="auto"
            aria-label={`${title} film`}
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

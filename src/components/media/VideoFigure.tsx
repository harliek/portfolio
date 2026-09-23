import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getImage, getVideo, fallbackSrc, type VideoAsset, type VideoId } from '../../content/media'
import { ResponsiveImage } from './ResponsiveImage'
import { CaptionText } from './Figure'

const formatDuration = (seconds: number) => {
  const s = Math.round(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const spokenDuration = (seconds: number) => {
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  const parts = []
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`)
  if (r) parts.push(`${r} second${r === 1 ? '' : 's'}`)
  return parts.join(' ')
}

/** Picks the smallest variant suited to the current viewport. */
function pickVariant(video: VideoAsset) {
  const vw = window.innerWidth
  return video.variants.find((v) => v.maxViewport !== undefined && vw <= v.maxViewport) ?? video.variants[video.variants.length - 1]
}

interface VideoFigureProps {
  video: VideoId
  /** `sizes` for the poster image. */
  sizes: string
  /** Caption override; defaults to the manifest caption. */
  caption?: ReactNode
  /** A real transcript. Omit entirely when none exists (no empty disclosure). */
  transcript?: ReactNode
  className?: string
}

/**
 * User-initiated video. Nothing but the poster loads until the visitor asks
 * to play; then the right-sized MP4 is attached and native controls take over.
 * Other playing media pause automatically (see useMediaPlayback).
 */
export function VideoFigure({ video: id, sizes, caption, transcript, className }: VideoFigureProps) {
  const video = getVideo(id)
  const poster = getImage(video.poster)
  const [state, setState] = useState<'idle' | 'active' | 'error'>('idle')
  const [attempt, setAttempt] = useState(0)
  const [src, setSrc] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Start playback once the element with its source is mounted.
  useEffect(() => {
    if (state !== 'active') return
    const el = videoRef.current
    if (!el) return
    el.focus({ preventScroll: true })
    el.play().catch(() => {
      /* Autoplay after a click can still be refused; native controls remain. */
    })
  }, [state, attempt])

  // Leaving the page (unmount) always stops playback.
  useEffect(() => {
    const el = videoRef.current
    return () => {
      el?.pause()
    }
  }, [state])

  const start = () => {
    setSrc(pickVariant(video).src)
    setAttempt((a) => a + 1)
    setState('active')
  }

  const ratio = `${video.width} / ${video.height}`

  return (
    <figure className={['figure video-figure', className].filter(Boolean).join(' ')}>
      <div className="media-frame video-frame" style={{ aspectRatio: ratio }}>
        {state === 'idle' && (
          <button
            type="button"
            className="video-facade"
            aria-label={`Play video: ${video.title}, ${spokenDuration(video.duration)}`}
            onClick={start}
          >
            <ResponsiveImage image={video.poster} sizes={sizes} decorative fit="cover" />
            <span className="video-facade__chip" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
              </svg>
              <span className="video-facade__title">{video.title}</span>
              <span className="video-facade__time tabular">{formatDuration(video.duration)}</span>
            </span>
          </button>
        )}

        {state === 'active' && src && (
          <video
            key={attempt}
            ref={videoRef}
            className="video-el"
            controls
            playsInline
            preload="auto"
            poster={fallbackSrc(poster, 1600)}
            width={video.width}
            height={video.height}
            aria-label={video.title}
            onError={() => setState('error')}
          >
            <source src={src} type="video/mp4" onError={() => setState('error')} />
          </video>
        )}

        {state === 'error' && (
          <div className="video-error">
            <ResponsiveImage image={video.poster} sizes={sizes} decorative fit="cover" className="video-error__poster" />
            <div className="video-error__panel" role="alert">
              <p>This video could not be loaded.</p>
              <div className="video-error__actions">
                <button type="button" className="button" onClick={start}>
                  Try again
                </button>
                {src && (
                  <a className="button button--quiet" href={src}>
                    Open video
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <figcaption className="figure__caption">
        <CaptionText provenance={video.provenance}>{caption ?? video.caption}</CaptionText>
      </figcaption>
      {transcript && (
        <details className="transcript">
          <summary>Transcript</summary>
          <div className="transcript__body">{transcript}</div>
        </details>
      )}
    </figure>
  )
}

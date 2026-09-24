import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getImage, getVideo, fallbackSrc, type ImageId, type VideoAsset, type VideoId } from '../../content/media'
import { shortDuration, spokenDuration } from './duration'
import { ResponsiveImage } from './ResponsiveImage'
import { CaptionText } from './Figure'

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
  /** Visible text on the play control instead of the video's title (e.g. "Watch demo"); always shown, also on phones. */
  label?: string
  /** Another real frame of the recording as the poster (e.g. when the default poster repeats a nearby image). */
  poster?: ImageId
  className?: string
}

/**
 * User-initiated video. Nothing but the poster loads until the visitor asks
 * to play; then the right-sized MP4 is attached and native controls take over.
 * Other playing media pause automatically (see useMediaPlayback).
 */
export function VideoFigure({ video: id, sizes, caption, transcript, label, poster: posterId, className }: VideoFigureProps) {
  const video = getVideo(id)
  const posterImage = posterId ?? video.poster
  const poster = getImage(posterImage)
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
            aria-label={`${label ? `${label}, ${video.title}` : `Play ${video.title}`}, ${spokenDuration(video.duration)}`}
            onClick={start}
          >
            <ResponsiveImage image={posterImage} sizes={sizes} decorative fit="cover" />
            <span className="video-facade__chip" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14">
                <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
              </svg>
              <span className={label ? 'video-facade__label' : 'video-facade__title'}>{label ?? video.title}</span>
              <span className="video-facade__time tabular">{shortDuration(video.duration)}</span>
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
            <ResponsiveImage image={posterImage} sizes={sizes} decorative fit="cover" className="video-error__poster" />
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

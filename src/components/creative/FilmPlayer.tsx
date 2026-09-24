import '../../styles/creative.css'
import { useEffect, useRef } from 'react'
import type { Film } from '../../content/creative'
import { ResponsiveImage } from '../media/ResponsiveImage'

interface FilmPlayerProps {
  film: Film
  sizes: string
  playing: boolean
  onPlay: () => void
  priority?: boolean
  /** Visible text on the play control (default “Play”). */
  label?: string
}

/** Privacy-enhanced embed; nothing from YouTube is requested before the visitor presses play. */
export const embedUrl = (youtubeId: string) => `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`
export const watchUrl = (youtubeId: string) => `https://www.youtube.com/watch?v=${youtubeId}`

/**
 * A film's still with a real play button. Pressing it replaces the still
 * with the youtube-nocookie player (autoplay after the click) and moves
 * focus into it. Only one film plays at a time (the page owns `playing`).
 */
export function FilmPlayer({ film, sizes, playing, onPlay, priority, label = 'Play' }: FilmPlayerProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  return (
    <div className="film-player" data-playing={playing || undefined}>
      {playing ? (
        <iframe
          ref={frameRef}
          className="film-player__frame"
          src={embedUrl(film.youtubeId)}
          title={`${film.title} (YouTube video player)`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" className="film-player__facade" onClick={onPlay} aria-label={`${label}, ${film.title}`}>
          <ResponsiveImage image={film.still} sizes={sizes} priority={priority} decorative fit="cover" />
          <span className="film-player__chip" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
            </svg>
            {label}
          </span>
        </button>
      )}
    </div>
  )
}

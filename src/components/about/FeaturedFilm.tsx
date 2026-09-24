import { useEffect, useRef, useState } from 'react'
import { ABOUT } from '../../content/pages/about'
import { ResponsiveImage } from '../media/ResponsiveImage'

const FILM = ABOUT.film
/** The wide (60%) column of About's grid at desktop, the full width below 960px. */
const SIZES = '(min-width: 1200px) 690px, (min-width: 960px) 56vw, calc(100vw - 40px)'

/** Privacy-enhanced embed, requested only after the visitor presses Play. */
const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

/**
 * An Artistic End: the authentic poster, whole and untinted (no overlay,
 * filter or coloured glow, so its pinks read as made), inside one button
 * with a small "Play film" badge. Pressing it swaps the poster for the
 * youtube-nocookie player in the same frame (playback starts because the
 * visitor asked for it) and moves focus into the player. Nothing is
 * requested from YouTube before that press, and nothing plays on its own.
 * Once the player is shown, a quiet "Watch on YouTube" link follows the
 * description (a fallback if the embed is blocked).
 */
export function FeaturedFilm() {
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (playing) playerRef.current?.focus()
  }, [playing])

  return (
    <div className="about-film">
      <div className="about-film__frame" data-playing={playing || undefined}>
        {playing ? (
          <iframe
            ref={playerRef}
            className="about-film__player"
            src={embedUrl(FILM.youtubeId)}
            title={`${FILM.title}, short film, YouTube player`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            className="about-film__play"
            aria-label={`${FILM.play}, ${FILM.title}`}
            aria-describedby="about-film-note"
            onClick={() => setPlaying(true)}
          >
            <ResponsiveImage image={FILM.poster} sizes={SIZES} decorative fit="cover" className="about-film__poster" />
            <span className="about-film__badge" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
              </svg>
              {FILM.play}
            </span>
          </button>
        )}
      </div>
      <div className="about-film__caption">
        <h3 className="about-film__title">{FILM.title}</h3>
        <p id="about-film-note" className="about-film__note">
          {FILM.note}
        </p>
        <p className="about-film__meta">
          {FILM.meta}
          {playing && (
            <>
              <span aria-hidden="true"> · </span>
              <a className="about-film__youtube" href={watchUrl(FILM.youtubeId)} target="_blank" rel="noopener noreferrer">
                {FILM.youtube}
                <span aria-hidden="true"> ↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

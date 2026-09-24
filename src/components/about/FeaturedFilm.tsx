import { useEffect, useRef, useState } from 'react'
import { FEATURED_FILM_ID, filmById, publishedLabel } from '../../content/creative'
import { ABOUT } from '../../content/pages/about'
import { ResponsiveImage } from '../media/ResponsiveImage'

const FILM = filmById(FEATURED_FILM_ID)
const SIZES = '(min-width: 960px) 640px, calc(100vw - 40px)'

/** Privacy-enhanced embed; nothing from YouTube is requested before the visitor presses the button. */
const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

interface FeaturedFilmProps {
  /** Heading level of the film title (one below the About heading). */
  level: 2 | 3
}

/**
 * "An Artistic End": the authentic poster, whole and untinted, with a quiet
 * dark surround so its pinks read as they were made. The "Watch An Artistic
 * End" button replaces the poster with the youtube-nocookie player in the
 * same frame (autoplay after the click) and moves focus into it; no request
 * reaches YouTube before that click. The film's role credits from the old
 * portfolio are not verified, so they are not shown (docs/content-provenance.md).
 */
export function FeaturedFilm({ level }: FeaturedFilmProps) {
  const Title = `h${level}` as const
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (playing) playerRef.current?.focus()
  }, [playing])

  return (
    <section className="about-block about-feature about-film" aria-labelledby="about-film-title">
      <div className="about-feature__head">
        <p className="about-label">{ABOUT.film.label}</p>
        <Title id="about-film-title" className="about-subheading">
          {FILM.title}
        </Title>
      </div>
      <div className="about-film__frame" data-playing={playing || undefined}>
        {playing ? (
          <iframe
            ref={playerRef}
            className="about-film__player"
            src={embedUrl(FILM.youtubeId)}
            title={`${FILM.title}, short film (YouTube player)`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <ResponsiveImage image={FILM.still} sizes={SIZES} className="about-film__poster" />
        )}
      </div>
      <div className="about-feature__body">
        <p className="about-feature__text">{FILM.note}</p>
        <p className="about-feature__meta tabular">{publishedLabel(FILM)}</p>
        <p className="about-feature__actions">
          {playing ? (
            <a className="text-link about-film__youtube" href={watchUrl(FILM.youtubeId)} target="_blank" rel="noopener noreferrer">
              {ABOUT.film.youtube}
              <span aria-hidden="true"> ↗</span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : (
            <button type="button" className="button about-film__watch" onClick={() => setPlaying(true)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
              </svg>
              {ABOUT.film.cta}
            </button>
          )}
        </p>
      </div>
    </section>
  )
}

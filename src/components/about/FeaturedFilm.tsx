import { useEffect, useRef, useState } from 'react'
import { ABOUT } from '../../content/pages/about'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { CREATIVE_SIZES } from './creativeSizes'

const FILM = ABOUT.film

/** Privacy-enhanced embed, requested only after the visitor presses Play. */
const embedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`
const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

/** After the player has faded in over the poster, the poster is removed. */
const POSTER_OUT_MS = 260

/**
 * An Artistic End, the right-hand card of About's Creative work pair (the
 * same frame, badge and title as the Creative Portfolio card beside it).
 *
 * The authentic poster, whole and untinted (no overlay, filter or coloured
 * glow, so its pinks read as made; the frame has the poster's own aspect
 * ratio, so nothing is cropped), inside one button with a small "Play film"
 * badge. Pressing it mounts the youtube-nocookie player in the same frame,
 * invisible above the poster (playback starts because the visitor asked for
 * it), and moves focus into the player. The poster stays while YouTube
 * loads (its badge gone, the button inert); on the player's load event the
 * player fades in over it (about 200ms) and the poster is then removed, so
 * the frame is never empty. Nothing is requested from YouTube before that
 * press, and nothing plays on its own. Once the player is mounted, a quiet
 * "Watch on YouTube" link joins the title (a fallback if the embed is
 * blocked).
 */
export function FeaturedFilm() {
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [posterGone, setPosterGone] = useState(false)
  const playerRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (playing) playerRef.current?.focus()
  }, [playing])

  useEffect(() => {
    if (!loaded) return
    const t = window.setTimeout(() => setPosterGone(true), POSTER_OUT_MS)
    return () => window.clearTimeout(t)
  }, [loaded])

  return (
    <div className="about-work about-work--film">
      <div className="about-work__frame about-film__frame" data-playing={playing || undefined} data-loaded={loaded || undefined}>
        {!posterGone && (
          <button
            type="button"
            className="about-work__hit about-film__play"
            aria-label={`${FILM.action}, ${FILM.title}`}
            inert={playing}
            onClick={() => setPlaying(true)}
          >
            <ResponsiveImage image={FILM.poster} sizes={CREATIVE_SIZES} decorative fit="cover" className="about-work__image" />
            <span className="about-work__badge" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14" focusable="false">
                <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
              </svg>
              {FILM.action}
            </span>
          </button>
        )}
        {playing && (
          <iframe
            ref={playerRef}
            className="about-film__player"
            src={embedUrl(FILM.youtubeId)}
            title={`${FILM.title}, short film, YouTube player`}
            // Fullscreen comes from allowFullScreen alone (YouTube's own embed pattern, honoured by every browser);
            // listing it in `allow` as well makes Chrome warn that one overrides the other.
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
      <div className="about-work__foot">
        <h3 className="about-work__title">{FILM.title}</h3>
        {playing && (
          <a className="about-work__aside" href={watchUrl(FILM.youtubeId)} target="_blank" rel="noopener noreferrer">
            {FILM.youtube}
            <span aria-hidden="true"> ↗</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  )
}

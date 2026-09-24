import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import type { ClientFilm } from '../../../content/pages/client-work'
import { getImage, getVideo, fallbackSrc, type ImageId, type VideoAsset } from '../../../content/media'
import { TRANSCRIPTS } from '../../../content/transcripts'
import { shortDuration, spokenDuration } from '../../media/duration'
import { CaptionText } from '../../media/Figure'
import { useImageDialog } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { isTransitionPending } from '../../transition/projectTransition'

const POSTER_SIZES = '(min-width: 1320px) 720px, (min-width: 960px) 58vw, calc(100vw - 40px)'
const STILL_SIZES = {
  wide: '(min-width: 1320px) 210px, (min-width: 960px) 16vw, 46vw',
  portrait: '(min-width: 1320px) 140px, (min-width: 960px) 11vw, 30vw',
}

/** The widest variant suited to this viewport. */
const pickVariant = (video: VideoAsset) =>
  video.variants.find((v) => v.maxViewport !== undefined && window.innerWidth <= v.maxViewport) ?? video.variants[video.variants.length - 1]

/** Film named by the URL hash (e.g. /work/shift#aristocracy), else the first (Nickleby Capital Video 1). */
const initialIndex = (films: ClientFilm[]) => {
  const hash = typeof window === 'undefined' ? '' : decodeURIComponent(window.location.hash.slice(1))
  return Math.max(0, films.findIndex((f) => f.id === hash))
}

/**
 * A still that opens the shared enlargement dialog. Only the visible film's
 * stills carry data-zoom-id, so the dialog's gallery never pages into the
 * hidden tabs.
 */
function Still({ image, sizes, active }: { image: ImageId; sizes: string; active: boolean }) {
  const dialog = useImageDialog()
  const asset = getImage(image)
  return (
    <button
      type="button"
      className="zoom-trigger cw-still"
      data-zoom-id={active ? image : undefined}
      aria-label={`Enlarge image. ${asset.alt}`}
      onClick={(e) => dialog.open(image, e.currentTarget)}
    >
      <ResponsiveImage image={image} sizes={sizes} fit="cover" />
    </button>
  )
}

/**
 * The three client films as tabs (names, not numbers) over one stable 16:9
 * player, with the client context, contribution and deliverable beside it.
 *
 * - Switching tabs pauses the previous film, crossfades the poster within the
 *   same frame (≈220ms), fades the new text in and keeps the page where it is.
 *   The three text blocks share one grid cell, so the row keeps its height.
 * - Nothing plays, and no audio starts, until the visitor presses Play.
 * - Tabs follow the ARIA tabs pattern (arrow keys, Home, End; automatic
 *   activation) and the choice is kept in the URL hash without scrolling.
 */
export function FilmTabs({ films }: { films: ClientFilm[] }) {
  const [active, setActive] = useState(() => initialIndex(films))
  const [playing, setPlaying] = useState(false)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const { pathname } = useLocation()
  const base = useId()
  const film = films[active]
  const video = getVideo(film.video)
  const transcript = TRANSCRIPTS[film.video]

  useEffect(() => {
    if (playing) videoRef.current?.focus({ preventScroll: true })
  }, [playing, active])

  const select = (i: number, focus = false) => {
    if (focus) tabRefs.current[i]?.focus({ preventScroll: true })
    if (i === active) return
    videoRef.current?.pause()
    setPlaying(false)
    setActive(i)
    // Remember the choice for reload, sharing and Back, without moving the page.
    const url = i === 0 ? window.location.pathname + window.location.search : `#${films[i].id}`
    window.history.replaceState(window.history.state, '', url)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = films.length - 1
    const to =
      e.key === 'ArrowRight' ? (active === last ? 0 : active + 1)
      : e.key === 'ArrowLeft' ? (active === 0 ? last : active - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (to < 0) return
    e.preventDefault()
    select(to, true)
  }

  return (
    <div className="cw-films">
      <div className="cw-tabs" role="tablist" aria-label="Client projects" onKeyDown={onKey}>
        {films.map((f, i) => (
          <button
            key={f.id}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${f.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="cw-tab"
            onClick={() => select(i)}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${film.id}`} className="cw-row">
        <figure className="cw-player">
          <div className="cw-stage">
            <div
              className="cw-frame"
              data-case-hero=""
              data-transition-pending={isTransitionPending(pathname) ? 'true' : undefined}
              data-film={film.id}
            >
              {films.map((f, i) => (
                <div key={f.id} className="cw-poster" data-active={(i === active && !playing) || undefined} aria-hidden="true">
                  <ResponsiveImage image={getVideo(f.video).poster} sizes={POSTER_SIZES} decorative fit="contain" priority={i === active} />
                </div>
              ))}
              {playing ? (
                <video
                  key={film.id}
                  ref={videoRef}
                  className="cw-video"
                  src={pickVariant(video).src}
                  poster={fallbackSrc(getImage(video.poster), 1600)}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  aria-label={`${film.name} film`}
                />
              ) : (
                <button
                  type="button"
                  className="cw-play"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play ${film.name} film, ${spokenDuration(video.duration)}`}
                >
                  <span className="cw-play__chip" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="14" height="14">
                      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
                    </svg>
                    Play film
                    <span className="cw-play__time tabular">{shortDuration(video.duration)}</span>
                  </span>
                </button>
              )}
            </div>
          </div>
          <figcaption className="case-caption cw-caption">
            <CaptionText provenance={video.provenance}>{film.caption}</CaptionText>
          </figcaption>
          {transcript && (
            <details key={`t-${film.id}`} className="transcript cw-transcript">
              <summary>{film.name} transcript</summary>
              <div className="transcript__body">{transcript}</div>
            </details>
          )}
        </figure>

        <div className="cw-details">
          {films.map((f, i) => {
            const on = i === active
            return (
              <div key={f.id} className="cw-detail reading-scrim" data-active={on || undefined} inert={!on}>
                <p className="cw-detail__kind">{f.kind}</p>
                <h3 className="cw-detail__title">{f.name}</h3>
                <dl className="cw-facts">
                  <div>
                    <dt>Client context</dt>
                    <dd>{f.context}</dd>
                  </div>
                  <div>
                    <dt>My contribution</dt>
                    <dd>{f.contribution}</dd>
                  </div>
                  <div>
                    <dt>Deliverable</dt>
                    <dd>{f.deliverable}</dd>
                  </div>
                </dl>
                <div className="cw-gallery">
                  <p className="cw-gallery__label" id={`${base}-gallery-${f.id}`}>
                    {f.gallery.label}
                  </p>
                  <ul className="cw-stills" data-shape={f.gallery.shape} role="list" aria-labelledby={`${base}-gallery-${f.id}`}>
                    {f.gallery.images.map((id) => (
                      <li key={id}>
                        <Still image={id} sizes={STILL_SIZES[f.gallery.shape]} active={on} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

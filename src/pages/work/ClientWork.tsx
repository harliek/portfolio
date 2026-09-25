import '../../styles/pages/client-work.css'
import { useEffect, useRef, useState } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { FilmDialog } from '../../components/pages/client-work/FilmDialog'
import { fallbackSrc, getImage, getVideo } from '../../content/media'
import { CLIENT_WORK as C, type ClientFilm } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const project = projectById('client-work')

/** A muted excerpt that plays only while on screen (the poster under reduced motion). Decorative: the film is named beside it. */
function Loop({ clip }: { clip: ClientFilm['clip'] }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', clip.src)
          void video.play().catch(() => {})
        } else video.pause()
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [clip.src, reduced])
  return (
    <video
      ref={ref}
      className="cw-frame__video"
      poster={clip.poster}
      width={clip.width}
      height={clip.height}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      aria-hidden="true"
    />
  )
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

/** The complete film, with sound, in the site's film viewer (a quiet button; no player on the page). */
function WatchFilm({ film }: { film: ClientFilm }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const asset = getVideo(film.video)
  return (
    <>
      <button ref={buttonRef} type="button" className="cw-watch" onClick={() => setOpen(true)}>
        <span className="cw-watch__mark" aria-hidden="true" />
        Watch the film <span className="cw-watch__time">{clock(asset.duration)}</span>
      </button>
      {open && (
        <FilmDialog
          asset={asset}
          title={film.name}
          posterSrc={fallbackSrc(getImage(asset.poster), 1280)}
          start={{ time: 0, play: true, muted: false, volume: 1 }}
          onClose={() => {
            setOpen(false)
            requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }))
          }}
        />
      )}
    </>
  )
}

/** One film: the same 16:9 frame (the whole picture, never cropped or stretched) beside its text, on alternating sides. */
function Film({ film, index }: { film: ClientFilm; index: number }) {
  const id = `cw-${film.id}`
  return (
    <section className="cw-film" id={film.id} aria-labelledby={id} data-side={index % 2 ? 'right' : 'left'}>
      <figure className="cw-frame" {...(index === 0 ? { 'data-hero-media': '' } : { 'data-reveal': '' })}>
        <Loop clip={film.clip} />
      </figure>
      <div className="cw-text">
        <p className="cx-kicker">{film.kind}</p>
        <h2 className="cw-name" id={id}>
          {film.name}
        </h2>
        <div className="cx-body">{film.work}</div>
        <div className="cw-delivered">{film.delivered}</div>
        <WatchFilm film={film} />
      </div>
    </section>
  )
}

/**
 * Creative Production (brief v19): a compact introduction, then the three
 * client films, each presented the same way as Nickleby: a 16:9 frame with
 * a short muted excerpt that plays while it is on screen (the whole frame;
 * Aristocracy's 4:3 picture sits inside it with dark sides), its text beside
 * it, and the complete film with sound on request. The frames alternate
 * sides down the page. The first film's frame is where the homepage tile
 * (its footage) lands. Status: the films are the Shift Content team's;
 * Harlie's part is stated for each.
 */
export default function ClientWork() {
  return (
    <CasePage project={project} className="page-client-work">
      <header className="cw-intro cx-wrap" data-hero-reveal>
        <CaseTitle title={C.title} meta={C.meta} />
        <div className="cx-lede">{C.summary}</div>
        <p className="cx-status">{C.status}</p>
      </header>
      {C.films.map((film, i) => (
        <Film key={film.id} film={film} index={i} />
      ))}
    </CasePage>
  )
}

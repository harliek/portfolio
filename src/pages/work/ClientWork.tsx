import '../../styles/pages/client-work.css'
import { useEffect, useRef, useState } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { FilmDialog } from '../../components/pages/client-work/FilmDialog'
import { fallbackSrc, getImage, getVideo } from '../../content/media'
import { CLIENT_WORK as C, type ClientFilm } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'

const project = projectById('client-work')
const [NICKLEBY, ARISTOCRACY, NIGHT_CLUB] = C.films

/** A muted excerpt that plays only while on screen (the poster under reduced motion). Decorative: the film is named beside it. */
function Loop({ clip, className }: { clip: ClientFilm['clip'] | typeof C.hero; className?: string }) {
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
      className={className}
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

/**
 * A film scrubbed gently by the scroll: its time follows the frame's passage
 * through the window (no pinning), eased toward the target and never queuing
 * seeks. The excerpt is keyframe-dense (see ScrollScrubVideo's note).
 */
function Strip({ clip }: { clip: ClientFilm['clip'] }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return
    let target = 0
    let frame = 0
    const io = new IntersectionObserver(([e]) => e.isIntersecting && !video.getAttribute('src') && video.setAttribute('src', clip.src), { rootMargin: '100% 0px' })
    io.observe(video)
    const tick = () => {
      frame = 0
      if (video.readyState >= 1 && !video.seeking && video.duration) {
        const t = target * (video.duration - 0.05)
        const diff = t - video.currentTime
        if (Math.abs(diff) > 1 / 50) video.currentTime += diff * 0.35
      }
      if (Math.abs(target * (video.duration || 0) - video.currentTime) > 0.02) frame = requestAnimationFrame(tick)
    }
    const trigger = ScrollTrigger.create({
      trigger: video,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        target = self.progress
        if (!frame) frame = requestAnimationFrame(tick)
      },
    })
    return () => {
      io.disconnect()
      trigger.kill()
      cancelAnimationFrame(frame)
    }
  }, [clip.src, reduced])
  return (
    <video
      ref={ref}
      className="cw-strip__video"
      poster={clip.poster}
      width={clip.width}
      height={clip.height}
      muted
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

function FilmText({ film, id }: { film: ClientFilm; id: string }) {
  return (
    <div className="cw-text">
      <p className="cx-kicker">{film.kind}</p>
      <h2 className="cw-name" id={id}>
        {film.name}
      </h2>
      <div className="cx-body">{film.work}</div>
      <div className="cw-delivered">{film.delivered}</div>
      <WatchFilm film={film} />
    </div>
  )
}

/**
 * Creative Production (brief v16): three client films, each composed for
 * its footage rather than placed in a player. The opening is a wide moving
 * frame from Aristocracy's lit set with the title on it; Nickleby Capital
 * is a large 16:9 frame with the text around it; Aristocracy becomes a
 * vertical editorial arrangement of the film and two campaign photographs;
 * The Night Club runs across the full width, scrubbed by the scroll. Each
 * complete film opens with sound in the film viewer on request. Status: the
 * films are the Shift Content team's; Harlie's part is stated for each.
 */
export default function ClientWork() {
  return (
    <CasePage project={project} className="page-client-work">
      <header className="cw-hero">
        <div className="cw-hero__frame">
          <Loop clip={C.hero} className="cw-hero__video" />
          <div className="cw-hero__title">
            <CaseTitle title={C.title} meta={C.meta} />
          </div>
        </div>
        <div className="cw-hero__text">
          <div className="cx-lede">{C.summary}</div>
          <p className="cx-status">{C.status}</p>
        </div>
      </header>

      <section className="cw-film cw-nickleby" id={NICKLEBY.id} aria-labelledby="cw-nickleby">
        <figure className="cw-nickleby__frame cx-frame" data-reveal>
          <Loop clip={NICKLEBY.clip} />
        </figure>
        <FilmText film={NICKLEBY} id="cw-nickleby" />
      </section>

      <section className="cw-film cw-aristocracy" id={ARISTOCRACY.id} aria-labelledby="cw-aristocracy">
        <FilmText film={ARISTOCRACY} id="cw-aristocracy" />
        <div className="cw-aristocracy__set">
          <figure className="cw-aristocracy__film cx-frame" data-reveal>
            <Loop clip={ARISTOCRACY.clip} />
          </figure>
          <figure className="cw-aristocracy__photo cw-aristocracy__photo--high cx-frame" data-reveal>
            <ResponsiveImage image="aristocracy-photo-234" sizes="(min-width: 1100px) 20vw, 44vw" />
          </figure>
          <figure className="cw-aristocracy__photo cw-aristocracy__photo--low cx-frame" data-reveal>
            <ResponsiveImage image="aristocracy-photo-103" sizes="(min-width: 1100px) 20vw, 44vw" />
          </figure>
        </div>
      </section>

      <section className="cw-film cw-night" id={NIGHT_CLUB.id} aria-labelledby="cw-night">
        <figure className="cw-strip">
          <Strip clip={NIGHT_CLUB.clip} />
        </figure>
        <FilmText film={NIGHT_CLUB} id="cw-night" />
      </section>
    </CasePage>
  )
}

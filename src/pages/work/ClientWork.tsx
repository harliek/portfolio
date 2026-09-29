import '../../styles/pages/client-work.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { FilmDialog } from '../../components/pages/client-work/FilmDialog'
import { clock } from '../../components/media/DemoControls'
import { getImage, getVideo, posterSrc } from '../../content/media'
import { CLIENT_WORK as C, type ClientFilm } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { StatefulIcons, useActionState } from '../../components/ui/Stateful'

const project = projectById('client-work')

/** A film's length as words, rounded as the button's clock is (clock): "1 minute 40 seconds". */
function spokenLength(seconds: number) {
  const t = Math.max(0, Math.round(seconds))
  const unit = (n: number, word: string) => (n ? `${n} ${word}${n === 1 ? '' : 's'}` : '')
  return [unit(Math.floor(t / 60), 'minute'), unit(t % 60, 'second')].filter(Boolean).join(' ')
}

/**
 * A muted excerpt that plays only while on screen (the poster under reduced motion). Decorative: the film is named
 * beside it.
 */
function Loop({ clip }: { clip: ClientFilm['clip'] }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return
    let seen = false
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting
        if (e.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', clip.src)
          void video.play().catch(() => {})
        } else video.pause()
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(video)
    // The site pauses every video in a hidden tab (useMediaPlayback); shown again, an excerpt on screen carries on.
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && seen) void video.play().catch(() => {})
      else if (document.visibilityState !== 'visible') video.pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
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

/**
 * The complete film, with sound, in the site's film viewer: a stateful button (a moment of loading, then the viewer
 * opens and a check shows). The pointer's outline grows around it (CustomCursor.tsx). That outline, left behind when
 * the page's end scrolled this button past a resting pointer or the viewer opened over it, was the empty rounded
 * rectangle under the Night Club Global Tour text (Harlie's brief, 2026-09-28, item 1); nothing on this page draws one.
 */
function WatchFilm({ film }: { film: ClientFilm }) {
  const [open, setOpen] = useState(false)
  const [state, run] = useActionState()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const asset = getVideo(film.video)
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="cw-watch stateful"
        data-state={state}
        // The visible label first, then which film and how long, spoken as words (Harlie's brief, 2026-09-28: it was
        // read as "Watch the film 1:40", with no film named; About's film button names its film and length).
        aria-label={`Watch film, ${film.name}, ${spokenLength(asset.duration)}`}
        aria-busy={state === 'loading' || undefined}
        onClick={() => void run().then(() => setOpen(true))}
      >
        <StatefulIcons />
        {state === 'idle' && <span className="cw-watch__mark" aria-hidden="true" />}
        Watch film <span className="cw-watch__time">{clock(asset.duration)}</span>
      </button>
      {open && (
        <FilmDialog
          asset={asset}
          title={film.name}
          // The poster as WebP, at the width the JPEG was chosen at (aristocracy 960, heck 1280, nickleby 1138; 2026-09-29).
          posterSrc={posterSrc(getImage(asset.poster), 1280)}
          onClose={() => {
            setOpen(false)
            requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }))
          }}
        />
      )}
    </>
  )
}

/**
 * One film: the same 16:9 frame beside its text, on alternating sides (a 16:9 excerpt shows whole; Aristocracy's 4:3
 * excerpt is cropped to fill the frame, `fill`).
 */
function Film({ film, index }: { film: ClientFilm; index: number }) {
  const id = `cw-${film.id}`
  return (
    <section className="cw-film" id={film.id} aria-labelledby={id} data-side={index % 2 ? 'right' : 'left'}>
      {/* A click on the film opens it larger, with sound, as Watch the film does (Harlie's request); keyboard users have the button. */}
      <figure
        className="cw-frame"
        data-fill={film.clip.fill || undefined}
        // The first film is in view on opening (the homepage tile's picture lands on it); the others rise in.
        data-reveal={index === 0 ? undefined : ''}
        onClick={(e) => e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.cw-watch')?.click()}
      >
        <Loop clip={film.clip} />
      </figure>
      <div className="cw-text">
        <h2 className="cw-name" id={id}>
          {film.name}
        </h2>
        <div className="cx-body">{film.work}</div>
        <WatchFilm film={film} />
      </div>
    </section>
  )
}

/**
 * Creative Production (brief v19): a compact introduction (the title and its meta; the summary sentence removed at
 * Harlie's request, 2026-09-28), then the three
 * client films, each presented the same way as Nickleby: a 16:9 frame with
 * a short muted excerpt that plays while it is on screen (Aristocracy's 4:3
 * excerpt cropped to fill it), its text beside it, and the complete film with
 * sound on request. The frames alternate sides down the page. The first
 * film's frame is where the homepage tile (its footage) lands. Status: the
 * films are the Shift Content team's; Harlie's part is stated for each.
 *
 * The page's end is a settled screen (Harlie's brief, 2026-09-28): on wide windows the last film fills the window
 * above the footer (client-work.css), so the top edge falls in the space above it and never slices through the
 * Aristocracy section. The footer's height, which that needs, is kept in --cw-footer-h.
 */
export default function ClientWork() {
  const introRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const page = introRef.current?.closest<HTMLElement>('.cx')
    const footer = document.querySelector<HTMLElement>('.site-end')
    if (!page || !footer) return
    // Rounded down: the last film is then at least as tall as the room, never a pixel short of it.
    const measure = () => page.style.setProperty('--cw-footer-h', `${Math.floor(footer.getBoundingClientRect().height)}px`)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(footer)
    return () => ro.disconnect()
  }, [])
  return (
    <CasePage project={project} className="page-client-work">
      <header ref={introRef} className="cw-intro cx-wrap">
        <CaseTitle title={C.title} meta={C.meta} />
      </header>
      {C.films.map((film, i) => (
        <Film key={film.id} film={film} index={i} />
      ))}
    </CasePage>
  )
}


import '../../styles/pages/client-work.css'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { FilmDialog } from '../../components/pages/client-work/FilmDialog'
import { clock } from '../../components/media/DemoControls'
import { fallbackSrc, getImage, getVideo } from '../../content/media'
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
 * A muted excerpt (the poster under reduced motion). Decorative: the film is named beside it. It loads as it nears the
 * window and plays only while its film leads the page (`lead`, below) and is on screen, so one excerpt moves at a time
 * and only one set of burned-in subtitles is live (Harlie's brief, 2026-09-28: when a film plays or dominates, no more
 * than two strong text layers; up to three excerpts used to play together, each with its subtitles).
 */
function Loop({ clip, lead }: { clip: ClientFilm['clip']; lead: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const leadRef = useRef(lead)
  const syncRef = useRef<() => void>(() => {})
  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return
    let seen = false
    // The site pauses every video in a hidden tab (useMediaPlayback); shown again, the leading excerpt carries on.
    const sync = () => {
      if (seen && leadRef.current && document.visibilityState === 'visible') void video.play().catch(() => {})
      else video.pause()
    }
    syncRef.current = sync
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting
        if (seen && !video.getAttribute('src')) video.setAttribute('src', clip.src)
        sync()
      },
      { rootMargin: '10% 0px' },
    )
    io.observe(video)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      syncRef.current = () => {}
    }
  }, [clip.src, reduced])
  useEffect(() => {
    leadRef.current = lead
    syncRef.current()
  }, [lead])
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
        aria-label={`Watch the film, ${film.name}, ${spokenLength(asset.duration)}`}
        aria-busy={state === 'loading' || undefined}
        onClick={() => void run().then(() => setOpen(true))}
      >
        <StatefulIcons />
        {state === 'idle' && <span className="cw-watch__mark" aria-hidden="true" />}
        Watch the film <span className="cw-watch__time">{clock(asset.duration)}</span>
      </button>
      {open && (
        <FilmDialog
          asset={asset}
          title={film.name}
          posterSrc={fallbackSrc(getImage(asset.poster), 1280)}
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
 * excerpt is cropped to fill the frame, `fill`). The film that leads the page (`lead`) plays; the others rest under a
 * light veil with their names in the quieter heading grey (client-work.css), as a case study's steps that are not
 * current do.
 */
function Film({ film, index, lead }: { film: ClientFilm; index: number; lead: boolean }) {
  const id = `cw-${film.id}`
  return (
    <section className="cw-film" id={film.id} aria-labelledby={id} data-side={index % 2 ? 'right' : 'left'} data-lead={lead || undefined}>
      {/* A click on the film opens it larger, with sound, as Watch the film does (Harlie's request); keyboard users have the button. */}
      <figure
        className="cw-frame"
        data-fill={film.clip.fill || undefined}
        // The first film is in view on opening (the homepage tile's picture lands on it); the others rise in.
        data-reveal={index === 0 ? undefined : ''}
        onClick={(e) => e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.cw-watch')?.click()}
      >
        <Loop clip={film.clip} lead={lead} />
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
 *
 * While a film dominates, few layers of text compete with its subtitles (Harlie's brief, 2026-09-28: "no more than two
 * strong text layers at once (subtitles, nav, page copy, metadata)"). One film leads at a time, the one with the most
 * of its frame in the window (the nearer the window's centre when two show equally): its excerpt alone plays, and the
 * others rest veiled (Film). And the title with its details fades as it rises to the floating navigation (--cw-intro,
 * 1 to 0 as the title's top goes from 40px below the header's line to 20px above it), so the title no longer runs
 * under the navigation's words while the first film plays below it; on narrower windows the header is an opaque bar
 * and the fade is not applied (client-work.css).
 */
export default function ClientWork() {
  const introRef = useRef<HTMLElement>(null)
  const [lead, setLead] = useState<ClientFilm['id']>(C.films[0].id)
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
  useLayoutEffect(() => {
    const intro = introRef.current
    const page = intro?.closest<HTMLElement>('.cx')
    if (!intro || !page) return
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      let best: { id: ClientFilm['id']; shown: number; off: number } | null = null
      for (const film of C.films) {
        const box = page.querySelector(`#${film.id} .cw-frame`)?.getBoundingClientRect()
        if (!box) continue
        const shown = Math.max(0, Math.min(box.bottom, vh) - Math.max(box.top, 0))
        const off = Math.abs(box.top + box.height / 2 - vh / 2)
        if (shown > 0 && (!best || shown > best.shown + 1 || (shown > best.shown - 1 && off < best.off))) best = { id: film.id, shown, off }
      }
      if (best) setLead(best.id)
      // The title's top against the header's line (its bottom, --header-height, whether bar or pill).
      const title = intro.querySelector('.cx-title')?.getBoundingClientRect()
      const line = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 61
      const fade = title ? Math.min(1, Math.max(0, (title.top - line + 20) / 60)) : 1
      intro.style.setProperty('--cw-intro', fade.toFixed(3))
    }
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])
  return (
    <CasePage project={project} className="page-client-work">
      <header ref={introRef} className="cw-intro cx-wrap">
        <CaseTitle title={C.title} meta={C.meta} />
      </header>
      {C.films.map((film, i) => (
        <Film key={film.id} film={film} index={i} lead={film.id === lead} />
      ))}
    </CasePage>
  )
}

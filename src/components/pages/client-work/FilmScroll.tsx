import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import type { ClientFilm } from '../../../content/pages/client-work'
import { fallbackSrc, getImage, getVideo, type VideoAsset } from '../../../content/media'
import type { Project } from '../../../content/projects'
import { TRANSCRIPTS } from '../../../content/transcripts'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { prefersReducedMotion } from '../../../hooks/useReducedMotion'
import { goToSection } from '../../layout/RouteFocus'
import { shortDuration, spokenDuration } from '../../media/duration'
import { CaptionText } from '../../media/Figure'
import { Placeholder } from '../../media/Placeholder'
import { ResponsiveImage } from '../../media/ResponsiveImage'
import { isTransitionPending } from '../../transition/projectTransition'

/*
 * FilmScroll: the Client Work page's scroll-readable structure.
 *
 * Opening (title, compact metadata, the ownership note, one situation
 * paragraph) and a jump-navigation row of the three projects (links that
 * scroll to each section and mark the current one with aria-current). Then
 * one section per film: heading, kind, a "Watch film" button, the client and
 * assignment, Harlie's contribution, the deliverables, and a transcript
 * disclosure.
 *
 * Desktop (≥960px): the CaseScroll grid (44% text, 6% gap, 50% media). The
 * media column holds ONE sticky region: the navigation row, a stable 16:9
 * player and its caption. While no film is loaded, scrolling shows the poster
 * of the section at the activation line (40% of the viewport; decoded before
 * it is shown, 120ms fade over the previous poster). "Watch film" loads that
 * film in the player and plays it (stopping any other). A loaded film, playing,
 * paused or ended, is never replaced by scrolling; "Close film" returns to
 * the posters. Below 960px: stacked, each film with its own explanation.
 */

type FilmId = ClientFilm['id']

const DESKTOP = '(min-width: 960px)'
/** Keep in step with projects.ts `hero.sizes` (nickleby-poster). */
export const POSTER_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'
/** Share of the viewport height where a section becomes current. */
const ACTIVATION_LINE = 0.4
/** Poster change (ms): the new poster fades in over the old one, which stays visible underneath. */
const POSTER_FADE = 120

/** The variant for the current viewport (smallest suitable). */
const pickVariant = (video: VideoAsset) =>
  video.variants.find((v) => v.maxViewport !== undefined && window.innerWidth <= v.maxViewport) ?? video.variants[video.variants.length - 1]

/** Resolves when an image has decoded (or failed, or is missing). */
function whenDecoded(img: HTMLImageElement | null | undefined): Promise<void> {
  if (!img) return Promise.resolve()
  if (img.complete) return img.naturalWidth ? img.decode().catch(() => {}) : Promise.resolve()
  return new Promise((resolve) => {
    img.addEventListener('load', () => void img.decode().catch(() => {}).then(() => resolve()), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

/* ----------------------------------------------------------------------- */
/* Current section: scroll-position based                                   */
/* ----------------------------------------------------------------------- */

/**
 * The last section whose top has passed the activation line (the first
 * section until then; the last one once the page cannot scroll further).
 * rAF-throttled; the snapshot changes only when the section changes, so fast
 * scrolling lands on the right section without a queue of updates.
 */
class SectionTracker {
  private els: Array<HTMLElement | null> = []
  private active = 0
  private frame = 0
  private listeners = new Set<() => void>()
  private ro: ResizeObserver | null = null

  setEl(i: number, el: HTMLElement | null) {
    this.els[i] = el
    this.schedule()
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.schedule)
      this.ro = new ResizeObserver(this.schedule)
      this.ro.observe(document.body)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.schedule)
      this.ro?.disconnect()
      this.ro = null
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  getSnapshot = () => this.active

  private schedule = () => {
    if (!this.frame && this.listeners.size) this.frame = requestAnimationFrame(this.measure)
  }

  private measure = () => {
    this.frame = 0
    const line = window.innerHeight * ACTIVATION_LINE
    let active = 0
    this.els.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) active = i
    })
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    const last = this.els.length - 1
    if (atEnd && last >= 0 && this.els[last] && this.els[last].getBoundingClientRect().top < window.innerHeight) active = last
    if (active !== this.active) {
      this.active = active
      this.listeners.forEach((l) => l())
    }
  }
}

/* ----------------------------------------------------------------------- */
/* Small parts                                                              */
/* ----------------------------------------------------------------------- */

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.4-5.2a.5.5 0 0 0 0-.86l-8.4-5.2a.5.5 0 0 0-.76.43Z" fill="currentColor" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="m4 4 8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** The primary action for one film. The accessible name carries the film's name after the visible label. */
function WatchButton({ film, onWatch, buttonRef }: { film: ClientFilm; onWatch: (id: FilmId) => void; buttonRef?: (el: HTMLButtonElement | null) => void }) {
  const video = getVideo(film.video)
  return (
    <button ref={buttonRef} type="button" className="button cw-watch" onClick={() => onWatch(film.id)}>
      <PlayIcon />
      Watch film
      <span className="visually-hidden">
        , {film.name}, {spokenDuration(video.duration)}
      </span>
    </button>
  )
}

function CloseButton({ film, onClose }: { film: ClientFilm; onClose: () => void }) {
  return (
    <button type="button" className="button button--secondary button--small cw-close" onClick={onClose}>
      <CloseIcon />
      Close film
      <span className="visually-hidden">, {film.name}</span>
    </button>
  )
}

/** The jump-navigation row: links to the three sections; the current one is marked. */
function FilmNav({ films, active }: { films: ClientFilm[]; active: number }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (goToSection(id)) window.history.replaceState(window.history.state, '', `#${id}`)
  }
  return (
    <nav className="cw-nav" aria-label="Client projects on this page">
      <ul role="list">
        {films.map((f, i) => (
          <li key={f.id}>
            <a href={`#${f.id}`} className="nav-chip cw-nav__chip" aria-current={i === active ? 'true' : undefined} onClick={(e) => onClick(e, f.id)}>
              {f.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ----------------------------------------------------------------------- */
/* Player                                                                   */
/* ----------------------------------------------------------------------- */

interface PlayerProps {
  /** The films whose posters this frame holds (the sticky frame: all; an inline frame: one). */
  films: ClientFilm[]
  /** The film whose poster should show while nothing is loaded. */
  target: number
  /** The film loaded in this frame (shown instead of the posters), if any. */
  loaded: ClientFilm | null
  videoRef: RefObject<HTMLVideoElement | null>
  hero?: boolean
  priority?: boolean
  variant: 'sticky' | 'inline'
  controls?: ReactNode
  /** The film whose caption carries the provenance label ("Agency work"): the first one only, so it is not repeated under every film. */
  labelled: ClientFilm['id']
}

/**
 * A stable 16:9 frame: every poster is mounted (contained, so the 4:3 film
 * keeps its proportions), the target poster is shown once it has decoded
 * (the previous one stays visible underneath until the new one has faded
 * in), and a loaded film plays on top with native controls.
 */
function Player({ films, target, loaded, videoRef, hero = false, priority = false, variant, controls, labelled }: PlayerProps) {
  const { pathname } = useLocation()
  const frameRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState({ front: target, prev: -1 })
  // Hidden until the route transition reveals it (read once, so React never re-adds it).
  const [pending] = useState(() => hero && isTransitionPending(pathname))

  // A new target poster: wait for its image, then fade it in over the current one.
  useEffect(() => {
    if (target === view.front) return
    let cancelled = false
    const img = frameRef.current?.querySelector<HTMLImageElement>(`[data-poster="${target}"] img`)
    void whenDecoded(img).then(() => {
      if (!cancelled) setView((v) => ({ front: target, prev: v.front }))
    })
    return () => {
      cancelled = true
    }
  }, [target, view.front])

  // The previous poster hides once the new one has fully appeared.
  useEffect(() => {
    if (view.prev < 0) return
    const id = window.setTimeout(() => setView((v) => ({ ...v, prev: -1 })), prefersReducedMotion() ? 0 : POSTER_FADE + 40)
    return () => window.clearTimeout(id)
  }, [view.prev])

  // Safety net: if the route transition never reveals this frame, show it anyway.
  useEffect(() => {
    if (!pending) return
    const id = window.setTimeout(() => frameRef.current?.removeAttribute('data-transition-pending'), 2500)
    return () => window.clearTimeout(id)
  }, [pending])

  const shown = loaded ?? films[view.front] ?? films[0]
  const video = loaded ? getVideo(loaded.video) : null

  return (
    <div className="cw-player" data-variant={variant}>
      <figure className="cw-figure">
        <div
          ref={frameRef}
          className="cw-frame"
          data-case-hero={hero ? '' : undefined}
          data-transition-pending={pending ? 'true' : undefined}
          data-film={shown.id}
          data-loaded={loaded ? '' : undefined}
        >
          {films.map((f, i) => (
            <div
              key={f.id}
              className="cw-poster"
              data-poster={i}
              data-state={i === view.front ? 'shown' : i === view.prev ? 'under' : 'hidden'}
              aria-hidden="true"
            >
              <ResponsiveImage
                image={getVideo(f.video).poster}
                sizes={POSTER_SIZES}
                decorative
                fit="contain"
                priority={priority && i === 0}
                loading={priority && i === 0 ? undefined : variant === 'sticky' ? 'eager' : 'lazy'}
                fetchPriority={priority && i === 0 ? undefined : variant === 'sticky' ? 'low' : 'auto'}
              />
            </div>
          ))}
          {loaded && video && (
            <video
              key={loaded.id}
              ref={videoRef}
              className="cw-video"
              src={pickVariant(video).src}
              poster={fallbackSrc(getImage(video.poster), 1600)}
              width={video.width}
              height={video.height}
              controls
              playsInline
              preload="auto"
              aria-label={`${loaded.name} film`}
            />
          )}
        </div>
        <figcaption className="cw-caption">
          <CaptionText provenance={shown.id === labelled ? getVideo(shown.video).provenance : undefined}>{shown.caption}</CaptionText>
        </figcaption>
      </figure>
      {controls}
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* FilmScroll                                                               */
/* ----------------------------------------------------------------------- */

function Meta({ project }: { project: Project }) {
  const rows = [
    ['Company:', project.meta.company],
    ['Role:', project.meta.role],
    ['Dates:', project.meta.dates],
    ['Project status:', project.meta.status],
  ] as const
  return (
    <dl className="cs-meta">
      {rows.map(([label, value]) => (
        <div key={label} className="cs-meta__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

interface FilmScrollProps {
  project: Project
  situation: ReactNode
  /** One-line ownership note, stated once in the opening. */
  note?: ReactNode
  films: ClientFilm[]
}

export function FilmScroll({ project, situation, note, films }: FilmScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new SectionTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const [loadedId, setLoadedId] = useState<FilmId | null>(null)
  // Incremented by every "Watch film" press: plays (or resumes) and focuses the loaded film.
  const [start, setStart] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const watchRefs = useRef(new Map<FilmId, HTMLButtonElement>())
  // The Watch film button that takes focus after "Close film" (a new object per close, so repeats still run).
  const [focusAfterClose, setFocusAfterClose] = useState<{ id: FilmId } | null>(null)
  const loaded = films.find((f) => f.id === loadedId) ?? null

  const watch = (id: FilmId) => {
    setLoadedId(id)
    setStart((n) => n + 1)
  }
  const close = () => {
    videoRef.current?.pause()
    // Focus returns to a Watch film button in view: the closed film's own (stacked) or the current section's (desktop).
    const id = desktop ? films[active].id : loadedId
    if (id) setFocusAfterClose({ id })
    setLoadedId(null)
  }

  // After "Watch film" (once per press): bring a stacked player into view if needed, move focus to the film and play it.
  const handledStart = useRef(0)
  useEffect(() => {
    if (!start || start === handledStart.current) return
    handledStart.current = start
    const el = videoRef.current
    if (!el) return
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
    if (desktop) {
      // Near the end of the last section the sticky region starts to leave with its column: scroll back just enough to pin it again.
      const sticky = el.closest<HTMLElement>('.cw-sticky')
      const drift = sticky ? sticky.getBoundingClientRect().top - Number.parseFloat(getComputedStyle(sticky).top) : 0
      if (drift < -1) window.scrollBy({ top: drift, behavior })
    } else {
      const frame = el.closest('.cw-frame')
      const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
      const box = frame?.getBoundingClientRect()
      if (box && (box.top < header || box.bottom > window.innerHeight)) frame?.scrollIntoView({ block: 'center', behavior })
    }
    el.focus({ preventScroll: true })
    el.play().catch(() => {
      /* A refused play still leaves the native controls. */
    })
  }, [start, desktop])

  useEffect(() => {
    if (!focusAfterClose) return
    watchRefs.current.get(focusAfterClose.id)?.focus({ preventScroll: true })
  }, [focusAfterClose])

  // The sticky region's height (--cw-media-h): the last section is kept tall enough for the player to stay pinned.
  const gridRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const grid = gridRef.current
    const sticky = grid?.querySelector<HTMLElement>('.cw-sticky')
    if (!desktop || !grid || !sticky) return
    const write = () => grid.style.setProperty('--cw-media-h', `${Math.ceil(sticky.offsetHeight)}px`)
    write()
    const ro = new ResizeObserver(write)
    ro.observe(sticky)
    return () => {
      ro.disconnect()
      grid.style.removeProperty('--cw-media-h')
    }
  }, [desktop])

  return (
    <div ref={gridRef} className="cs cw" data-layout={desktop ? 'sticky' : 'stacked'}>
      <header className="cs-opening cw-opening">
        <h1 className="cs-title" tabIndex={-1}>
          {project.name}
        </h1>
        <Meta project={project} />
        {note && (
          <div className="cs-note">
            <p>{note}</p>
          </div>
        )}
        <div className="cs-situation case-prose">{situation}</div>
      </header>

      {desktop ? (
        <div className="cs-media cw-media">
          <div className="cw-sticky">
            <FilmNav films={films} active={active} />
            <Player
              films={films}
              target={active}
              loaded={loaded}
              videoRef={videoRef}
              hero
              priority
              variant="sticky"
              labelled={films[0].id}
              controls={
                <div className="cw-controls">
                  {loaded && (
                    <>
                      <p className="cw-controls__now">
                        Now showing <span className="cw-controls__name">{loaded.name}</span>
                      </p>
                      <CloseButton film={loaded} onClose={close} />
                    </>
                  )}
                </div>
              }
            />
          </div>
        </div>
      ) : (
        <div className="cw-nav-stacked">
          <FilmNav films={films} active={active} />
        </div>
      )}

      <div className="cs-body cw-body">
        {films.map((film, i) => {
          const video = getVideo(film.video)
          const transcript = TRANSCRIPTS[film.video]
          const isLoaded = loadedId === film.id
          return (
            <section
              key={film.id}
              id={film.id}
              ref={(el) => tracker.setEl(i, el)}
              className="cw-film"
              aria-labelledby={`${film.id}-title`}
              data-film-section=""
              data-current={(desktop && i === active) || undefined}
              data-last={i === films.length - 1 || undefined}
            >
              <h2 id={`${film.id}-title`} className="cs-heading cw-film__title">
                {film.name}
              </h2>
              <p className="cw-film__kind">
                {film.kind} <span aria-hidden="true">·</span> <span className="tabular">{shortDuration(video.duration)}</span>
              </p>

              {!desktop && (
                <div className="cw-inline">
                  <Player films={[film]} target={0} loaded={isLoaded ? film : null} videoRef={videoRef} hero={i === 0} priority={i === 0} variant="inline" labelled={films[0].id} />
                </div>
              )}

              <div className="cw-film__actions">
                {/* Stacked: while this film is loaded, its native controls replace Watch film and Close film returns to the poster. */}
                {(desktop || !isLoaded) && (
                  <WatchButton
                    film={film}
                    onWatch={watch}
                    buttonRef={(el) => {
                      if (el) watchRefs.current.set(film.id, el)
                      else watchRefs.current.delete(film.id)
                    }}
                  />
                )}
                {!desktop && isLoaded && <CloseButton film={film} onClose={close} />}
                {desktop && isLoaded && <span className="cw-film__status">Showing in the player</span>}
              </div>

              <dl className="cw-facts">
                <div>
                  <dt>Client and assignment</dt>
                  <dd className="case-prose">{film.client}</dd>
                </div>
                <div>
                  <dt>My contribution</dt>
                  <dd className="case-prose">{film.contribution}</dd>
                </div>
                <div>
                  <dt>Delivered by the agency</dt>
                  <dd className="case-prose">{film.delivered}</dd>
                </div>
              </dl>

              {film.evidence && (
                <div className="cw-evidence">
                  <Placeholder spec={film.evidence} />
                </div>
              )}

              {transcript && (
                <details className="cw-transcript">
                  <summary className="button button--secondary button--small cw-transcript__summary">
                    <svg className="cw-transcript__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="cw-transcript__show">Show transcript</span>
                    <span className="cw-transcript__hide">Hide transcript</span>
                    <span className="visually-hidden">, {film.name}</span>
                  </summary>
                  <div className="transcript__body cw-transcript__body">{transcript}</div>
                </details>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

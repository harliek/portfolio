import { useCallback, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import type { ClientFilm } from '../../../content/pages/client-work'
import { getVideo } from '../../../content/media'
import type { Project } from '../../../content/projects'
import { TRANSCRIPTS } from '../../../content/transcripts'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { CaseOpening } from '../../case/CaseScroll'
import { shortDuration } from '../../media/duration'
import { goToSection } from '../../layout/RouteFocus'
import { FilmPlayer, headerHeight } from './FilmPlayer'

/*
 * FilmScroll: the Creative Production page (brief-v8 section 13).
 *
 * The case opening (CaseOpening: H1, metadata, the camera cover with its
 * Concept cover label, the summary and the one status line), small anchor
 * links to the three projects, then three stacked project sections in order:
 * Nickleby Capital, Aristocracy, The Night Club Global Tour. Each section pairs
 * its own concise description (Harlie's part, then what the team delivered)
 * with its own film, and the page scrolls naturally: nothing is sticky and no
 * player switches films.
 *
 * Desktop (≥960px): the CaseScroll grid (42% text, 6% gap, 52% media). The
 * opening's text sits on the left with the cover on the right; each section's
 * heading is level with the top of its film (client-work.css).
 * Below 960px: the opening, the anchor links, then each section as heading,
 * film and description.
 *
 * Films (FilmPlayer): the film most in view previews muted, one at a time
 * (FilmFocus below), and pauses where it is when another takes over or it
 * leaves the view. No preview starts while a film plays with sound, under
 * reduced motion, with the browser's Save-Data preference, or after the
 * visitor has paused a preview (until they start a film). Once a visitor starts
 * a film it is theirs: nothing switches or restarts it, and its position is
 * kept. One film with sound at a time (useMediaPlayback).
 */

type FilmId = ClientFilm['id']

const DESKTOP = '(min-width: 960px)'
/** The poster's rendered width: the 52% media column (at most 645px), or the stacked column. Keep in step with projects.ts FRAME_SIZES. */
const POSTER_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'
/** Share of a film's frame that must be in view before it may preview. */
const PREVIEW_RATIO = 0.5

/* ----------------------------------------------------------------------- */
/* FilmFocus: the film most in view                                         */
/* ----------------------------------------------------------------------- */

/**
 * An external store of the film whose frame is at least half in view (below
 * the navigation) and nearest the middle of that view (null when none is), read from the scroll
 * position (rAF-throttled), so fast or backward scrolling lands on the right
 * film without a queue, and the snapshot changes only when that film changes.
 */
class FilmFocus {
  private els = new Map<FilmId, HTMLElement>()
  private current: FilmId | null = null
  private frame = 0
  private listeners = new Set<() => void>()
  private refs = new Map<FilmId, (el: HTMLElement | null) => void>()

  /** A stable ref callback per film. */
  ref(id: FilmId) {
    let cb = this.refs.get(id)
    if (!cb) {
      cb = (el) => {
        if (el) this.els.set(id, el)
        else this.els.delete(id)
        this.schedule()
      }
      this.refs.set(id, cb)
    }
    return cb
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.schedule)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.schedule)
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  getSnapshot = () => this.current

  private schedule = () => {
    if (!this.frame && this.listeners.size) this.frame = requestAnimationFrame(this.measure)
  }

  private measure = () => {
    this.frame = 0
    // The view below the fixed navigation.
    const top = headerHeight()
    const bottom = window.innerHeight
    let best: FilmId | null = null
    let bestDistance = Infinity
    this.els.forEach((el, id) => {
      const r = el.getBoundingClientRect()
      if (r.height <= 0) return
      const visible = Math.max(0, Math.min(r.bottom, bottom) - Math.max(r.top, top)) / r.height
      if (visible < PREVIEW_RATIO) return
      const distance = Math.abs((r.top + r.bottom) / 2 - (top + bottom) / 2)
      if (distance < bestDistance) {
        best = id
        bestDistance = distance
      }
    })
    if (best !== this.current) {
      this.current = best
      this.listeners.forEach((l) => l())
    }
  }
}

/** The browser's Save-Data preference (no muted previews then). */
const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

/* ----------------------------------------------------------------------- */
/* Pieces                                                                   */
/* ----------------------------------------------------------------------- */

/** Small anchor links to the three projects (they scroll to the section and move focus to its heading). */
function FilmNav({ films }: { films: ClientFilm[] }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: FilmId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (goToSection(id)) window.history.replaceState(window.history.state, '', `#${id}`)
  }
  return (
    <nav className="fs-nav" aria-label="Projects on this page" data-cover-reveal="">
      <ul role="list">
        {films.map((f) => (
          <li key={f.id}>
            <a href={`#${f.id}`} className="nav-chip fs-nav__chip" onClick={(e) => onClick(e, f.id)}>
              {f.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Transcript({ film }: { film: ClientFilm }) {
  const transcript = TRANSCRIPTS[film.video]
  if (!transcript) return null
  return (
    <details className="fs-transcript">
      <summary className="fs-transcript__summary">
        <svg className="fs-transcript__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="fs-transcript__show">Show transcript</span>
        <span className="fs-transcript__hide">Hide transcript</span>
        <span className="visually-hidden">, {film.name}</span>
      </summary>
      <div className="transcript__body fs-transcript__body">{transcript}</div>
    </details>
  )
}

/* ----------------------------------------------------------------------- */
/* FilmScroll                                                               */
/* ----------------------------------------------------------------------- */

interface FilmScrollProps {
  project: Project
  /** Metadata lines, no colons. */
  meta: string[]
  /** First-person opening. */
  summary: ReactNode
  /** The one project-status line under the summary. */
  status?: ReactNode
  /** The client films, Nickleby Capital first. */
  films: ClientFilm[]
  /** Scales the opening cover (CaseOpening; default 1). */
  coverSize?: number
}

export function FilmScroll({ project, meta, summary, status, films, coverSize }: FilmScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const reduced = useReducedMotion()
  const layout = desktop ? 'sticky' : 'stacked'
  const [focus] = useState(() => new FilmFocus())
  const inView = useSyncExternalStore(focus.subscribe, focus.getSnapshot, focus.getSnapshot)
  /** Films the visitor started (theirs from then on). */
  const [opened, setOpened] = useState<ReadonlySet<FilmId>>(() => new Set())
  /** The film playing with sound, if any. */
  const [audible, setAudible] = useState<FilmId | null>(null)
  /** The visitor paused a preview: no more previews until they start a film. */
  const [stopped, setStopped] = useState(false)
  const [lowData] = useState(saveData)

  const onOpen = useCallback((id: FilmId) => {
    setOpened((s) => (s.has(id) ? s : new Set(s).add(id)))
    setStopped(false)
  }, [])
  const onSound = useCallback((id: FilmId, on: boolean) => setAudible((a) => (on ? id : a === id ? null : a)), [])
  const onPreviewPause = useCallback(() => setStopped(true), [])

  const mayPreview = !reduced && !lowData && !stopped && audible === null

  return (
    <div className="cs fs" data-layout={layout} data-media="films">
      <CaseOpening project={project} meta={meta} summary={summary} status={status} coverSize={coverSize} />
      <FilmNav films={films} />

      <div className="fs-films" data-cover-reveal="">
        {films.map((film, i) => {
          const asset = getVideo(film.video)
          return (
            <section key={film.id} id={film.id} className="fs-film" aria-labelledby={`${film.id}-title`}>
              <header className="fs-film__head">
                <h2 id={`${film.id}-title`} className="cs-heading fs-film__title">
                  {film.name}
                </h2>
                <p className="fs-film__meta">
                  {film.kind} · {shortDuration(asset.duration)}
                </p>
              </header>
              <div className="fs-film__media" ref={focus.ref(film.id)}>
                <FilmPlayer
                  film={film}
                  preview={mayPreview && inView === film.id && !opened.has(film.id)}
                  opened={opened.has(film.id)}
                  onOpen={onOpen}
                  onSound={onSound}
                  onPreviewPause={onPreviewPause}
                  layout={layout}
                  sizes={POSTER_SIZES}
                  priority={i === 0}
                />
              </div>
              <div className="fs-film__body">
                <div className="case-prose">
                  {film.work}
                  {film.delivered}
                </div>
                <Transcript film={film} />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

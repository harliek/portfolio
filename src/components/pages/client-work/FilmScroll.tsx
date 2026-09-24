import { useCallback, useEffect, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import type { ClientFilm } from '../../../content/pages/client-work'
import type { Project } from '../../../content/projects'
import { TRANSCRIPTS } from '../../../content/transcripts'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { goToSection } from '../../layout/RouteFocus'
import { CoverSlot } from '../../transition/CoverSlot'
import { FilmPlayer } from './FilmPlayer'

/*
 * FilmScroll: the Creative Production page (brief-v5 section 22). It follows
 * the case-study opening of CaseScroll (the same .cs grid, classes and
 * contracts): H1, metadata lines, the first-person summary and the camera
 * cover (<CoverSlot id={project.accent} />) on the left, real media on the
 * right, `data-cover-reveal` on the text and the media for the carousel
 * transition.
 *
 * Desktop (≥960px): the media column holds ONE sticky region from the
 * opening until the last film's section ends: the project navigation
 * (Nickleby Capital, Aristocracy, The Night Club Global Tour) above one
 * stable 16:9 player (FilmPlayer). The page opens with a muted preview of the
 * Nickleby Capital film; while it only previews, scrolling moves the player
 * to the film of the section being read. Once the visitor opens a film (Watch
 * film, Watch with sound, unmuting, playing, scrubbing, full screen or
 * expand), it stays in place while the page scrolls. The navigation marks
 * the film in the player; choosing another project there returns the player
 * to previews and scrolls to that project. One film plays at a time.
 * Below 960px: title, metadata, summary, cover, the project navigation, then
 * each project with its own player (only the first previews by itself).
 */

type FilmId = ClientFilm['id']

const DESKTOP = '(min-width: 960px)'
/** Keep in step with projects.ts FRAME_SIZES (the Nickleby poster is warmed with it before the page opens). */
const POSTER_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'
/** Share of the viewport height where a section becomes active. */
const ACTIVATION_LINE = 0.4
/** The last section stays active for at least this share of the viewport height while the player is pinned. */
const LAST_DWELL = 0.22
/** The lowest the activation line may move near the end (share of the viewport). */
const MAX_LINE = 0.75
/** The line moves down over RAMP × the distance it moves. */
const RAMP = 3

/* ----------------------------------------------------------------------- */
/* Active section (the same rules as CaseScroll's tracker)                  */
/* ----------------------------------------------------------------------- */

/**
 * The last section whose top has passed the activation line (-1 = the
 * opening), from the scroll position (rAF-throttled; the snapshot changes
 * only when the section changes, so fast scrolling in either direction lands
 * on the same state without a queue). Near the end (desktop) the line moves
 * down gradually, at most to 75% of the viewport, so the last section
 * becomes active LAST_DWELL of the viewport before the sticky player starts
 * to leave with its column; only a player too tall for that gives the text
 * column a short tail (--cs-tail). Ported from CaseScroll.tsx, whose tracker
 * is not exported.
 */
class SectionTracker {
  private els: Array<HTMLElement | null> = []
  private grid: HTMLElement | null = null
  private column: HTMLElement | null = null
  private sticky: HTMLElement | null = null
  private body: HTMLElement | null = null
  private active = -1
  private frame = 0
  private listeners = new Set<() => void>()
  private ro: ResizeObserver | null = null
  private dirty = true
  private stickyTop = 0
  private tail = 0

  setEl(i: number, el: HTMLElement | null) {
    this.els[i] = el
    this.relayout()
  }

  setCount(n: number) {
    this.els.length = n
  }

  /** Ref callback for the media column (desktop only). Stable identity. */
  attachMedia = (column: HTMLElement | null) => {
    if (column === this.column) return
    this.setTail(0)
    this.column = column
    this.grid = column?.parentElement ?? null
    this.sticky = column?.querySelector<HTMLElement>('.cs-sticky') ?? null
    this.body = this.grid?.querySelector<HTMLElement>(':scope > .cs-body') ?? null
    this.relayout()
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.resized)
      this.ro = new ResizeObserver(this.relayout)
      this.ro.observe(document.body)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.resized)
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

  private relayout = () => {
    this.dirty = true
    this.schedule()
  }

  private resized = () => {
    this.setTail(0)
    this.relayout()
  }

  private setTail(px: number) {
    this.tail = px
    if (px > 0) this.grid?.style.setProperty('--cs-tail', `${px}px`)
    else this.grid?.style.removeProperty('--cs-tail')
  }

  private line(vh: number) {
    const base = vh * ACTIVATION_LINE
    const n = this.els.length
    const lastEl = this.els[n - 1]
    const { column, sticky, body } = this
    if (!lastEl || !column || !sticky || !body) return base
    const y = window.scrollY
    if (this.dirty) {
      this.dirty = false
      this.stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0
    }
    const region = this.stickyTop + sticky.offsetHeight
    const dwell = vh * LAST_DWELL
    const lastTop = lastEl.getBoundingClientRect().top + y
    const after = body.getBoundingClientRect().bottom + y - this.tail - lastTop
    const tail = Math.max(0, Math.ceil(region + dwell - after - vh * MAX_LINE))
    if (tail > this.tail) this.setTail(tail)
    const unpin = column.getBoundingClientRect().bottom + y - region
    const end = unpin - dwell
    const shift = Math.min(Math.max(lastTop - end - base, 0), vh * (MAX_LINE - ACTIVATION_LINE))
    if (!shift) return base
    const start = Math.max(0, end - RAMP * shift)
    const progress = end > start ? Math.min(Math.max((y - start) / (end - start), 0), 1) : y >= end ? 1 : 0
    return base + shift * progress
  }

  private measure = () => {
    this.frame = 0
    const line = this.line(window.innerHeight)
    let active = -1
    for (let i = 0; i < this.els.length; i++) {
      const el = this.els[i]
      if (!el) continue
      if (el.getBoundingClientRect().top <= line) active = i
      else break
    }
    if (active !== this.active) {
      this.active = active
      this.listeners.forEach((l) => l())
    }
  }
}

/* ----------------------------------------------------------------------- */
/* Pieces                                                                   */
/* ----------------------------------------------------------------------- */

/** The project navigation: links to the three projects; `current` marks the film in the player (desktop). */
function FilmNav({ films, current, onPick }: { films: ClientFilm[]; current: number; onPick: (id: FilmId) => void }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>, id: FilmId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onPick(id)
    if (goToSection(id)) window.history.replaceState(window.history.state, '', `#${id}`)
  }
  return (
    <nav className="fs-nav" aria-label="Projects on this page">
      <ul role="list">
        {films.map((f, i) => (
          <li key={f.id}>
            <a href={`#${f.id}`} className="nav-chip fs-nav__chip" aria-current={i === current ? 'true' : undefined} onClick={(e) => onClick(e, f.id)}>
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
      <summary className="button button--secondary button--small fs-transcript__summary">
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
  /** First-person opening, 35 to 55 words. */
  summary: ReactNode
  /** The client films, Nickleby Capital first. */
  films: ClientFilm[]
  /** CoverSlot scale (default 0.72, as on the other case studies). */
  coverScale?: number
}

export function FilmScroll({ project, meta, summary, films, coverScale = 0.72 }: FilmScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new SectionTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const count = films.length
  useEffect(() => tracker.setCount(count), [tracker, count])
  const attachMedia = useCallback((el: HTMLDivElement | null) => tracker.attachMedia(el), [tracker])
  /** The film the visitor opened (it stays in place), or null while the player only previews. */
  const [openedId, setOpenedId] = useState<FilmId | null>(null)
  /**
   * The project chosen in the navigation, held until the visitor scrolls again. Near the end of the page
   * the activation line sits lower (see SectionTracker), so the chosen section, scrolled to the top, is not
   * necessarily the active one; the choice wins until the next scroll the visitor makes.
   */
  const [pickedId, setPickedId] = useState<FilmId | null>(null)

  useEffect(() => {
    if (!pickedId) return
    let armed = false
    const release = () => setPickedId(null)
    // The navigation's own (smooth) scroll ends first; any scroll after that is the visitor's.
    const arm = () => {
      if (armed) return
      armed = true
      window.addEventListener('scroll', release, { once: true, passive: true })
    }
    window.addEventListener('scrollend', arm, { once: true })
    const fallback = window.setTimeout(arm, 1200)
    return () => {
      window.clearTimeout(fallback)
      window.removeEventListener('scrollend', arm)
      window.removeEventListener('scroll', release)
    }
  }, [pickedId])

  const openedIndex = films.findIndex((f) => f.id === openedId)
  const pickedIndex = films.findIndex((f) => f.id === pickedId)
  // The section marked as active: the chosen project until the visitor scrolls, else the scroll position.
  const current = pickedIndex >= 0 ? pickedIndex : active
  const shown = openedIndex >= 0 ? openedIndex : Math.max(0, current)

  // Choosing a project in the navigation: a different film than the opened one returns the player to previews.
  const pick = (id: FilmId) => {
    if (openedId && openedId !== id) setOpenedId(null)
    setPickedId(id)
  }

  return (
    <div className="cs fs" data-layout={desktop ? 'sticky' : 'stacked'} data-media="films">
      <header className="cs-opening">
        <div className="cs-intro" data-cover-reveal="">
          <h1 className="cs-title" tabIndex={-1}>
            {project.name}
          </h1>
          {meta.length > 0 && (
            <p className="cs-meta">
              {meta.map((line) => (
                <span key={line} className="cs-meta__line">
                  {line}
                </span>
              ))}
            </p>
          )}
          <div className="cs-summary case-prose">{summary}</div>
        </div>
        <div className="cs-cover">
          <CoverSlot id={project.accent} scale={coverScale} />
        </div>
      </header>

      {desktop ? (
        <div className="cs-media fs-media" ref={attachMedia}>
          <div className="cs-sticky fs-sticky" data-cover-reveal="">
            <FilmNav films={films} current={shown} onPick={pick} />
            <FilmPlayer
              films={films}
              film={films[shown]}
              variant="sticky"
              preview
              opened={openedIndex >= 0}
              silenced={false}
              onOpen={setOpenedId}
              sizes={POSTER_SIZES}
              priority
            />
          </div>
        </div>
      ) : (
        <div className="fs-nav-stacked" data-cover-reveal="">
          <FilmNav films={films} current={-1} onPick={pick} />
        </div>
      )}

      <div className="cs-body fs-body" data-cover-reveal="">
        {films.map((film, i) => (
          <section
            key={film.id}
            id={film.id}
            ref={(el) => tracker.setEl(i, el)}
            className="cs-section fs-section"
            data-active={(desktop && i === current) || undefined}
            aria-labelledby={`${film.id}-title`}
          >
            <h2 id={`${film.id}-title`} className="cs-heading">
              {film.name}
            </h2>
            {!desktop && (
              <div className="fs-inline">
                <FilmPlayer
                  films={[film]}
                  film={film}
                  variant="inline"
                  preview={i === 0}
                  opened={openedId === film.id}
                  silenced={openedId !== null && openedId !== film.id}
                  onOpen={setOpenedId}
                  sizes={POSTER_SIZES}
                  priority={i === 0}
                />
              </div>
            )}
            <div className="case-prose">{film.body}</div>
            <Transcript film={film} />
          </section>
        ))}
      </div>
    </div>
  )
}

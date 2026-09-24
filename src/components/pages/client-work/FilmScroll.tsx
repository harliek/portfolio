import { useCallback, useEffect, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import type { ClientFilm } from '../../../content/pages/client-work'
import type { Project } from '../../../content/projects'
import { TRANSCRIPTS } from '../../../content/transcripts'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { goToSection } from '../../layout/RouteFocus'
import { CoverSlot } from '../../transition/CoverSlot'
import { metaLine } from '../../case/metaLine'
import { StoryTracker } from '../../case/storyTracker'
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
 * opening down to the page end (its player is capped so the region stays in
 * full view above the next-project link and the footer, case.css
 * --cs-after, client-work.css): the project navigation
 * (Nickleby Capital, Aristocracy, The Night Club Global Tour) above one
 * stable 16:9 player (FilmPlayer). The page opens with a muted preview of the
 * Nickleby Capital film; while it only previews, scrolling moves the player
 * to the film of the section being read. Once the visitor opens a film (Watch
 * film, Watch with sound, unmuting, playing, scrubbing, full screen or
 * expand), it stays in place while the page scrolls. The navigation marks
 * the film in the player; choosing another project there returns the player
 * to previews and scrolls to that project. A link to a project
 * (#aristocracy) selects it the same way on arrival. One film plays at a time.
 * Below 960px: title, metadata, summary, cover, then each project under its
 * heading with its own player (only the first previews by itself); the
 * project navigation is desktop only, where it controls the one player.
 */

type FilmId = ClientFilm['id']

const DESKTOP = '(min-width: 960px)'
/** Keep in step with projects.ts FRAME_SIZES (the Nickleby poster is warmed with it before the page opens). */
const POSTER_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'
/** A pick holds at least this long (ms), past the page's own alignment of a linked section on arrival (RouteFocus). */
const PICK_HOLD = 600

/* ----------------------------------------------------------------------- */
/* Pieces                                                                   */
/* ----------------------------------------------------------------------- */

/** The project navigation (desktop): links to the three projects; `current` marks the film in the player. */
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
  /** First-person opening, 35 to 55 words. */
  summary: ReactNode
  /** The client films, Nickleby Capital first. */
  films: ClientFilm[]
  /** CoverSlot scale (default 0.72, as on the other case studies). */
  coverScale?: number
}

export function FilmScroll({ project, meta, summary, films, coverScale = 0.72 }: FilmScrollProps) {
  const desktop = useMediaQuery(DESKTOP)
  const [tracker] = useState(() => new StoryTracker())
  const active = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, tracker.getSnapshot)
  const count = films.length
  useEffect(() => tracker.setCount(count), [tracker, count])
  const attachMedia = useCallback((el: HTMLDivElement | null) => tracker.attachMedia(el), [tracker])
  /** The film the visitor opened (it stays in place), or null while the player only previews. */
  const [openedId, setOpenedId] = useState<FilmId | null>(null)
  /**
   * The project chosen in the navigation, or named by the link the page was opened with
   * (#aristocracy), held until the visitor scrolls. Near the end of the page the activation line
   * sits lower (storyTracker.ts), so the chosen section, scrolled to the top, is not necessarily the
   * active one; the choice wins until the next scroll the visitor makes.
   */
  const [pickedId, setPickedId] = useState<FilmId | null>(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    return films.find((f) => f.id === id)?.id ?? null
  })

  useEffect(() => {
    if (!pickedId) return
    let armed = false
    let settled = false
    let held = false
    const release = () => setPickedId(null)
    // The page's own scroll ends first (the navigation's smooth scroll, or the alignment of a linked
    // section on arrival); any scroll after that is the visitor's.
    const arm = () => {
      if (armed) return
      armed = true
      window.addEventListener('scroll', release, { once: true, passive: true })
    }
    const onEnd = () => {
      settled = true
      if (held) arm()
    }
    window.addEventListener('scrollend', onEnd)
    const hold = window.setTimeout(() => {
      held = true
      if (settled) arm()
    }, PICK_HOLD)
    const fallback = window.setTimeout(arm, 1200)
    return () => {
      window.clearTimeout(hold)
      window.clearTimeout(fallback)
      window.removeEventListener('scrollend', onEnd)
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
                  {metaLine(line)}
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

      {/* Stacked, each film's heading sits directly above its own player, so the project navigation is left out. */}
      {desktop && (
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

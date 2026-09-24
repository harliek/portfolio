import '../../styles/case.css'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import type { Project } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { isTransitionPending } from '../transition/projectTransition'

/*
 * The shared case-study layout (docs/site-structure.md, section Case studies).
 *
 *   <CaseLayout project className="page-x">   article, page meta, accent colour
 *     <CaseScroll … />                         opening + sections beside one sticky
 *                                              media region (see CaseScroll.tsx)
 *     <Results figure={…}>…</Results>          compact, 56–72px after the grid
 *     <NextProject current={project.id} />     one "Next project · Name ↗" row
 *   </CaseLayout>
 *
 * CaseOpening, CaseSection, SectionLinks, CaseFacts and CaseHeroFigure below
 * are LEGACY (the pill row, "Context and role" sections and the separate
 * opening are gone from the new design). They stay only until every page
 * has moved to CaseScroll; do not use them in new work.
 */

/** @deprecated Legacy section pill row; CaseScroll pages have no section links. */
export const SECTION_LINKS = [
  { id: 'context', label: 'Context and role' },
  { id: 'problem', label: 'Problem' },
  { id: 'approach', label: 'Approach' },
  { id: 'results', label: 'Results' },
] as const

const ACCENT_VAR: Record<Project['accent'], string> = {
  violet: 'var(--stage-violet)',
  green: 'var(--stage-green)',
  warm: 'var(--stage-amber)',
}

interface CaseLayoutProps {
  project: Project
  /** Page root class, e.g. `page-cafepress-uk` (scope page CSS under it). */
  className?: string
  children: ReactNode
}

export function CaseLayout({ project, className, children }: CaseLayoutProps) {
  usePageMeta(project.seo.title, project.seo.description)
  return (
    <article
      className={['case', className].filter(Boolean).join(' ')}
      data-project={project.id}
      style={{ '--case-accent': ACCENT_VAR[project.accent] } as CSSProperties}
    >
      {children}
    </article>
  )
}

export interface Fact {
  label: string
  value: ReactNode
}

/** Role, timeframe and status by default (verified values from projects.ts). */
export const defaultFacts = (project: Project): Fact[] => [
  { label: 'Role', value: project.role },
  { label: 'Timeframe', value: project.dateRange },
  { label: 'Status', value: project.status },
]

export function CaseFacts({ facts }: { facts: Fact[] }) {
  return (
    <dl className="case-facts">
      {facts.map((f) => (
        <div key={f.label} className="case-facts__row">
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Scrolls to a section without depending on any animation; focus follows for keyboard users. */
function onSectionLink(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  const heading = target.querySelector<HTMLElement>('h2') ?? target
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus({ preventScroll: true })
  window.history.replaceState(window.history.state, '', `#${id}`)
}

/** @deprecated Legacy (see the note at the top of this file). */
export function SectionLinks({ links = SECTION_LINKS }: { links?: ReadonlyArray<{ id: string; label: string }> }) {
  return (
    <nav className="section-links" aria-label="On this page">
      <ul role="list">
        {links.map((l) => (
          <li key={l.id}>
            <a href={`#${l.id}`} className="section-links__link" onClick={(e) => onSectionLink(e, l.id)}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface CaseOpeningProps {
  project: Project
  /** Defaults to the project's supporting label. */
  subtitle?: ReactNode
  /** A concise company or project description (one or two short paragraphs). */
  description: ReactNode
  /** Defaults to Role, Timeframe, Status. */
  facts?: Fact[]
  /** A brief status or boundary line shown near the introduction. */
  note?: ReactNode
  /** A short result summary, where available. */
  summary?: ReactNode
  /** The one representative image (or a small composition of real media). */
  hero: ReactNode
  /** Section links; pass null to omit (e.g. a page with its own structure). */
  links?: ReadonlyArray<{ id: string; label: string }> | null
  /** Extra content under the links (e.g. a related-project link). */
  children?: ReactNode
}

/** @deprecated Legacy: use CaseScroll. */
export function CaseOpening({ project, subtitle, description, facts, note, summary, hero, links = SECTION_LINKS, children }: CaseOpeningProps) {
  const { pathname } = useLocation()
  return (
    <header className="case-shell case-opening">
      <div className="case-opening__text reading-scrim">
        <h1 className="case-title" tabIndex={-1}>
          {project.name}
        </h1>
        <p className="case-subtitle">{subtitle ?? project.label}</p>
        <div className="case-opening__description case-prose">{description}</div>
        <CaseFacts facts={facts ?? defaultFacts(project)} />
        {note && <p className="case-note">{note}</p>}
        {summary && <div className="case-summary">{summary}</div>}
        {links && <SectionLinks links={links} />}
        {children}
      </div>
      <div className="case-opening__media" data-case-hero="" data-transition-pending={isTransitionPending(pathname) ? 'true' : undefined}>
        {hero}
      </div>
    </header>
  )
}

interface CaseSectionProps {
  id: string
  title: string
  /** Media for the right-hand column (text stays on the left). */
  aside?: ReactNode
  /** The section's content spans both columns below its heading (e.g. a StickyVisual). */
  wide?: boolean
  className?: string
  children: ReactNode
}

/** @deprecated Legacy: use CaseScroll sections. */
export function CaseSection({ id, title, aside, wide = false, className, children }: CaseSectionProps) {
  const headingId = `${id}-title`
  return (
    <section id={id} className={['case-shell case-section', className].filter(Boolean).join(' ')} aria-labelledby={headingId} data-wide={wide || undefined}>
      <div className="case-section__text reading-scrim">
        <h2 id={headingId} className="case-heading">
          {title}
        </h2>
        {!wide && <div className="case-prose">{children}</div>}
      </div>
      {wide && <div className="case-section__wide">{children}</div>}
      {!wide && aside && <div className="case-section__aside">{aside}</div>}
    </section>
  )
}

/** @deprecated Legacy: the representative image with its caption (CaseOpening `hero`). */
export function CaseHeroFigure({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="case-hero">
      <div className="case-hero__frame">{children}</div>
      {caption && <figcaption className="case-caption">{caption}</figcaption>}
    </figure>
  )
}

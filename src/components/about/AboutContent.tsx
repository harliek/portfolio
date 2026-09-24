import '../../styles/pages/about.css'
import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ABOUT } from '../../content/pages/about'
import { projectById, projectPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isTransitionPending } from '../transition/projectTransition'
import { ArtPreview } from './ArtPreview'
import { FeaturedFilm } from './FeaturedFilm'

/** Id of the small "About" label. */
export const ABOUT_LABEL_ID = 'about-label'
/** Id of the greeting heading. */
export const ABOUT_TITLE_ID = 'about-title'

const prefetch = (path: string) => ({
  onPointerEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
})

interface AboutContentProps {
  /** 1 on the /about page (2 if the content is ever nested under another page's H1). */
  headingLevel: 1 | 2
}

/**
 * The About composition of the /about page (opened from the carousel's
 * About Me tile and the header's About link).
 *
 * 1. Portrait beside the greeting, the two-paragraph biography and
 *    "View résumé ↗" (the PDF in a new tab).
 * 2. Experience (verified roles and dates, with a text link to the related
 *    case study) and Education in its own compact block.
 * 3. "My art portfolio": the silent art-portfolio loop beside a sentence and
 *    an "Open art portfolio ↗" button to /creative.
 * 4. "An Artistic End": the authentic poster and a "Watch An Artistic End"
 *    button that loads the player only after the click.
 *
 * It ends there: the site footer that follows is the single contact area,
 * so there is no second email or LinkedIn row here.
 *
 * Every block shares one two-column grid on wide screens (a narrow column
 * for the portrait, labels and feature text; a wide one for the biography,
 * lists and media) and stacks in reading order on narrow ones.
 */
export function AboutContent({ headingLevel }: AboutContentProps) {
  const { pathname } = useLocation()
  const pending = isTransitionPending(pathname)
  const portraitRef = useRef<HTMLDivElement>(null)
  // Safety net: if the route transition never reveals the portrait, show it anyway.
  useEffect(() => {
    if (!pending) return
    const id = window.setTimeout(() => portraitRef.current?.removeAttribute('data-transition-pending'), 2500)
    return () => window.clearTimeout(id)
  }, [pending])
  const Heading = `h${headingLevel}` as const
  const Sub = headingLevel === 1 ? 'h2' : 'h3'

  return (
    <div className="about-content" data-level={headingLevel}>
      <div className="about-block about-intro">
        <div className="about-intro__head">
          <p id={ABOUT_LABEL_ID} className="about-label">
            {ABOUT.label}
          </p>
          <Heading id={ABOUT_TITLE_ID} className="about-heading" tabIndex={-1}>
            {ABOUT.greeting}
          </Heading>
        </div>
        {/* The opening image for the carousel's About Me tile: revealed in place once decoded (projectTransition.ts). */}
        <div ref={portraitRef} className="about-intro__portrait" data-case-hero="" data-transition-pending={pending ? 'true' : undefined}>
          {/* The page's largest image loads eagerly. */}
          <ResponsiveImage image="headshot" sizes="(min-width: 960px) 300px, 240px" priority={headingLevel === 1} />
        </div>
        <div className="about-intro__body">
          {ABOUT.bio.map((p, i) => (
            <p key={i} className="about-intro__para">
              {p}
            </p>
          ))}
          <p className="about-intro__actions">
            <a href={SITE.resume} className="button about-resume" target="_blank" rel="noopener">
              {ABOUT.resumeLabel}
              <span aria-hidden="true">↗</span>
              <span className="visually-hidden"> (PDF, opens in a new tab)</span>
            </a>
          </p>
        </div>
      </div>

      <div className="about-block about-record">
        <section className="about-record__experience" aria-labelledby="about-experience-title">
          <Sub id="about-experience-title" className="about-subheading about-record__title">
            {ABOUT.experienceTitle}
          </Sub>
          <ol className="about-roles" role="list">
            {ABOUT.experience.map((r) => {
              const project = 'project' in r && r.project ? projectById(r.project) : null
              const path = project ? projectPath(project) : null
              return (
                <li key={r.org} className="about-role">
                  <span className="about-role__org">{r.org}</span>
                  <span className="about-role__title">{r.role}</span>
                  <span className="about-role__dates tabular">{r.dates}</span>
                  {project && path && (
                    <Link to={path} className="text-link about-role__link" {...prefetch(path)}>
                      {project.name} case study
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <section className="about-record__education" aria-labelledby="about-education-title">
          <Sub id="about-education-title" className="about-subheading about-record__title">
            {ABOUT.educationTitle}
          </Sub>
          <div className="about-school">
            <p className="about-school__name">{ABOUT.education.school}</p>
            <p className="about-school__degree">{ABOUT.education.degree}</p>
            <p className="about-school__extra">{ABOUT.education.certificate}</p>
            <p className="about-school__dates tabular">{ABOUT.education.dates}</p>
          </div>
        </section>
      </div>

      <section className="about-block about-feature about-art" aria-labelledby="about-art-title">
        <div className="about-feature__head">
          <Sub id="about-art-title" className="about-subheading">
            {ABOUT.art.title}
          </Sub>
        </div>
        <ArtPreview />
        <div className="about-feature__body">
          <p className="about-feature__text">{ABOUT.art.text}</p>
          <p className="about-feature__actions">
            <Link to={ABOUT.art.href} className="button about-art__open" {...prefetch(ABOUT.art.href)}>
              {ABOUT.art.cta}
              <span aria-hidden="true">↗</span>
            </Link>
          </p>
        </div>
      </section>

      <FeaturedFilm level={Sub === 'h2' ? 2 : 3} />
    </div>
  )
}

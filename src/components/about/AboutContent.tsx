import '../../styles/pages/about.css'
import { Link } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { ABOUT } from '../../content/pages/about'
import { projectById, projectPath } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { ArtPreview } from './ArtPreview'
import { FeaturedFilm } from './FeaturedFilm'

const prefetch = (path: string) => ({
  onPointerEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
})

/** The portrait's rendered widths (about.css --portrait-w). */
const PORTRAIT_SIZES = '(min-width: 960px) 360px, (min-width: 720px) 300px, 260px'

/**
 * The /about page, reached from the carousel's About Me object and the
 * header's About link. One 40/60 grid on wide screens, stacked in reading
 * order on narrow ones:
 *
 * 1. Opening (brief v17). The photograph of Harlie, static, on the left
 *    (about 40%), its top level with the pink serif greeting; on the right
 *    (about 60%) the greeting, the lead and its concrete follow-up, and
 *    three short paragraphs (what I build, how cognitive science informs
 *    it, the work I want next). The roles are listed once, under Experience.
 *    Phones: the greeting and lead, then the portrait, then the rest.
 * 2. Below a full-width divider, Education (about 40%, a short block: the
 *    school, degree, minor, certificate and dates) beside Experience (about
 *    60%). Each role has one first-person contribution and, where there is
 *    one, a quiet text link to its case study.
 * 3. Creative work, below another divider, in the same 40/60 grid (the
 *    heading left, two equal cards right, brief v18). The same frame, badge
 *    and title: the Creative Portfolio (its Art tile; opens the
 *    original creative homepage at /creative/, a separate build, so a plain
 *    link) and An Artistic End (its authentic poster; plays the film, with
 *    the YouTube player requested only after that press).
 * Email and LinkedIn now live in the site's ending (Footer.tsx), right below.
 *
 * The page is deliberately still: no pointer light and no parallax.
 */
export function AboutContent() {
  const { education: edu } = ABOUT

  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__head">
          <h1 className="about-heading">{ABOUT.greeting}</h1>
          <p className="about-intro__lead">
            {ABOUT.lead} <span className="about-intro__detail">{ABOUT.leadDetail}</span>
          </p>
        </div>
        <div className="about-intro__portrait about-photo">
          <ResponsiveImage image="headshot" sizes={PORTRAIT_SIZES} alt={ABOUT.portraitLabel} priority />
        </div>
        <div className="about-intro__bio">
          {ABOUT.bio.map((p) => (
            <p key={p} className="about-intro__para">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="about-rest" data-cover-reveal="">
        <div className="about-record">
          <section className="about-education" aria-labelledby="about-education-title">
            <h2 id="about-education-title" className="about-subheading">
              {ABOUT.educationTitle}
            </h2>
            <div className="about-school">
              <p className="about-school__name">{edu.school}</p>
              <ul className="about-school__credentials" role="list">
                {edu.credentials.map((c) => (
                  <li key={c}>{c}</li>
                ))}
                <li>
                  {edu.certificate}
                  <span className="visually-hidden">, </span>
                  <span className="about-school__source">{edu.certificateSource}</span>
                </li>
              </ul>
              <p className="about-school__dates tabular">
                {edu.dates}
                <span aria-hidden="true"> · </span>
                <span className="visually-hidden">, </span>
                {edu.pace}
              </p>
            </div>
          </section>

          <section className="about-experience" aria-labelledby="about-experience-title">
            <h2 id="about-experience-title" className="about-subheading">
              {ABOUT.experienceTitle}
            </h2>
            <ol className="about-roles" role="list">
              {ABOUT.experience.map((r) => {
                const project = 'project' in r && r.project ? projectById(r.project) : null
                const path = project ? projectPath(project) : null
                return (
                  <li key={r.org} className="about-role">
                    <h3 className="about-role__org">{r.org}</h3>
                    <p className="about-role__dates tabular">{r.dates}</p>
                    <p className="about-role__title">{r.role}</p>
                    <p className="about-role__text">{r.contribution}</p>
                    {project && path && (
                      <p className="about-role__more">
                        <Link to={path} className="about-role__link" style={accentVars(project.accent)} {...prefetch(path)}>
                          {ABOUT.caseLink(project.name)}
                          <span className="about-role__arrow" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </p>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <section className="about-creative" aria-labelledby="about-creative-title">
          <h2 id="about-creative-title" className="about-subheading about-creative__title">
            {ABOUT.creativeTitle}
          </h2>
          <div className="about-creative__grid">
            <div className="about-work about-work--portfolio">
              <div className="about-work__frame">
                {/* A separate static build outside the router: a plain link and a full page load. */}
                <a href={ABOUT.portfolio.href} className="about-work__hit" aria-label={`${ABOUT.portfolio.action}, ${ABOUT.portfolio.title}`}>
                  <ArtPreview />
                  <span className="about-work__badge" aria-hidden="true">
                    {ABOUT.portfolio.action}
                    <span className="about-work__arrow">↗</span>
                  </span>
                </a>
              </div>
              <div className="about-work__foot">
                <h3 className="about-work__title">{ABOUT.portfolio.title}</h3>
                <p className="about-work__line">{ABOUT.portfolio.line}</p>
              </div>
            </div>
            <FeaturedFilm />
          </div>
        </section>
      </div>
    </div>
  )
}

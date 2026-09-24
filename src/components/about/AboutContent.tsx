import '../../styles/pages/about.css'
import { Link } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { ABOUT } from '../../content/pages/about'
import { projectById, projectPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { prefetchRoute } from '../../routes'
import { CoverSlot } from '../transition/CoverSlot'
import { ArtPreview } from './ArtPreview'
import { FeaturedFilm } from './FeaturedFilm'

const prefetch = (path: string) => ({
  onPointerEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
})

/**
 * Scale of the About object's carousel size (OBJECT_SIZE.headshot) for the
 * portrait: about 340px wide at desktop. CSS narrows the slot on smaller
 * screens (about.css), keeping its aspect ratio.
 */
const PORTRAIT_SCALE = 1.45
const PORTRAIT_SIZES = '(min-width: 720px) 340px, 232px'

/**
 * The /about page, reached from the carousel's About Me object and the
 * header's About link. One 40/60 grid on wide screens, stacked in reading
 * order on narrow ones:
 *
 * 1. Opening. The same headshot PNG as the carousel object, in its
 *    CoverSlot (the route transition moves the carousel image into it),
 *    beside the greeting (the page H1) and the two opening paragraphs.
 * 2. Education (about 40%) beside Experience (about 60%). Each role has one
 *    contribution sentence and, where there is one, a quiet text link to
 *    its case study.
 * 3. Creative work. A compact preview that opens the original creative
 *    homepage (/creative/, a separate build, so a plain link), and An
 *    Artistic End with its poster and a play button (the YouTube player is
 *    requested only after that click).
 * 4. Email and LinkedIn as quiet links, with no heading.
 *
 * The opening text and everything below it carry `data-cover-reveal`: the
 * route transition keeps them hidden while the portrait travels into place,
 * then fades them in. Direct loads show everything at once.
 */
export function AboutContent() {
  const { education: edu } = ABOUT
  return (
    <div className="about-content">
      <div className="about-intro">
        <div className="about-intro__portrait" role="img" aria-label={ABOUT.portraitLabel}>
          <CoverSlot id="about" scale={PORTRAIT_SCALE} sizes={PORTRAIT_SIZES} className="about-portrait" />
        </div>
        <div className="about-intro__text" data-cover-reveal="">
          <h1 className="about-heading">{ABOUT.greeting}</h1>
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
            <p className="about-school__text">{edu.text}</p>
            <div className="about-coursework">
              <h3 className="about-label" id="about-coursework-title">
                {edu.courseworkTitle}
              </h3>
              <ul className="about-coursework__list" role="list" aria-labelledby="about-coursework-title">
                {edu.coursework.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
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
            <div className="about-portfolio">
              {/* A separate static build outside the router: a plain link and a full page load. */}
              <a href={ABOUT.portfolio.href} className="about-portfolio__link" aria-describedby="about-portfolio-text">
                <ArtPreview />
                <span className="about-portfolio__cta">
                  {ABOUT.portfolio.cta}
                  <span className="about-portfolio__arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </a>
              <p id="about-portfolio-text" className="about-portfolio__text">
                {ABOUT.portfolio.text}
              </p>
            </div>
            <FeaturedFilm />
          </div>
        </section>

        <ul className="about-links" role="list" aria-label={ABOUT.links.label}>
          <li>
            <a href={SITE.emailHref} className="about-links__link">
              {SITE.email}
            </a>
          </li>
          <li>
            <a href={SITE.linkedin} className="about-links__link" target="_blank" rel="noopener noreferrer">
              {ABOUT.links.linkedin}
              <span className="about-links__arrow" aria-hidden="true">
                ↗
              </span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

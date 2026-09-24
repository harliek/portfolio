import '../../styles/pages/about.css'
import { Link } from 'react-router-dom'
import { accentVars } from '../../content/accents'
import { ABOUT } from '../../content/pages/about'
import { projectById, projectPath } from '../../content/projects'
import { SITE } from '../../content/site'
import { prefetchRoute } from '../../routes'
import { CoverSlot } from '../transition/CoverSlot'
import { AboutLight } from './AboutLight'
import { ArtPreview } from './ArtPreview'
import { FeaturedFilm } from './FeaturedFilm'

const prefetch = (path: string) => ({
  onPointerEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
})

/**
 * Scale of the About object's carousel size (OBJECT_SIZE.headshot) for the
 * portrait's slot: an upper bound (about 350px); the portrait's frame sets
 * the rendered width (about.css --portrait-w: up to 300px from 960px, up to
 * 260px from 720px, up to 240px below), keeping the artwork's proportions.
 * Keep PORTRAIT_SIZES in step with those widths and with
 * TRANSITION.slotSizes['/about'] (the file the transition warms).
 */
const PORTRAIT_SCALE = 1.45
const PORTRAIT_SIZES = '(min-width: 960px) 300px, (min-width: 720px) 260px, 240px'

/**
 * The /about page, reached from the carousel's About Me object and the
 * header's About link. One 40/60 grid on wide screens, stacked in reading
 * order on narrow ones:
 *
 * 1. Opening. The same headshot PNG as the carousel object, in its
 *    CoverSlot (the route transition moves the carousel image into it),
 *    cropped by a quiet frame that lines up with the greeting (the page
 *    H1), a lead paragraph and a second one.
 * 2. Below a full-width divider, Education (about 40%) beside Experience
 *    (about 60%). Education keeps the verified degree, minor, certificate,
 *    school and dates and two short paragraphs (no separate coursework
 *    list). Each role has one first-person contribution and, where there is
 *    one, a quiet text link to its case study.
 * 3. Creative work, below another divider. Two equal cards with the same
 *    frame, badge and title: the Creative Portfolio (its Art tile; opens the
 *    original creative homepage at /creative/, a separate build, so a plain
 *    link) and An Artistic End (its authentic poster; plays the film, with
 *    the YouTube player requested only after that press).
 * 4. Email and LinkedIn as quiet links, with no heading.
 *
 * Behind it all, AboutLight: a slow, soft pool of lavender light that
 * follows the mouse (off for reduced motion and touch).
 *
 * When the page opens from the carousel, the portrait travels into its slot
 * while the page arrives around it (projectTransition.ts). The
 * `data-cover-reveal` markers are not styled today; they mark the text that
 * arrives after the portrait. Direct loads show everything at once.
 */
export function AboutContent() {
  const { education: edu } = ABOUT
  return (
    <div className="about-content">
      <AboutLight />
      <div className="about-intro">
        <div className="about-intro__portrait" role="img" aria-label={ABOUT.portraitLabel}>
          <CoverSlot id="about" scale={PORTRAIT_SCALE} sizes={PORTRAIT_SIZES} className="about-portrait" />
        </div>
        <div className="about-intro__text" data-cover-reveal="">
          <h1 className="about-heading">{ABOUT.greeting}</h1>
          {ABOUT.bio.map((p, i) => (
            <p key={p} className={i === 0 ? 'about-intro__para about-intro__lead' : 'about-intro__para'}>
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
            <div className="about-school__text">
              {edu.text.map((p) => (
                <p key={p}>{p}</p>
              ))}
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
              </div>
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

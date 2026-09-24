import '../styles/pages/about.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilmPlayer } from '../components/creative/FilmPlayer'
import { ArtComposition } from '../components/pages/about/ArtComposition'
import { ResponsiveImage } from '../components/media/ResponsiveImage'
import { ABOUT } from '../content/pages/about'
import { FEATURED_FILM_ID, filmById, publishedLabel } from '../content/creative'
import { projectById, projectPath } from '../content/projects'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { prefetchRoute } from '../routes'

const FILM = filmById(FEATURED_FILM_ID)

const prefetch = (path: string) => ({
  onPointerEnter: () => prefetchRoute(path),
  onFocus: () => prefetchRoute(path),
})

/**
 * About: an ordinary scrolling page.
 *
 * 1. Portrait left (280px) and the biography right (≤600px), with Download
 *    resume and Contact directly below it.
 * 2. A compact Experience list (exact organizations, titles and dates from
 *    the résumé) and Education.
 * 3. My art portfolio: one substantial link to /art beside a small
 *    composition of actual drawings.
 * 4. The featured short film, An Artistic End (click-to-load player in a
 *    stable 16:9 frame, a subtle pool of light beneath it). Only the verified
 *    publication date is shown; the role from the old portfolio is not.
 * 5. The page ends with the site footer's Contact section (email, LinkedIn
 *    and the résumé), which follows directly, so there is no second contact
 *    row here. The Contact button above opens an email.
 */
export default function About() {
  usePageMeta('About', 'About Harlie Katz, with experience, education, an art portfolio and a short film.')
  const [playing, setPlaying] = useState(false)

  return (
    <article className="page-about">
      <header className="shell about-intro">
        <div className="about-intro__portrait">
          <ResponsiveImage image="headshot" sizes="(min-width: 800px) 280px, 220px" priority />
        </div>
        <div className="about-intro__bio reading-scrim">
          <h1 className="about-intro__name" tabIndex={-1}>
            {SITE.name}
          </h1>
          <p className="about-intro__hello">{ABOUT.hello}</p>
          {ABOUT.bio.map((p) => (
            <p key={p.slice(0, 24)} className="about-intro__para">
              {p}
            </p>
          ))}
          <p className="about-actions">
            <a href={SITE.resume} download={SITE.resumeDownloadName} className="button about-actions__primary">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download resume
            </a>
            <a href={SITE.emailHref} className="button about-actions__secondary">
              Contact
            </a>
          </p>
        </div>
      </header>

      <div className="shell about-record">
        <section className="about-record__block" aria-labelledby="about-experience-title">
          <h2 id="about-experience-title" className="about-heading reading-scrim">
            Experience
          </h2>
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
                    <span className="about-role__link">
                      <Link to={path} {...prefetch(path)}>
                        <span className="visually-hidden">Case study, </span>
                        <span className="about-role__name">{project.name}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <section className="about-record__block" aria-labelledby="about-education-title">
          <h2 id="about-education-title" className="about-heading reading-scrim">
            Education
          </h2>
          <ul className="about-roles" role="list">
            <li className="about-role">
              <span className="about-role__org">{ABOUT.education.school}</span>
              <span className="about-role__title">{ABOUT.education.degree}</span>
              <span className="about-role__dates tabular">{ABOUT.education.dates}</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="shell about-art" aria-labelledby="about-art-title">
        <div className="about-art__card">
          <div className="about-art__text">
            <h2 id="about-art-title" className="about-art__title">
              <Link to="/art" className="about-art__link" {...prefetch('/art')}>
                {ABOUT.art.title}
              </Link>
            </h2>
            <p className="about-art__lead">{ABOUT.art.text}</p>
            <p className="about-art__cta" aria-hidden="true">
              <span className="about-art__cta-text">{ABOUT.art.cta}</span>
              <span className="about-art__arrow">→</span>
            </p>
          </div>
          <ArtComposition drawings={ABOUT.art.drawings} />
        </div>
      </section>

      <section className="shell about-film" aria-labelledby="about-film-title">
        <div className="about-film__text reading-scrim">
          <p className="about-film__eyebrow">{ABOUT.film.eyebrow}</p>
          <h2 id="about-film-title" className="about-heading about-film__title">
            {FILM.title}
          </h2>
          <p className="about-film__note">{FILM.note}</p>
          <p className="about-film__meta tabular">{publishedLabel(FILM)}</p>
          <Link to="/film" className="about-link" {...prefetch('/film')}>
            <span className="about-link__text">{ABOUT.film.more}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="about-film__media">
          <FilmPlayer
            film={FILM}
            sizes="(min-width: 1100px) 560px, (min-width: 800px) 55vw, calc(100vw - 40px)"
            playing={playing}
            onPlay={() => setPlaying(true)}
            label="Watch film"
          />
        </div>
      </section>
    </article>
  )
}

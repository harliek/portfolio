import '../styles/pages/about.css'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Figure } from '../components/media/Figure'
import { ResponsiveImage } from '../components/media/ResponsiveImage'
import { ContactBlock } from '../components/work/ContactBlock'
import { projectById, projectPath, type ProjectId } from '../content/projects'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { useReveal } from '../hooks/useReveal'
import { prefetchRoute } from '../routes'

interface ExperienceRow {
  org: string
  role: string
  dates: string
  /** Case study for this role; omitted where there is none. */
  project?: ProjectId
}

const EXPERIENCE: ExperienceRow[] = [
  { org: 'PlanetArt', role: 'Product Operations & Merchandising Intern', dates: 'Jun–Aug 2026', project: 'planetart' },
  { org: 'Shift Content', role: 'Creative Strategy & Client Solutions Intern', dates: 'Jan–May 2026', project: 'shift' },
  { org: 'Artesian Network', role: 'Enterprise AI Research Associate', dates: 'Jun 2025–Jan 2026' },
  { org: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'Oct 2024–Jun 2025', project: 'valiance' },
  { org: 'Jumpstart Finance', role: 'Founder & Product Lead', dates: 'Jun–Jul 2024', project: 'jumpstart' },
]

const PORTRAIT_SIZES = '(min-width: 1248px) 210px, (min-width: 900px) 17vw, (min-width: 600px) 25vw, calc(50vw - 28px)'
const LANDSCAPE_SIZES = '(min-width: 1248px) 320px, (min-width: 900px) 26vw, (min-width: 600px) 38vw, calc(100vw - 40px)'

function ExperienceContent({ row, linked }: { row: ExperienceRow; linked: boolean }) {
  return (
    <>
      <span className="about-exp__org">{row.org}</span>
      <span className="about-exp__role">{row.role}</span>
      <span className="about-exp__dates tabular">{row.dates}</span>
      <span className="about-exp__arrow" aria-hidden="true">
        {linked ? '↗' : ''}
      </span>
    </>
  )
}

export default function About() {
  usePageMeta('About', 'About Harlie Katz: Cognitive Science at UC Berkeley, selected experience, drawings, and contact.')
  const rootRef = useRef<HTMLElement>(null)
  useReveal(rootRef)

  return (
    <article ref={rootRef} className="page-about">
      <header className="shell about-intro">
        <h1 className="about-intro__title t-display" tabIndex={-1}>
          About
        </h1>
        <div className="about-intro__portrait">
          <ResponsiveImage image="headshot" sizes="(min-width: 900px) 360px, 260px" priority />
        </div>
        <div className="about-intro__copy">
          <p>
            I’m Harlie Katz. I studied Cognitive Science at UC Berkeley, with a minor in Data Science and a Certificate in
            Entrepreneurship &amp; Technology.
          </p>
          <p>
            My work has included merchandising research and prototypes, AI leasing requirements, a financial-learning
            venture, enterprise AI research, and creative production. Across these projects, I have worked close to the
            people, information, and decisions a product needs to support.
          </p>
          <p>I’m interested in early-career roles in AI product, implementation, product strategy, and operations.</p>
        </div>
        <ul className="about-intro__links">
          <li>
            <a className="button" href={SITE.resume} download={SITE.resumeDownloadName}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path
                  d="M8 2.5v7.5M4.75 6.75 8 10l3.25-3.25M3 13.5h10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download resume
            </a>
          </li>
          <li>
            <a className="button button--quiet" href={SITE.emailHref}>
              Email
            </a>
          </li>
          <li>
            <a className="button button--quiet" href={SITE.linkedin}>
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </header>

      <div className="shell about-body">
        <section className="about-section" aria-labelledby="about-education" data-reveal="">
          <div className="about-section__head">
            <h2 id="about-education" className="t-section">
              Education
            </h2>
          </div>
          <div className="about-section__content about-edu">
            <h3 className="about-edu__school t-sub">University of California, Berkeley</h3>
            <p className="about-edu__degree">B.A. Cognitive Science · Minor in Data Science</p>
            <p className="about-edu__dates tabular">Aug 2023–May 2026</p>
            <p className="about-edu__note">Completed in three years.</p>
            <p className="about-edu__cert">Certificate in Entrepreneurship &amp; Technology, Sutardja Center</p>
          </div>
        </section>

        <section className="about-section" aria-labelledby="about-experience" data-reveal="">
          <div className="about-section__head">
            <h2 id="about-experience" className="t-section">
              Selected experience
            </h2>
          </div>
          <ul className="about-section__content about-exp">
            {EXPERIENCE.map((row) => {
              if (!row.project) {
                return (
                  <li key={row.org}>
                    <div className="about-exp__row">
                      <ExperienceContent row={row} linked={false} />
                    </div>
                  </li>
                )
              }
              const path = projectPath(projectById(row.project))
              return (
                <li key={row.org}>
                  <Link
                    to={path}
                    className="about-exp__row about-exp__row--link"
                    onPointerEnter={() => prefetchRoute(path)}
                    onFocus={() => prefetchRoute(path)}
                  >
                    <ExperienceContent row={row} linked />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="about-section" aria-labelledby="about-drawings" data-reveal="">
          <div className="about-section__head">
            <h2 id="about-drawings" className="t-section">
              Selected drawings
            </h2>
            <p className="about-section__intro">A small selection of personal drawing work.</p>
          </div>
          <div className="about-section__content about-drawings">
            <Figure image="drawing-oldwoman" sizes={PORTRAIT_SIZES} zoom showProvenance={false} className="about-drawings__item" />
            <Figure image="drawing-oldman" sizes={PORTRAIT_SIZES} zoom showProvenance={false} className="about-drawings__item" />
            <Figure
              image="drawing-hands"
              sizes={LANDSCAPE_SIZES}
              zoom
              showProvenance={false}
              className="about-drawings__item about-drawings__item--wide"
            />
          </div>
        </section>

        <ContactBlock intro="For opportunities in AI product, implementation, strategy, or operations:" reveal />
      </div>
    </article>
  )
}

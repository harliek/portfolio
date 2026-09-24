import '../../styles/pages/client-work.css'
import { CaseFacts, CaseLayout, CaseSection } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { FilmTabs } from '../../components/pages/client-work/FilmTabs'
import { CLIENT_WORK as C } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'

const project = projectById('client-work')

/**
 * Client Work (route /work/shift). Not a research narrative. An introduction
 * with the verified role and dates, the three client films as tabs over one
 * stable player (Nickleby Capital Video 1 by default), and a short section
 * on other agency work. Desktop columns match the film row below (60 / 36).
 */
export default function ClientWork() {
  return (
    <CaseLayout project={project} className="page-client-work">
      <header className="case-shell cw-intro">
        <div className="cw-intro__text reading-scrim">
          <h1 className="case-title" tabIndex={-1}>
            {project.name}
          </h1>
          <p className="case-subtitle">{project.label}</p>
          <p className="cw-intro__lead">{C.intro}</p>
        </div>
        <div className="cw-intro__facts reading-scrim">
          <CaseFacts
            facts={[
              { label: 'Role', value: project.role },
              { label: 'Timeframe', value: project.dateRange },
              { label: 'Agency', value: project.org },
            ]}
          />
          <p className="cw-intro__note">{C.note}</p>
        </div>
      </header>

      <section className="case-shell cw-section" aria-labelledby="cw-films-title">
        <h2 id="cw-films-title" className="visually-hidden">
          Client films
        </h2>
        <FilmTabs films={C.films} />
      </section>

      <CaseSection
        id="other-work"
        title="Other agency work"
        className="cw-other"
        aside={
          <ul className="cw-other__list reading-scrim" role="list">
            {C.otherWork.items.map((item) => (
              <li key={item.title} className="cw-other__item">
                <p className="cw-other__title">{item.title}</p>
                <p className="cw-other__text">{item.text}</p>
              </li>
            ))}
          </ul>
        }
      >
        <p>{C.otherWork.intro}</p>
      </CaseSection>

      <NextProject current={project.id} />
    </CaseLayout>
  )
}

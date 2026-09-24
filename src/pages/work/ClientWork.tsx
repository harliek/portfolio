import '../../styles/pages/client-work.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { FilmScroll } from '../../components/pages/client-work/FilmScroll'
import { CLIENT_WORK as C } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'

const project = projectById('client-work')

/**
 * Client Work (route /work/shift). Agency films, not a research narrative:
 * the opening with the verified role and dates, a jump-navigation row, one
 * section per client film beside a stable player (FilmScroll), then a compact
 * list of other documented agency work and the next project.
 */
export default function ClientWork() {
  return (
    <CaseLayout project={project} className="page-client-work">
      <FilmScroll project={project} situation={C.situation} note={C.note} films={C.films} />
      <Results title="Other agency work">
        {C.otherWork.intro}
        <ul className="cw-other">
          {C.otherWork.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

import '../../styles/pages/client-work.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { FilmScroll } from '../../components/pages/client-work/FilmScroll'
import { CLIENT_WORK as C } from '../../content/pages/client-work'
import { projectById } from '../../content/projects'

const project = projectById('client-work')

/**
 * Creative Production (route /work/creative-production; /work/shift
 * redirects here). The case-study opening with the camera cover and small
 * anchor links, then three stacked project sections, each with its own
 * description and film (FilmScroll), then the next project.
 */
export default function ClientWork() {
  return (
    <CaseLayout project={project} className="page-client-work">
      <FilmScroll project={project} meta={C.meta} summary={C.summary} status={C.status} films={C.films} />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

import '../../styles/pages/spreadsheet-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { SPREADSHEET_AGENT as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent: the real recording (request, build plan, saved sheet)
 * autoplays beside the story (CaseScroll video media). Its first play starts
 * at 16.5s (the manifest's startAt), so the build plan, the page's key
 * decision, appears within about 3s; the loop then restarts from 0. Its poster
 * (the manifest default), shown when autoplay is refused or motion is
 * reduced, is the build plan under review (21s).
 */
export default function SpreadsheetAgent() {
  return (
    <CaseLayout project={project} className="page-spreadsheet-agent">
      <CaseScroll
        project={project}
        meta={C.meta}
        summary={C.summary}
        media={{ kind: 'video', video: 'spreadsheet-agent' }}
        sections={C.sections}
        outcome={C.outcome}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

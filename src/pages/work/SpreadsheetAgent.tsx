import '../../styles/pages/spreadsheet-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { SPREADSHEET_AGENT as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent: the real recording (request, build plan, saved sheet)
 * autoplays beside the story (CaseScroll video media). Its poster, shown when
 * autoplay is refused or motion is reduced, is the saved sheet beside the
 * request and the assistant's reply (25.3s, `sheet-returned`), which is more
 * representative than the recording's first frame (the All Sheets list).
 */
export default function SpreadsheetAgent() {
  return (
    <CaseLayout project={project} className="page-spreadsheet-agent">
      <CaseScroll
        project={project}
        meta={C.meta}
        summary={C.summary}
        media={{ kind: 'video', video: 'spreadsheet-agent', poster: 'sheet-returned' }}
        sections={C.sections}
        outcome={C.outcome}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

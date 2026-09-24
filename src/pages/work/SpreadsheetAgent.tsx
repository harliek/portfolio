import '../../styles/pages/spreadsheet-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { PREVIEW_MAP, SPREADSHEET_AGENT as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent: the real recording beside the story. Inline, its edited preview (1.5×, the sheet list and most
 * of the typing cut, readable holds) goes from the request to the build plan (1.8s) to the filled sheet (5.8s);
 * Expand plays the complete recording at original speed from the matching moment. The poster is the build plan.
 */
export default function SpreadsheetAgent() {
  return (
    <CaseLayout project={project} className="page-spreadsheet-agent">
      <CaseScroll
        project={project}
        meta={C.meta}
        status={C.status}
        summary={C.summary}
        media={{
          kind: 'video',
          video: 'spreadsheet-agent',
          preview: { video: 'spreadsheet-agent-preview', label: 'Edited preview · 1.5× speed', map: PREVIEW_MAP },
        }}
        sections={C.sections}
        outcome={C.outcome}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

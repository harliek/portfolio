import '../../styles/pages/spreadsheet-agent.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { SPREADSHEET_AGENT as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const project = projectById('spreadsheet-agent')

/**
 * One 5:3 frame for every state: the walkthrough crops share that ratio
 * (src/content/crops/spreadsheet-agent.ts), and the recording (≈1.98:1)
 * plays contained in the same frame.
 */
const FRAME_RATIO = '5 / 3'

export default function SpreadsheetAgent() {
  // Same breakpoint as CaseScroll's split layout.
  const desktop = useMediaQuery('(min-width: 960px)')
  return (
    <CaseLayout project={project} className="page-spreadsheet-agent">
      <CaseScroll
        project={project}
        situation={C.situation}
        opening={C.opening}
        sections={C.sections(desktop)}
        frameRatio={FRAME_RATIO}
        demo={{ video: 'spreadsheet-agent', label: 'Play spreadsheet demo' }}
      />
      <Results>{C.results}</Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

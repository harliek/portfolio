import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent (brief v19): the introduction and four steps on the
 * left (request, plan, sheet, source detail); the whole interface fixed on
 * the right, changing to each step's state as it becomes the current one.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <CaseStory title={C.title} meta={C.meta} lede={C.lede} status={C.status} steps={C.steps} stage={{ kind: 'images', images: C.images }} note={C.note} />
    </CasePage>
  )
}

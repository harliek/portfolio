import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent (brief v21): the introduction and four steps on the
 * left (request, plan, sheet, source detail); a real recording of the live
 * prototype in the laptop on the right, its time following the scroll
 * through each step's segment.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <CaseStory project={project} title={C.title} meta={C.meta} lede={C.lede} steps={C.steps} stage={{
          kind: 'video',
          src: '/media/video/sa-demo-scrub-1440.mp4',
          poster: '/media/img/sa-demo-poster-1440.jpg',
          width: 1440,
          height: 900,
          segments: C.segments,
          stills: C.stills,
          label: 'The Spreadsheet Agent prototype building a sheet from a written request',
        }} />
    </CasePage>
  )
}

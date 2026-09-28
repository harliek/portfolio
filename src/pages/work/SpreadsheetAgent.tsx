import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent (brief v21): the introduction and two steps on the
 * left (the plan reviewed and the sheet built; a cell's source detail); a
 * real recording of the live prototype in the frame on the right, playing
 * by itself on a loop (Harlie's request).
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <CaseStory title={C.title} meta={C.meta} lede={C.lede} steps={C.steps} stage={{
          kind: 'video',
          src: '/media/video/sa-demo-1440.mp4',
          poster: '/media/img/sa-demo-poster-1440.jpg',
          width: 1440,
          height: 900,
          segments: C.segments,
          stills: C.stills,
          label: 'The Spreadsheet Agent prototype building a sheet from a written request',
          free: true,
          // A little faster than recorded (Harlie's request).
          rate: 1.5,
          // Harlie's brief, 2026-09-28: the recording is polished enough to be taken for a shipped product.
          status: 'Prototype',
        }} />
    </CasePage>
  )
}

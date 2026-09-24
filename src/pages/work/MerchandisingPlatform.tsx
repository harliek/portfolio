import '../../styles/pages/merchandising-platform.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { MERCHANDISING_PLATFORM as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * 5:3, like Spreadsheet Agent: whole screens without the navigation column
 * and the drawer details share it. The recording (about 2:1) plays contained
 * in the same frame.
 */
const FRAME_RATIO = '5 / 3'

export default function MerchandisingPlatform() {
  return (
    <CaseLayout project={project} className="page-merchandising-platform">
      <CaseScroll
        project={project}
        note={C.note}
        situation={C.situation}
        opening={C.opening}
        sections={C.sections}
        frameRatio={FRAME_RATIO}
        demo={{ video: 'merch-console', label: 'Play dashboard demo' }}
      />
      <Results>{C.results}</Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

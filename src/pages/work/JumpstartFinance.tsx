import '../../styles/pages/jumpstart-finance.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { BusinessModel } from '../../components/pages/jumpstart-finance/BusinessModel'
import { JUMPSTART_FINANCE as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Every frame is one of the four original prototype screens, cropped to the
 * same 600×1210 canvas (src/content/crops/jumpstart-finance.ts), so the phone
 * keeps one size while the screens change.
 */
const FRAME_RATIO = '600 / 1210'
/** Keep in step with projects.ts `hero.sizes` for the opening screen (jf-screen-home). */
const SIZES = '(min-width: 960px) 360px, 300px'

/**
 * Jumpstart Finance (route /work/jumpstart): opening → Product premise →
 * Design decisions (lessons, progression, community) → Results with the pitch
 * excerpt → the proposed business model as optional supplementary material →
 * next project. Green is the local accent.
 */
export default function JumpstartFinance() {
  return (
    <CaseLayout project={project} className="page-jumpstart-finance">
      <CaseScroll project={project} situation={C.situation} opening={C.opening} sections={C.sections} frameRatio={FRAME_RATIO} sizes={SIZES} />
      <Results figure={C.resultsFigure}>{C.results}</Results>
      <BusinessModel {...C.businessModel} />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

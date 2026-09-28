import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { JUMPSTART as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Jumpstart Finance (brief v19): the introduction and the three features on
 * the left; the three original prototype screens fixed on the right, as on
 * the homepage tile (no ground behind them). As each feature becomes the
 * current one, its screen comes forward while the other two stay in view.
 */
export default function JumpstartFinance() {
  return (
    <CasePage project={project} className="page-jumpstart-finance">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.features}
        // "Concept UI" (Harlie's brief, 2026-09-28): the phones are restyled redraws of the 2024 prototype, with
        // details of their own (the XP, lesson counts and level names), not screenshots of a built app.
        stage={{ kind: 'phones', phones: C.phones, all: 'jf-phones-all', status: 'Concept UI' }}
      />
    </CasePage>
  )
}

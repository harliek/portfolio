import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { JUMPSTART as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/**
 * Jumpstart Finance (brief v19): the introduction and four sections on the
 * right (user problem, product direction, experience design, validation;
 * Harlie's text of 2026-09-30); the three original prototype screens fixed
 * on the left, as on the homepage tile (no ground behind them). As each
 * section becomes the current one, its screen comes forward while the other
 * two stay in view (Home for the first two sections, then Community, then
 * Profile; content/pages/jumpstart-finance.tsx). The sides are swapped
 * because the project's order is odd (caseSide.ts; Harlie's request,
 * 2026-09-30: every other told page has its words on the right).
 */
export default function JumpstartFinance() {
  return (
    <CasePage project={project} className="page-jumpstart-finance">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.features}
        stage={{ kind: 'phones', phones: C.phones, all: 'jf-phones-all' }}
      />
    </CasePage>
  )
}

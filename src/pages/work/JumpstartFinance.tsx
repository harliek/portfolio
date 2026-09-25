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
        project={project}
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.features}
        stage={{ kind: 'phones', phones: C.phones }}
        result={C.result}
      />
    </CasePage>
  )
}

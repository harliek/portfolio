import '../../styles/pages/spreadsheet-agent.css'
import type { CSSProperties } from 'react'
import { CaseLayout, CaseOpening, CaseSection } from '../../components/case/CaseLayout'
import { NextProject } from '../../components/case/NextProject'
import { Results } from '../../components/case/Results'
import { StickyVisual, type Highlight, type VisualStep } from '../../components/case/StickyVisual'
import { SheetHero } from '../../components/pages/spreadsheet-agent/SheetHero'
import { getImage } from '../../content/media'
import { SPREADSHEET_AGENT as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

const pct = (n: number) => `${Math.round(n * 1000) / 1000}%`

/**
 * The stills are 2940px interfaces. On desktop the sticky frame is about
 * 690px wide; in the stacked layout each crop enlarges its region about
 * 3.6×, so it always asks for the largest file.
 */
const FRAME_SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, 1600px'

/**
 * CSS variables for the stacked (below 960px) layout: each step's frame
 * shows a crop around its highlight, and the highlight is re-expressed in
 * the crop's coordinates. Derived from the step data, so the highlight
 * values live in one place (src/content/pages/spreadsheet-agent.tsx).
 */
function cropVars(steps: VisualStep[], crops: Record<string, Highlight>): CSSProperties {
  const vars: Record<string, string> = {}
  steps.forEach((step, i) => {
    const c = crops[step.id]
    if (!c) return
    const { width, height, widths } = getImage(step.image)
    const n = i + 1
    vars[`--sa-${n}-ratio`] = String((c.w * width) / (c.h * height))
    // Never show a crop wider than the largest file provides (no upscaling).
    vars[`--sa-${n}-max-w`] = `${Math.round((Math.max(...widths) * c.w) / 100)}px`
    vars[`--sa-${n}-img-w`] = pct((100 * 100) / c.w)
    vars[`--sa-${n}-img-x`] = pct((-100 * c.x) / c.w)
    vars[`--sa-${n}-img-y`] = pct((-100 * c.y) / c.h)
    if (step.highlight) {
      const h = step.highlight
      vars[`--sa-${n}-hl-x`] = pct((100 * (h.x - c.x)) / c.w)
      vars[`--sa-${n}-hl-y`] = pct((100 * (h.y - c.y)) / c.h)
      vars[`--sa-${n}-hl-w`] = pct((100 * h.w) / c.w)
      vars[`--sa-${n}-hl-h`] = pct((100 * h.h) / c.h)
    }
  })
  return vars as CSSProperties
}

const APPROACH_VARS = cropVars(C.steps, C.mobileCrops)

export default function SpreadsheetAgent() {
  return (
    <CaseLayout project={project} className="page-spreadsheet-agent">
      <CaseOpening
        project={project}
        subtitle={C.subtitle}
        description={C.description}
        note={C.note}
        summary={C.summary}
        hero={<SheetHero caption={C.heroCaption} />}
      />
      <CaseSection id="context" title="Context and role">
        {C.context}
      </CaseSection>
      <CaseSection id="problem" title="Problem">
        {C.problem}
      </CaseSection>
      <CaseSection id="approach" title="Approach" wide>
        <div className="sa-approach" style={APPROACH_VARS}>
          <StickyVisual steps={C.steps} ratio="2940 / 1486" sizes={FRAME_SIZES} demo={{ video: 'spreadsheet-agent' }} />
        </div>
      </CaseSection>
      <Results figure={{ image: 'sheet-list', caption: C.resultsFigureCaption }}>{C.results}</Results>
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

import { CasePage } from '../../components/case/CasePage'
import { CaseSection, CaseSplit } from '../../components/case/CaseSplit'
import { ChapterDemo, type Chapter } from '../../components/case/ChapterDemo'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

const chapters: Chapter[] = C.stages.map((s) => ({
  label: s.label,
  caption: s.caption,
  visual: (
    <div className="cx-frame">
      <ResponsiveImage image={s.image} sizes="(min-width: 1408px) 640px, (min-width: 900px) 48vw, calc(100vw - 48px)" />
    </div>
  ),
}))

/**
 * Spreadsheet Agent (brief v18): the introduction and its scope beside the
 * walkthrough (request, plan, sheet, source detail; it starts when it comes
 * into view and holds each screenshot long enough to read), then three
 * short decisions.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <CaseSplit
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        status={C.status}
        heroInside
        media={
          <ChapterDemo
            hero
            label="The Spreadsheet Agent prototype, from request to source detail"
            chapters={chapters}
            hold={4.5}
            head={
              <blockquote className="sa-request">
                <p>“{C.request}”</p>
              </blockquote>
            }
          />
        }
      >
        {C.decisions.map((d) => (
          <CaseSection key={d.title} title={d.title}>
            {d.text}
          </CaseSection>
        ))}
      </CaseSplit>
    </CasePage>
  )
}

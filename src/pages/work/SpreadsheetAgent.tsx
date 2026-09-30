import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { SHEET as C } from '../../content/pages/spreadsheet-agent'
import { projectById } from '../../content/projects'

const project = projectById('spreadsheet-agent')

/**
 * Spreadsheet Agent (brief v21): the introduction and four sections on the
 * left (Harlie's text of 2026-09-30); a real recording of the live
 * prototype in the frame on the right, playing by itself on a loop
 * (Harlie's request), one still per section under reduced motion.
 */
export default function SpreadsheetAgent() {
  return (
    <CasePage project={project} className="page-spreadsheet-agent">
      <CaseStory title={C.title} meta={C.meta} lede={C.lede} steps={C.steps} stage={{
          kind: 'video',
          src: '/media/video/sa-demo-1440.mp4',
          // WebP made from the JPEG (the same frame, about half the bytes; scripts/prepare-media.mjs, task `posters`,
          // 2026-09-29).
          poster: '/media/img/sa-demo-poster-1440.webp',
          width: 1440,
          height: 900,
          segments: C.segments,
          stills: C.stills,
          label: 'The Spreadsheet Assistant prototype creating a sheet from a written request',
          free: true,
          // A little faster than recorded (Harlie's request).
          rate: 1.5,
          // The control that opens the recording larger (Harlie's copy brief, 2026-09-28).
          action: 'Play spreadsheet demo',
          // The implementation is rules-based (README, docs/limitations.md); the page's meta line says only
          // "Independent project · 2026" (Harlie's request, 2026-09-29).
        }} />
    </CasePage>
  )
}

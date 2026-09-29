import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { MERCH as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * Merchandising Dashboard (brief v19; route /work/merchandising-platform kept): the introduction and three decisions
 * on the left, the recording fixed on the right; while a decision is the
 * current one, the recording plays that decision's segment on a loop (faster
 * while the page scrolls), so the highlighted decision and the product state
 * always agree.
 */
export default function MerchandisingPlatform() {
  return (
    <CasePage project={project} className="page-merchandising-platform">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        steps={C.decisions}
        stage={{
          kind: 'video',
          // The page only ever shows 0 to 21.6s of the 56.3s recording (the segments and stills in C), so it loads the
          // first 26s alone: a stream copy of the whole file's start, the same frames at the same times (the margin keeps
          // the held last segment clear of the file's end). Play dashboard demo opens the whole recording (dialogSrc).
          // The cut is made from the whole file by scripts/prepare-media.mjs (task `video`; 2026-09-29).
          src: '/media/video/merch-console-scrub-page-1280.mp4',
          dialogSrc: '/media/video/merch-console-scrub-1280.mp4',
          // WebP, about half the JPEG's bytes (the poster attribute takes one file, so no AVIF; 2026-09-29).
          poster: '/media/img/merch-console-poster-1600.webp',
          width: 1280,
          height: 646,
          segments: C.segments,
          stills: C.stills,
          label: 'A recording of the Merchandising Dashboard prototype on synthetic data',
          play: true,
          // A little faster than recorded (Harlie's request).
          rate: 1.5,
          // The control that opens the recording larger (Harlie's copy brief, 2026-09-28).
          action: 'Play dashboard demo',
          // No label beside the recording or in the meta line (Harlie's request, 2026-09-29); the recording's own footer
          // says "Synthetic catalog, no backend".
        }}
      />
    </CasePage>
  )
}

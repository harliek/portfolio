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
          src: '/media/video/merch-console-scrub-1280.mp4',
          poster: '/media/img/merch-console-poster-1600.jpg',
          width: 1280,
          height: 646,
          segments: C.segments,
          stills: C.stills,
          label: 'The Merchandising Dashboard prototype in use',
          play: true,
          // A little faster than recorded (Harlie's request).
          rate: 1.5,
          // Harlie's brief, 2026-09-28: polished enough to be taken for a PlanetArt system; it is Harlie's prototype.
          status: 'Prototype',
        }}
      />
    </CasePage>
  )
}

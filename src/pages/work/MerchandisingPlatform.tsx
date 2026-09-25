import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { MERCH as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * Merchandising Platform (brief v19): the introduction and three decisions
 * on the left, the recording fixed on the right; scrolling through each
 * decision moves the recording through its segment (and back when scrolling
 * up), so the highlighted decision and the product state always agree.
 */
export default function MerchandisingPlatform() {
  return (
    <CasePage project={project} className="page-merchandising-platform">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        status={C.status}
        steps={C.decisions}
        stage={{
          kind: 'video',
          src: '/media/video/merch-console-scrub-1280.mp4',
          poster: '/media/img/merch-console-poster-1600.jpg',
          width: 1280,
          height: 646,
          segments: C.segments,
          stills: C.stills,
          label: 'The Merchandising Platform prototype in use',
        }}
        note={C.note}
      />
    </CasePage>
  )
}

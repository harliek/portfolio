import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { PDR as C } from '../../content/pages/pdr-control'
import { projectById } from '../../content/projects'

const project = projectById('pdr-control')

/**
 * PDR Control (2026-11-04; 2026-11-05: the other told cases' format): the introduction and four sections on the left;
 * the recording of the prototype fixed beside them, playing each section's part, one still per section under reduced
 * motion.
 */
export default function PDRControl() {
  return (
    <CasePage project={project} className="page-pdr-control">
      <CaseStory title={C.title} meta={C.meta} lede={C.lede} steps={C.steps} stage={{
          kind: 'video',
          src: '/media/video/pdr-recording-1440.mp4',
          dialogSrc: '/media/video/pdr-recording-1920.mp4',
          poster: '/media/img/pdr-recording-poster-1440.webp',
          width: 1440,
          height: 784,
          segments: C.segments,
          stills: C.stills,
          label: 'A walkthrough of the PDR Control prototype, from choosing the damaged door to verifying the repair with a second scan',
          play: true,
          // The control that opens the recording larger, as on the other recorded cases.
          action: 'Play PDR Control walkthrough',
        }} />
    </CasePage>
  )
}

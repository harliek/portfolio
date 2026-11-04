import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { PDR as C } from '../../content/pages/pdr-control'
import { projectById } from '../../content/projects'

const project = projectById('pdr-control')

/** The recording opened larger, through the stage's own control (CaseStory's VideoDialog: controls and full screen). */
const openWalkthrough = () => document.querySelector<HTMLButtonElement>('.page-pdr-control .story__zoom')?.click()

/**
 * PDR Control (2026-11-04): a told case like the others, with more sections. The walkthrough of the live prototype is
 * held beside the words and plays the part each section describes; the larger view plays the whole recording with
 * controls and full screen. The introduction carries the links to the live prototype and the repository.
 */
export default function PDRControl() {
  return (
    <CasePage project={project} className="page-pdr-control">
      <CaseStory
        title={C.title}
        meta={C.meta}
        lede={
          <>
            <p className="pdr-sub">{C.subtitle}</p>
            <p>{C.lede}</p>
            <p className="pdr-focus">{C.focus}</p>
            <div className="pdr-actions">
              <a className="button" href={C.prototypeUrl} target="_blank" rel="noopener noreferrer">
                Explore Interactive Prototype
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <button type="button" className="button button--quiet" onClick={openWalkthrough}>
                Watch the walkthrough
              </button>
              <a className="button button--quiet" href={C.repoUrl} target="_blank" rel="noopener noreferrer">
                GitHub
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </>
        }
        steps={C.steps}
        stage={{
          kind: 'video',
          src: '/media/video/pdr-walkthrough-1440.mp4',
          // The larger view plays a sharper encode of the same recording, fetched only when it opens.
          dialogSrc: '/media/video/pdr-walkthrough-1920.mp4',
          poster: '/media/img/pdr-poster-1440.webp',
          width: 1440,
          height: 900,
          segments: C.segments,
          stills: C.stills,
          label: 'A walkthrough of the PDR Control prototype, from choosing the damaged door to verifying the repair with a second scan',
          play: true,
          action: 'Play PDR Control walkthrough',
        }}
      />
    </CasePage>
  )
}

import { CasePage } from '../../components/case/CasePage'
import { CaseStory } from '../../components/case/CaseStory'
import { PDR as C } from '../../content/pages/pdr-control'
import { getImage } from '../../content/media'
import type { Stage } from '../../components/case/CaseStory'
import { projectById } from '../../content/projects'

const project = projectById('pdr-control')

/** The recording opened larger, through the stage's own control (CaseStory's VideoDialog: controls and full screen). */
const openWalkthrough = () => document.querySelector<HTMLButtonElement>('.page-pdr-control .story__zoom')?.click()

/**
 * What the stage shows: the walkthrough when there is one (C.walkthrough), else the gallery of the live prototype's
 * views, each section's own picture large (the site's card-hover gallery, as on CafePress UK).
 */
const stage: Stage = C.walkthrough
  ? {
      kind: 'video',
      ...C.walkthrough,
      segments: C.segments,
      stills: C.stills,
      label: 'A walkthrough of the PDR Control prototype, from choosing the damaged door to verifying the repair with a second scan',
      play: true,
      action: 'Play PDR Control walkthrough',
    }
  : {
      kind: 'layers',
      aspect: 1.6,
      screen: '#0e1418',
      layers: C.gallery.map((image) => ({ image, alt: getImage(image).alt })),
      show: C.show,
    }

/**
 * PDR Control (2026-11-04): a told case like the others, with more sections, its stage held beside the words. The
 * introduction carries the link to the repository, and to the live prototype and the walkthrough when there are ones.
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
              {C.prototypeUrl && (
                <a className="button" href={C.prototypeUrl} target="_blank" rel="noopener noreferrer">
                  Explore Interactive Prototype
                  <span aria-hidden="true">↗</span>
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              )}
              {C.walkthrough && (
                <button type="button" className="button button--quiet" onClick={openWalkthrough}>
                  Watch the walkthrough
                </button>
              )}
              <a className="button button--quiet" href={C.repoUrl} target="_blank" rel="noopener noreferrer">
                GitHub
                <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </>
        }
        steps={C.steps}
        stage={stage}
      />
    </CasePage>
  )
}

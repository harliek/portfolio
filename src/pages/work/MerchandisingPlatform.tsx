import { CasePage } from '../../components/case/CasePage'
import { CaseSection, CaseSplit } from '../../components/case/CaseSplit'
import { ChapterDemo } from '../../components/case/ChapterDemo'
import { MERCH as C } from '../../content/pages/merchandising-platform'
import { projectById } from '../../content/projects'

const project = projectById('merchandising-platform')

/**
 * Merchandising Platform (brief v18): the introduction with the recording
 * beside it as a walkthrough in three chapters (it starts when it comes
 * into view; its first frame is the Overview, the homepage tile's view),
 * then the three decisions and one scope line.
 */
export default function MerchandisingPlatform() {
  return (
    <CasePage project={project} className="page-merchandising-platform">
      <CaseSplit
        title={C.title}
        meta={C.meta}
        lede={C.lede}
        status={C.status}
        heroInside
        media={
          <ChapterDemo
            hero
            numbered={false}
            label="The Merchandising Platform prototype in use"
            chapters={C.chapters}
            aspect="1280 / 646"
            video={{ src: '/media/video/merch-console-scrub-1280.mp4', poster: '/media/img/merch-console-poster-1600.jpg', width: 1280, height: 646 }}
          />
        }
      >
        {C.decisions.map((d) => (
          <CaseSection key={d.title} title={d.title}>
            {d.text}
          </CaseSection>
        ))}
        <p className="cs__note">{C.note}</p>
      </CaseSplit>
    </CasePage>
  )
}

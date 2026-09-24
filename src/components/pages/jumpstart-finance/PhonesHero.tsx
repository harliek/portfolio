import { CaseHeroFigure } from '../../case/CaseLayout'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/**
 * Jumpstart opening overview: the only place three phones appear together
 * (lessons, home, profile). The screenshots carry their own device frames,
 * so there is no extra outline; the home screen sits in the centre.
 */
export function PhonesHero({ caption }: { caption: string }) {
  return (
    <CaseHeroFigure caption={caption}>
      <div className="jf-phones">
        <span className="jf-phones__side">
          <ResponsiveImage image="jumpstart-proto-3" sizes="(min-width: 960px) 190px, 26vw" priority />
        </span>
        <span className="jf-phones__main">
          <ResponsiveImage image="jumpstart-proto-1" sizes="(min-width: 960px) 236px, 32vw" priority />
        </span>
        <span className="jf-phones__side">
          <ResponsiveImage image="jumpstart-proto-2" sizes="(min-width: 960px) 190px, 26vw" priority />
        </span>
      </div>
    </CaseHeroFigure>
  )
}

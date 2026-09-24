import { getImage } from '../../../content/media'
import { CaseHeroFigure } from '../../case/CaseLayout'
import { CaptionText } from '../../media/Figure'
import { ResponsiveImage } from '../../media/ResponsiveImage'

const SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

/** Merchandising Platform opening image: the prototype's overview screen (0.3s of the recording, synthetic data). */
export function ConsoleHero({ caption }: { caption: string }) {
  return (
    <CaseHeroFigure caption={<CaptionText provenance={getImage('merch-overview').provenance}>{caption}</CaptionText>}>
      <ResponsiveImage image="merch-overview" sizes={SIZES} priority />
    </CaseHeroFigure>
  )
}

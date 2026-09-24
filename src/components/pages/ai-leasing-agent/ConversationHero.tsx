import { CaseHeroFigure } from '../../case/CaseLayout'
import { CaptionText } from '../../media/Figure'
import { ResponsiveImage } from '../../media/ResponsiveImage'

const SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

/** AI Leasing Agent opening image: the illustrative conversation, labelled as synthetic. */
export function ConversationHero({ caption }: { caption: string }) {
  return (
    <CaseHeroFigure caption={<CaptionText provenance="synthetic-example">{caption}</CaptionText>}>
      <ResponsiveImage image="valiance-messages" sizes={SIZES} priority />
    </CaseHeroFigure>
  )
}

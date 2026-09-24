import { CaseHeroFigure } from '../../case/CaseLayout'
import { ResponsiveImage } from '../../media/ResponsiveImage'

const SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

/** CafePress UK opening image: one clean storefront capture. */
export function StorefrontHero({ caption }: { caption: string }) {
  return (
    <CaseHeroFigure caption={caption}>
      <ResponsiveImage image="planetart-uk" sizes={SIZES} priority />
    </CaseHeroFigure>
  )
}

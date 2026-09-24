import { CaseHeroFigure } from '../../case/CaseLayout'
import { ResponsiveImage } from '../../media/ResponsiveImage'

const SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

/** Spreadsheet Agent opening image: the returned sheet and the assistant panel. */
export function SheetHero({ caption }: { caption: string }) {
  return (
    <CaseHeroFigure caption={caption}>
      <ResponsiveImage image="sheet-returned" sizes={SIZES} priority />
    </CaseHeroFigure>
  )
}

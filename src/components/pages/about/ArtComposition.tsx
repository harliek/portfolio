import type { CSSProperties } from 'react'
import { getImage, type ImageId } from '../../../content/media'
import { ResponsiveImage } from '../../media/ResponsiveImage'

interface Piece {
  id: ImageId
  /** Height relative to the tallest piece (0–1). */
  height: number
}

/**
 * A small composition of actual drawings beside the art-portfolio link,
 * hung like works on a wall: each keeps its own proportions (nothing is
 * cropped) and the pieces share one baseline at different heights.
 *
 * Widths follow from the heights: a piece's flex-grow is its aspect ratio
 * times its relative height, so with a common flex-basis of 0 every
 * rendered height is exactly `height` × the row's scale.
 *
 * Decorative inside the link (the link's own text names the destination).
 */
export function ArtComposition({ drawings }: { drawings: Piece[] }) {
  return (
    <span className="about-art__composition" aria-hidden="true">
      {drawings.map(({ id, height }) => {
        const asset = getImage(id)
        const ratio = asset.width / asset.height
        const style = { '--ratio': ratio, flexGrow: ratio * height } as CSSProperties
        return (
          <span key={id} className="about-art__piece" style={style}>
            <ResponsiveImage image={id} sizes="(min-width: 900px) 220px, 30vw" decorative fit="cover" />
          </span>
        )
      })}
    </span>
  )
}

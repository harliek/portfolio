import type { CSSProperties } from 'react'
import { getImage, type ImageId } from '../../../content/media'
import { CaptionText } from '../../media/Figure'
import { useImageDialog } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/** A region of an image, in percent of its width and height. */
export interface CropRegion {
  x: number
  y: number
  w: number
  h: number
}

export interface CropSpec {
  image: ImageId
  region: CropRegion
  /** Alt text describing what the crop shows (not the whole screenshot). */
  alt: string
  caption: string
}

/**
 * A readable CSS crop of a real screenshot, shown at about its natural size
 * so the interface text stays legible. The crop is a button that opens the
 * whole screenshot in the shared image dialog. No new image file is made.
 */
export function EvidenceCrop({ image, region, alt, caption, sizes }: CropSpec & { sizes: string }) {
  const asset = getImage(image)
  const dialog = useImageDialog()
  const ratio = (region.w * asset.width) / (region.h * asset.height)
  const place = {
    width: `${(100 / region.w) * 100}%`,
    left: `${(-region.x / region.w) * 100}%`,
    top: `${(-region.y / region.h) * 100}%`,
  } as CSSProperties
  return (
    <figure className="figure mp-crop">
      <div className="media-frame mp-crop__frame">
        <button
          type="button"
          className="zoom-trigger mp-crop__button"
          data-zoom-id={image}
          aria-label={`Enlarge image. ${alt}`}
          onClick={(e) => dialog.open(image, e.currentTarget)}
        >
          <span className="mp-crop__view" style={{ aspectRatio: `${ratio}` }}>
            <span className="mp-crop__image" style={place}>
              <ResponsiveImage image={image} sizes={sizes} decorative />
            </span>
          </span>
          <span className="zoom-trigger__hint" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="16" height="16">
              <path
                d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
      <figcaption className="figure__caption">
        <CaptionText provenance={asset.provenance}>{caption}</CaptionText>
      </figcaption>
    </figure>
  )
}

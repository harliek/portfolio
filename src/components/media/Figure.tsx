import type { ReactNode } from 'react'
import { getImage, PROVENANCE_LABEL, type ImageId, type Provenance } from '../../content/media'
import { ResponsiveImage } from './ResponsiveImage'
import { useImageDialog } from './ImageDialog'

/** Provenance label + caption text, used inside any <figcaption>. */
export function CaptionText({ provenance, children }: { provenance?: Provenance; children: ReactNode }) {
  const label = provenance ? PROVENANCE_LABEL[provenance] : null
  return (
    <>
      {label && (
        <>
          <span className="provenance">{label}</span>
          <span className="provenance-sep"> · </span>
        </>
      )}
      {children}
    </>
  )
}

interface ZoomableImageProps {
  image: ImageId
  sizes: string
  priority?: boolean
  fit?: 'contain' | 'cover'
  className?: string
}

/**
 * An image inside a real button that opens the shared enlargement dialog.
 * The button is labelled by the image's alt text, prefixed with the action.
 */
export function ZoomableImage({ image, sizes, priority, fit, className }: ZoomableImageProps) {
  const dialog = useImageDialog()
  const asset = getImage(image)
  return (
    <button
      type="button"
      className={['zoom-trigger', className].filter(Boolean).join(' ')}
      data-zoom-id={image}
      aria-label={`Enlarge image: ${asset.alt || asset.caption || ''}`}
      onClick={(e) => dialog.open(image, e.currentTarget)}
    >
      <ResponsiveImage image={image} sizes={sizes} priority={priority} fit={fit} />
      <span className="zoom-trigger__hint" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  )
}

interface FigureProps {
  image: ImageId
  sizes: string
  /** Caption override; defaults to the manifest caption. Pass null for none. */
  caption?: ReactNode | null
  /** Show the provenance label (default true). */
  showProvenance?: boolean
  zoom?: boolean
  priority?: boolean
  fit?: 'contain' | 'cover'
  /** Wrap the media in the padded frame (outer radius = inner + padding). */
  framed?: boolean
  className?: string
}

/** A captioned image figure. Captions stay attached below the media. */
export function Figure({ image, sizes, caption, showProvenance = true, zoom = false, priority, fit, framed = false, className }: FigureProps) {
  const asset = getImage(image)
  const text = caption === undefined ? asset.caption : caption
  const media = zoom ? (
    <ZoomableImage image={image} sizes={sizes} priority={priority} fit={fit} />
  ) : (
    <ResponsiveImage image={image} sizes={sizes} priority={priority} fit={fit} />
  )
  return (
    <figure className={['figure', className].filter(Boolean).join(' ')}>
      <div className={framed ? 'media-frame media-frame--padded' : 'media-frame'}>{media}</div>
      {text && (
        <figcaption className="figure__caption">
          <CaptionText provenance={showProvenance ? asset.provenance : undefined}>{text}</CaptionText>
        </figcaption>
      )}
    </figure>
  )
}

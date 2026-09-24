import '../../styles/media-figure.css'
import type { ReactNode } from 'react'
import { getImage, PROVENANCE_LABEL, type ImageId, type Provenance } from '../../content/media'
import { ResponsiveImage } from './ResponsiveImage'
import { useImageDialog, type OpenOptions } from './ImageDialog'

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

/** The expand glyph used by every enlargement control. */
export function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface EnlargeButtonProps {
  image: ImageId
  /** Visible label (default "Enlarge image"). */
  label?: string
  /** Page through these images in the dialog (default: this image only). */
  gallery?: OpenOptions['gallery']
  /** Caption in the dialog (default: the image's manifest caption). */
  caption?: ReactNode
  className?: string
}

/**
 * The visible "Enlarge image" control (secondary, small): an explicit,
 * labelled button next to the media rather than an invisible click target.
 */
export function EnlargeButton({ image, label = 'Enlarge image', gallery, caption, className }: EnlargeButtonProps) {
  const dialog = useImageDialog()
  return (
    <button
      type="button"
      className={['button button--secondary button--small enlarge-button', className].filter(Boolean).join(' ')}
      data-zoom-id={image}
      onClick={(e) => dialog.open(image, e.currentTarget, { gallery: gallery ?? [image], caption })}
    >
      <ExpandIcon />
      {label}
    </button>
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
      aria-label={`Enlarge image. ${asset.alt || asset.caption || ''}`}
      onClick={(e) => dialog.open(image, e.currentTarget)}
    >
      <ResponsiveImage image={image} sizes={sizes} priority={priority} fit={fit} />
      <span className="zoom-trigger__hint" aria-hidden="true">
        <ExpandIcon />
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
  /** Show a visible "Enlarge image" button under the caption. */
  zoom?: boolean
  priority?: boolean
  fit?: 'contain' | 'cover'
  /** Wrap the media in the padded frame (outer radius = inner + padding). */
  framed?: boolean
  className?: string
}

/**
 * A captioned image figure. Captions stay attached below the media. With
 * `zoom`, a labelled "Enlarge image" button follows the caption; the image
 * itself stays a plain image (no hover effect implying a hidden action).
 */
export function Figure({ image, sizes, caption, showProvenance = true, zoom = false, priority, fit, framed = false, className }: FigureProps) {
  const asset = getImage(image)
  const text = caption === undefined ? asset.caption : caption
  return (
    <figure className={['figure', className].filter(Boolean).join(' ')}>
      <div className={framed ? 'media-frame media-frame--padded' : 'media-frame'} data-transparent={asset.transparent || undefined}>
        <ResponsiveImage image={image} sizes={sizes} priority={priority} fit={fit} />
      </div>
      {text && (
        <figcaption className="figure__caption">
          <CaptionText provenance={showProvenance ? asset.provenance : undefined}>{text}</CaptionText>
        </figcaption>
      )}
      {zoom && (
        <div className="figure__actions">
          <EnlargeButton image={image} caption={text ?? undefined} />
        </div>
      )}
    </figure>
  )
}

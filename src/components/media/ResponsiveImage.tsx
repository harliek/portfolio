import { useState } from 'react'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'

export interface ResponsiveImageProps {
  image: ImageId
  /** The `sizes` attribute; describe the rendered width at each breakpoint. */
  sizes: string
  /** Eager-load with high fetch priority (use only for the LCP image). */
  priority?: boolean
  /** Treat as decorative (empty alt), e.g. a poster inside a labelled button. */
  decorative?: boolean
  alt?: string
  className?: string
  fit?: 'contain' | 'cover'
  /** Overrides the loading mode (default: eager with `priority`, else lazy). */
  loading?: 'lazy' | 'eager'
  /** Overrides the fetch priority (default: high with `priority`, else auto). */
  fetchPriority?: 'high' | 'low' | 'auto'
}

/**
 * AVIF → WebP → JPEG/PNG picture with intrinsic dimensions (no layout shift).
 * On load failure the space is kept and replaced with a quiet text notice.
 */
export function ResponsiveImage({ image, sizes, priority, decorative, alt, className, fit = 'contain', loading, fetchPriority }: ResponsiveImageProps) {
  const asset = getImage(image)
  const [failed, setFailed] = useState(false)
  const altText = decorative ? '' : (alt ?? asset.alt)

  if (failed) {
    return (
      <div
        className={['image-fallback', className].filter(Boolean).join(' ')}
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
        role={altText ? 'img' : undefined}
        aria-label={altText || undefined}
      >
        <span aria-hidden={altText ? true : undefined}>Image unavailable.</span>
      </div>
    )
  }

  return (
    <picture className={['picture', className].filter(Boolean).join(' ')}>
      <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes={sizes} />
      <img
        src={fallbackSrc(asset)}
        srcSet={srcSet(asset, asset.fallback)}
        sizes={sizes}
        width={asset.width}
        height={asset.height}
        alt={altText}
        loading={loading ?? (priority ? 'eager' : 'lazy')}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={fetchPriority ?? (priority ? 'high' : 'auto')}
        data-fit={fit}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}

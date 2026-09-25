import '../../styles/plane.css'
import type { CSSProperties } from 'react'
import type { FieldProject } from '../../content/field'
import { fallbackSrc, getImage, srcSet } from '../../content/media'

/**
 * A project's picture in its rectangular frame (brief v16): interface
 * footage (a muted loop; its file is attached by the caller via data-src
 * when the frame is near), a still with a slow moving crop, or the app's own
 * screens. Used by the homepage field and each case study's next-project
 * link. Decorative inside a labelled link: the frames carry no alt text.
 */
export function PlaneMedia({ item, videoRef }: { item: FieldProject; videoRef: (el: HTMLVideoElement | null) => void }) {
  const { media } = item
  if (media.kind === 'video') {
    return (
      <video
        ref={videoRef}
        className="plane__video"
        data-src={media.src}
        poster={media.poster}
        style={{ objectPosition: media.position }}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        aria-hidden="true"
      />
    )
  }
  if (media.kind === 'image') {
    const asset = getImage(media.image)
    return (
      <picture className="plane__picture" data-pan={media.pan}>
        <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes="(min-width: 1100px) 36vw, 80vw" />
        <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes="(min-width: 1100px) 36vw, 80vw" />
        <img
          src={fallbackSrc(asset, 1200)}
          srcSet={srcSet(asset, 'jpg')}
          sizes="(min-width: 1100px) 36vw, 80vw"
          alt=""
          width={asset.width}
          height={asset.height}
          style={{ objectPosition: media.position }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>
    )
  }
  return (
    <div className="plane__screens">
      {media.screens.map((id, k) => {
        const asset = getImage(id)
        return (
          <picture key={id} className="plane__screen" style={{ '--k': k } as CSSProperties}>
            <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes="(min-width: 1100px) 10vw, 24vw" />
            <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes="(min-width: 1100px) 10vw, 24vw" />
            <img src={fallbackSrc(asset, 320)} alt="" width={asset.width} height={asset.height} loading="lazy" decoding="async" draggable={false} />
          </picture>
        )
      })}
    </div>
  )
}

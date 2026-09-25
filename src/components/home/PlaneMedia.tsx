import '../../styles/plane.css'
import type { CSSProperties } from 'react'
import type { FieldProject } from '../../content/field'
import { fallbackSrc, getImage, srcSet } from '../../content/media'

/** The assistant's mark in the leasing conversation (a small spark; the renter has initials). */
function AssistantMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 1.5c.4 2.9 1.7 4.6 5 5.5-3.3.9-4.6 2.6-5 5.5-.4-2.9-1.7-4.6-5-5.5 3.3-.9 4.6-2.6 5-5.5Z" fill="currentColor" />
    </svg>
  )
}

/**
 * A project's picture (brief v20). Film footage in its frame (its file is
 * attached by the caller via data-src when the tile is near); a still; or a
 * free-standing composition over the page: the app's own screens, cutouts of
 * real interface elements placed in the 16:10 box, or the leasing
 * conversation as live message bubbles (after the REUI message pattern:
 * avatar, bubble, incoming and outgoing turns). Used by the homepage field
 * and each case study's next-project link. Decorative inside a labelled
 * link: nothing here carries its own accessible text.
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
      <picture className="plane__picture">
        <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes="(min-width: 1100px) 57vw, 84vw" />
        <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes="(min-width: 1100px) 57vw, 84vw" />
        <img
          src={fallbackSrc(asset, 1200)}
          srcSet={srcSet(asset, 'jpg')}
          sizes="(min-width: 1100px) 57vw, 84vw"
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
  if (media.kind === 'cutouts') {
    return (
      <div className="plane__cutouts">
        {media.pieces.map((piece) => {
          const asset = getImage(piece.image)
          const sizes = `(min-width: 1100px) ${Math.round(0.38 * piece.w)}vw, (min-width: 700px) ${Math.round(0.52 * piece.w)}vw, ${Math.round(0.74 * piece.w)}vw`
          return (
            <picture
              key={piece.image}
              className="plane__cut"
              style={{ left: `${piece.x}%`, top: `${piece.y}%`, width: `${piece.w}%`, zIndex: piece.z } as CSSProperties}
            >
              <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes={sizes} />
              <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes={sizes} />
              <img src={fallbackSrc(asset)} srcSet={srcSet(asset, asset.fallback)} sizes={sizes} alt="" width={asset.width} height={asset.height} loading="lazy" decoding="async" draggable={false} />
            </picture>
          )
        })}
      </div>
    )
  }
  if (media.kind === 'chat') {
    return (
      <div className="plane__chat">
        {media.lines.map((line, k) => (
          <div key={k} className="chat-msg" data-from={line.from}>
            <span className="chat-msg__avatar">{line.from === 'renter' ? media.initials : <AssistantMark />}</span>
            <p className="chat-msg__bubble">{line.text}</p>
          </div>
        ))}
      </div>
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

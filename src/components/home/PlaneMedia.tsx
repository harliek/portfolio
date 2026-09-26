import '../../styles/plane.css'
import { useEffect, useState, type CSSProperties } from 'react'
import type { ChatLine, FieldProject } from '../../content/field'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** The assistant's mark in the leasing conversation (a small spark; the renter has initials). */
function AssistantMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 1.5c.4 2.9 1.7 4.6 5 5.5-3.3.9-4.6 2.6-5 5.5-.4-2.9-1.7-4.6-5-5.5 3.3-.9 4.6-2.6 5-5.5Z" fill="currentColor" />
    </svg>
  )
}

/** How long the sender takes to type before each message arrives, the pause after it, and the rest before it all begins again (ms). */
const TYPING = { renter: 850, assistant: 1150, after: 650, rest: 3600, restart: 700 }

/** The messages already there when the conversation starts (Harlie's request: the first two; the rest are typed). */
const CHAT_PRESENT = 2

/**
 * The leasing conversation arriving as texts do (Harlie's request): the first two messages are already there; for each
 * of the others a typing indicator shows on the sender's side, then the message. After the last one a rest, then the
 * typed messages clear and arrive again. Every message keeps its place while hidden, so nothing shifts as they
 * arrive. Reduced motion: the whole conversation at once.
 */
function Conversation({ initials, lines }: { initials: string; lines: readonly ChatLine[] }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(CHAT_PRESENT)
  const [typing, setTyping] = useState(false)
  useEffect(() => {
    if (reduced) return
    let k = CHAT_PRESENT
    let timer = 0
    const next = () => {
      if (k >= lines.length) {
        timer = window.setTimeout(() => {
          k = CHAT_PRESENT
          setShown(CHAT_PRESENT)
          timer = window.setTimeout(next, TYPING.restart)
        }, TYPING.rest)
        return
      }
      setTyping(true)
      timer = window.setTimeout(() => {
        setTyping(false)
        k += 1
        setShown(k)
        timer = window.setTimeout(next, TYPING.after)
      }, TYPING[lines[k].from])
    }
    timer = window.setTimeout(next, TYPING.restart)
    return () => window.clearTimeout(timer)
  }, [lines, reduced])
  const count = reduced ? lines.length : shown
  return (
    <div className="plane__chat">
      {lines.map((line, k) => (
        <div key={k} className="chat-msg" data-from={line.from} data-state={k < count ? 'in' : k === count && typing && !reduced ? 'typing' : 'out'}>
          <span className="chat-msg__avatar">{line.from === 'renter' ? initials : <AssistantMark />}</span>
          <span className="chat-msg__body">
            <p className="chat-msg__bubble">{line.text}</p>
            <span className="chat-msg__typing">
              <i />
              <i />
              <i />
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * One transparent picture shown as its separate widgets (Harlie's Merchandising tile): the same file, once per
 * widget, each clipped to its own box (source pixels), so each can grow and shrink a little on its own (plane.css).
 */
function Widgets({ image, x, y, w, boxes }: { image: ImageId; x: number; y: number; w: number; boxes: readonly (readonly [number, number, number, number, number])[] }) {
  const asset = getImage(image)
  const W = asset.width
  const H = asset.height
  const pct = (v: number) => `${(v * 100).toFixed(4)}%`
  const sizes = `(min-width: 1100px) ${Math.round(0.38 * w)}vw, (min-width: 700px) ${Math.round(0.52 * w)}vw, ${Math.round(0.74 * w)}vw`
  return (
    <div className="plane__cutouts">
      <div className="plane__widgets" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, aspectRatio: `${W} / ${H}` }}>
        {boxes.map(([bx, by, bw, bh, grow], k) => (
          <span
            key={k}
            className="plane__widget"
            style={{ left: pct(bx / W), top: pct(by / H), width: pct(bw / W), height: pct(bh / H), '--k': k, '--grow': grow } as CSSProperties}
          >
            <picture>
              <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes={sizes} />
              <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes={sizes} />
              <img
                src={fallbackSrc(asset)}
                srcSet={srcSet(asset, asset.fallback)}
                sizes={sizes}
                alt=""
                width={W}
                height={H}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ width: pct(W / bw), left: pct(-bx / bw), top: pct(-by / bh) }}
              />
            </picture>
          </span>
        ))}
      </div>
    </div>
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
  if (media.kind === 'chat') return <Conversation initials={media.initials} lines={media.lines} />
  if (media.kind === 'widgets') return <Widgets image={media.image} x={media.x} y={media.y} w={media.w} boxes={media.boxes} />
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

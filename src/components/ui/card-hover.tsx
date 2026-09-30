import { type CSSProperties, type KeyboardEvent, useRef } from 'react'
import type { ImageId } from '../../content/media'
import { ResponsiveImage } from '../media/ResponsiveImage'
import './card-hover.css'

/**
 * A card-hover gallery (21st.dev's "Card Hover", adapted; Harlie's request, 2026-09-29: "Try with the pages with
 * multiple photos try something like this but with three small circles on the right side"). The current picture fills
 * one large card with a distinct glowing border; the pictures stand as small circles in a row under it (Harlie's
 * request, 2026-09-30; they were a column on its right). Hovering,
 * focusing or clicking a circle brings its picture into the card, which grows in over about half a second as the
 * original's cards do. Clicking the card enlarges the picture. A short neutral label can stand under the card (the
 * current picture's, or the gallery's), for the pictures whose provenance needs one.
 *
 * Adapted to the site: typed props instead of the demo's hard-coded list, the site's responsive images, plain CSS
 * (card-hover.css) rather than Tailwind utilities, no noise overlay (it clouded the screenshots' text), the card in the
 * pictures' own proportions (never cropped), a controlled current picture (CaseStory follows the page's steps),
 * keyboard support (arrow keys move between the circles), the circles drawn from the files the card already loaded
 * (the same `sizes`, so no second copy is fetched), and no movement under reduced motion.
 */
export interface CardHoverImage {
  image: ImageId
  alt?: string
  /** A short neutral label for this picture, under the card while it is the current one. */
  label?: string
}

export function CardHover({
  items,
  active,
  aspect,
  onActivate,
  onEnlarge,
  sizes = '(min-width: 900px) 56vw, 100vw',
  background,
  label,
}: {
  items: readonly CardHoverImage[]
  /** The picture in the card. */
  active: number
  /** The pictures' proportions (width / height). */
  aspect: number
  onActivate: (index: number) => void
  /** A click (or Enter) on the card. */
  onEnlarge?: (index: number, trigger: HTMLElement) => void
  sizes?: string
  /** The colour behind a picture whose proportions differ a little from `aspect`. */
  background?: string
  /** A label for every picture that has none of its own. */
  label?: string
}) {
  const dotsRef = useRef<HTMLDivElement>(null)
  const current = items[active]
  const shown = current?.label ?? label
  // The label's line is kept whenever any picture has one, so the card never moves as the pictures change.
  const labelled = Boolean(label) || items.some((i) => i.label)

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + items.length) % items.length
    onActivate(next)
    dotsRef.current?.querySelectorAll<HTMLButtonElement>('.card-hover__dot')[next]?.focus()
  }

  return (
    <div className="card-hover" style={{ '--card-aspect': aspect, '--card-bg': background } as CSSProperties}>
      <div className="card-hover__main">
        <button
          type="button"
          className="card-hover__card"
          aria-label={`Enlarge image${current?.alt ? `: ${current.alt}` : ''}`}
          onClick={(e) => onEnlarge?.(active, e.currentTarget)}
        >
          {items.map((item, index) => (
            <span key={item.image} className="card-hover__slide" data-on={index === active || undefined} aria-hidden={index === active ? undefined : true}>
              <ResponsiveImage image={item.image} sizes={sizes} alt={item.alt} priority={index === 0} />
            </span>
          ))}
        </button>
        {labelled && (
          <p className="card-hover__label" aria-hidden={shown ? undefined : true}>
            {shown ?? '\u00a0'}
          </p>
        )}
      </div>
      <div ref={dotsRef} className="card-hover__dots" role="group" aria-label="Choose an image">
        {items.map((item, index) => (
          <button
            key={item.image}
            type="button"
            className="card-hover__dot"
            data-on={index === active || undefined}
            aria-pressed={index === active}
            aria-label={`Show image ${index + 1} of ${items.length}`}
            onMouseEnter={() => onActivate(index)}
            onFocus={() => onActivate(index)}
            onClick={() => onActivate(index)}
            onKeyDown={(e) => onKey(e, index)}
          >
            <ResponsiveImage image={item.image} sizes={sizes} decorative fit="cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

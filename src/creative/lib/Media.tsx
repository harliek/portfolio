import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Img } from '../content'

const ROOT = '/creative/'

const srcset = (img: Img, ext: 'jpg' | 'webp') => img.widths.map((w) => `${ROOT}${img.stem}-${w}.${ext} ${w}w`).join(', ')

/** Warms the cache for an image that is about to be shown (same candidate choice as <Picture>). */
export function preload(img: Img, sizes: string) {
  const el = new Image()
  el.decoding = 'async'
  el.sizes = sizes
  el.srcset = srcset(img, 'webp')
}

/** The smallest derivative at least `min` pixels wide (or the largest there is). */
export const imgUrl = (img: Img, min = 1200) =>
  `${ROOT}${img.stem}-${img.widths.find((w) => w >= min) ?? img.widths[img.widths.length - 1]}.jpg`

/**
 * A lazily fetched image at its own proportions (the original's LazyImg),
 * served as WebP with a JPG fallback. width/height reserve the space before
 * it loads, so the wall does not reflow.
 */
export function Picture({
  img,
  alt = '',
  sizes,
  className,
  style,
  eager,
}: {
  img: Img
  alt?: string
  sizes: string
  className?: string
  style?: CSSProperties
  /** above the fold, so do not defer it */
  eager?: boolean
}) {
  return (
    <picture className="lc-picture">
      <source type="image/webp" srcSet={srcset(img, 'webp')} sizes={sizes} />
      <img
        className={className}
        style={style}
        src={imgUrl(img)}
        srcSet={srcset(img, 'jpg')}
        sizes={sizes}
        width={img.w}
        height={img.h}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  )
}

/**
 * The original's silent looping tile video.
 *
 * The source is attached on first render and the element carries autoplay,
 * so a muted loop starts on its own. The observer only pauses what has
 * scrolled away. Under reduced motion (the site-wide preference) nothing
 * plays and the poster is the picture.
 */
export function Video({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const still = useReducedMotion()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || still || typeof IntersectionObserver === 'undefined') return

    const inView = () => {
      const r = el.getBoundingClientRect()
      const margin = window.innerHeight * 0.25
      return r.bottom > -margin && r.top < window.innerHeight + margin
    }

    const run = () => {
      if (document.visibilityState !== 'visible' || !inView()) return
      const p = el.play()
      if (p && typeof p.then === 'function') {
        p.catch((err: DOMException) => {
          if (err && err.name !== 'AbortError' && err.name !== 'NotAllowedError') setFailed(true)
        })
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (document.visibilityState !== 'visible') return
        if (entries[0].isIntersecting) run()
        else if (!el.paused) el.pause()
      },
      { rootMargin: '25% 0px', threshold: 0.01 },
    )
    io.observe(el)

    const wake = () => {
      if (document.visibilityState === 'visible') run()
      else if (!el.paused) el.pause()
    }
    document.addEventListener('visibilitychange', wake)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', wake)
    }
  }, [still])

  if (still || failed) {
    return <img className={className} src={poster} alt="" loading="lazy" decoding="async" />
  }

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onError={() => setFailed(true)}
    />
  )
}

import { useEffect, useRef, useState } from 'react'
import { getVideo } from '../../content/media'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ResponsiveImage } from '../media/ResponsiveImage'

const VIDEO = getVideo('art-portfolio')
/** The narrow (40%) column of About's grid at desktop, the full width below 960px. */
const SIZES = '(min-width: 1200px) 460px, (min-width: 960px) 38vw, calc(100vw - 40px)'

/**
 * The original creative homepage's Art tile, inside the About page's "Open
 * creative portfolio" link (AboutContent.tsx): a quiet way into /creative/,
 * so the section's one dominant visual stays An Artistic End beside it.
 *
 * At rest it shows the poster (the loop's first frame). Its silent loop plays
 * only while the enclosing link is hovered or focused, and fades back to the
 * poster when that ends. On devices that hover, the video element is added
 * (metadata only) once the frame nears the viewport, so a hover starts at
 * once; elsewhere it is added on focus, and a tap simply follows the link.
 * Reduced motion (OS setting or the footer toggle): the poster only, and no
 * video request at all.
 *
 * Decorative (the link's text and the sentence after it carry the meaning),
 * so it is hidden from assistive technology. `data-ambient` keeps it out of
 * the site's one-film-at-a-time rule (useMediaPlayback), so it never pauses
 * a film and a film never counts it.
 */
export function ArtPreview() {
  const reduced = useReducedMotion()
  const canHover = useMediaQuery('(hover: hover)')
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const active = !reduced && (hovered || focused)
  const mounted = !reduced && (near || hovered || focused)

  // Hover-capable devices: add the video element once the frame is within 100px of the viewport.
  useEffect(() => {
    const frame = frameRef.current
    if (reduced || !canHover || near || !frame) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true)
      },
      { rootMargin: '100px 0px' },
    )
    io.observe(frame)
    return () => io.disconnect()
  }, [reduced, canHover, near])

  // Hover (mouse or pen) and focus on the enclosing link.
  useEffect(() => {
    const link = frameRef.current?.closest('a')
    if (!link) return
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') setHovered(true)
    }
    const leave = () => setHovered(false)
    const focus = () => setFocused(true)
    const blur = () => setFocused(false)
    link.addEventListener('pointerenter', enter)
    link.addEventListener('pointerleave', leave)
    link.addEventListener('focus', focus)
    link.addEventListener('blur', blur)
    return () => {
      link.removeEventListener('pointerenter', enter)
      link.removeEventListener('pointerleave', leave)
      link.removeEventListener('focus', focus)
      link.removeEventListener('blur', blur)
    }
  }, [])

  // Play while hovered or focused and the page is visible; pause (back to the poster) otherwise.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!active) {
      video.pause()
      return
    }
    const sync = () => {
      if (document.visibilityState === 'visible') {
        video.muted = true
        video.play().catch(() => {
          /* Refused or interrupted: the poster stays. */
        })
      } else video.pause()
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [active, mounted])

  return (
    <div ref={frameRef} className="about-portfolio__frame" aria-hidden="true" data-playing={(playing && active) || undefined}>
      <ResponsiveImage image={VIDEO.poster} sizes={SIZES} decorative fit="cover" className="about-portfolio__poster" />
      {mounted && (
        <video
          ref={videoRef}
          className="about-portfolio__video"
          src={VIDEO.variants[0].src}
          width={VIDEO.width}
          height={VIDEO.height}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          data-ambient=""
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
    </div>
  )
}

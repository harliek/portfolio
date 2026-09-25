import { useEffect, useRef, useState } from 'react'
import { getVideo } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { CREATIVE_SIZES } from './creativeSizes'

const VIDEO = getVideo('art-portfolio')

/**
 * The original creative homepage's Art tile, filling the frame of the
 * Creative Portfolio card (the left of About's Creative work, the same size
 * as An Artistic End beside it) inside its link to /creative/.
 *
 * Its silent loop plays all the time while the card is on screen (Harlie's
 * request: not only on hover), over its poster, and pauses (keeping its
 * place) when the card is scrolled away or the tab is hidden. The video
 * element is added once the card nears the viewport. Reduced motion (the OS
 * setting): the poster only, and no video request at all. The 16:9 art is
 * drawn with `cover` in the poster-shaped frame, so it loses about 2% at each
 * side (abstract paint, nothing essential).
 *
 * Decorative (the link's label carries the meaning), so it is hidden from
 * assistive technology. `data-ambient` keeps it out of the site's
 * one-film-at-a-time rule (useMediaPlayback), so it never pauses a film and
 * a film never counts it.
 */
export function ArtPreview() {
  const reduced = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)
  const active = !reduced && inView
  const mounted = !reduced && near

  // Add the video once the card is within 200px of the viewport; play it while any of it is on screen.
  useEffect(() => {
    const frame = frameRef.current
    if (reduced || !frame) return
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        if (e.isIntersecting) setNear(true)
        setInView(e.isIntersecting)
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(frame)
    return () => io.disconnect()
  }, [reduced])

  // Play while on screen and the page is visible; pause (keeping its place) otherwise.
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
    <div ref={frameRef} className="about-work__media" aria-hidden="true" data-playing={(playing && active) || undefined}>
      <ResponsiveImage image={VIDEO.poster} sizes={CREATIVE_SIZES} decorative fit="cover" className="about-work__image" />
      {mounted && (
        <video
          ref={videoRef}
          className="about-work__video"
          src={VIDEO.variants[0].src}
          width={VIDEO.width}
          height={VIDEO.height}
          muted
          loop
          playsInline
          preload="auto"
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

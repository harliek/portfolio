import { useEffect, useRef, useState } from 'react'
import { getVideo } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ResponsiveImage } from '../media/ResponsiveImage'

const VIDEO = getVideo('art-portfolio')
/** The wide column of About's grid: at most 810px (1440px and wider), narrower below. */
const SIZES = '(min-width: 960px) 810px, calc(100vw - 40px)'

/**
 * The silent art-portfolio loop beside "My art portfolio".
 *
 * Decorative (the heading, sentence and "Open art portfolio" button carry
 * the meaning and the navigation), so it is hidden from assistive
 * technology and is not a control. The poster is painted first. The video
 * element is added only when the frame is about to enter the viewport and
 * then loads only its metadata; the file itself streams once the frame is at
 * least a third on screen (and the page is visible), when it plays. A
 * visitor who never scrolls to it downloads nothing but the poster. It
 * fades in over the poster once frames play. Reduced motion (OS setting or
 * the footer toggle): the poster only, and no video request at all.
 * `data-ambient` keeps it out of the site's one-film-at-a-time rule
 * (useMediaPlayback), so it never pauses a film and a film never counts it.
 */
export function ArtPreview() {
  const reduced = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [near, setNear] = useState(false)
  const [playing, setPlaying] = useState(false)

  // Add the video element only once the frame is within 100px of the viewport.
  useEffect(() => {
    const frame = frameRef.current
    if (reduced || near || !frame) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true)
      },
      { rootMargin: '100px 0px' },
    )
    io.observe(frame)
    return () => io.disconnect()
  }, [reduced, near])

  // Play only while in view and visible; pause otherwise. Never under reduced motion.
  useEffect(() => {
    const frame = frameRef.current
    const video = videoRef.current
    if (reduced || !near || !frame || !video) return
    let inView = false
    const sync = () => {
      const want = inView && document.visibilityState === 'visible'
      if (want && video.paused) {
        video.muted = true
        video.play().catch(() => {
          /* Autoplay refused: the poster stays. */
        })
      } else if (!want && !video.paused) {
        video.pause()
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.34)
        sync()
      },
      { threshold: [0, 0.34, 0.66, 1] },
    )
    io.observe(frame)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      video.pause()
    }
  }, [reduced, near])

  return (
    <div ref={frameRef} className="about-art__frame" aria-hidden="true" data-playing={(playing && !reduced) || undefined}>
      <ResponsiveImage image={VIDEO.poster} sizes={SIZES} decorative fit="cover" className="about-art__poster" />
      {!reduced && near && (
        <video
          ref={videoRef}
          className="about-art__video"
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
        />
      )}
    </div>
  )
}

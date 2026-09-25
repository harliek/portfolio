import { useEffect, useRef } from 'react'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CursorLight } from '../ui/CursorLight'

/**
 * The homepage's film (brief v16): Harlie's original cinematic loop, fixed
 * behind the whole homepage. It autoplays muted and inline, loops, and has
 * no controls, and the pointer no longer bends it (Harlie's request: the
 * liquid refraction is gone). Reduced motion: the still poster (no video
 * request).
 *
 * The shade over it follows `--film-dim` (0 to 1), which the homepage sets
 * from scroll: the film darkens as the visitor enters the selected work and
 * stays faintly present behind it. Over the shade, the cursor carries a soft
 * blue light (CursorLight), on a mouse or trackpad only. Decorative:
 * aria-hidden.
 */
export function HomeFilm() {
  const reduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const poster = getImage(STAGE_MEDIA.film.desktop.poster)
  const wide = typeof window !== 'undefined' && window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.25) > 1400
  const file = wide ? STAGE_MEDIA.film.desktop : STAGE_MEDIA.film.mobile

  // Autoplay can be refused (Low Power Mode); try again on the first interaction.
  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return
    const play = () => void video.play().catch(() => {})
    play()
    const onVisibility = () => (document.visibilityState === 'visible' ? play() : video.pause())
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pointerdown', play, { once: true })
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointerdown', play)
    }
  }, [reduced])

  return (
    <div className="home-film" aria-hidden="true">
      <picture className="home-film__poster">
        <source type="image/avif" srcSet={srcSet(poster, 'avif')} />
        <source type="image/webp" srcSet={srcSet(poster, 'webp')} />
        <img src={fallbackSrc(poster, 1280)} srcSet={srcSet(poster, 'jpg')} sizes="100vw" alt="" width={poster.width} height={poster.height} fetchPriority="high" />
      </picture>
      {!reduced && (
        <video
          ref={videoRef}
          className="home-film__video"
          src={file.src}
          width={file.width}
          height={file.height}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        />
      )}
      <div className="home-film__shade" />
      <CursorLight className="home-film__light" />
    </div>
  )
}

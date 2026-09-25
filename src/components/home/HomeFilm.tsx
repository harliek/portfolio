import { useEffect, useRef } from 'react'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { createLiquidFilm } from './liquidFilm'

/** The film's framing: the figure sits centre-right, as on the original homepage. */
const FOCUS_WIDE: [number, number] = [0.62, 0.5]
const FOCUS_PORTRAIT: [number, number] = [0.64, 0.5]

/**
 * The homepage's film (brief v16): Harlie's original cinematic loop, fixed
 * behind the whole homepage. It autoplays muted and inline, loops, and has
 * no controls. On a fine pointer (desktop) it is drawn through the liquid
 * refraction (liquidFilm.ts) with a subtle pointer parallax; the <video>
 * stays underneath as the fallback. Touch screens get the plain film, and
 * reduced motion the still poster (no video request).
 *
 * The shade over it follows `--film-dim` (0 to 1), which the homepage sets
 * from scroll: the film darkens as the visitor enters the selected work and
 * stays faintly present behind it. Decorative: aria-hidden.
 */
export function HomeFilm() {
  const reduced = useReducedMotion()
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const portrait = useMediaQuery('(max-aspect-ratio: 3 / 4)')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poster = getImage(STAGE_MEDIA.film.desktop.poster)
  const wide = typeof window !== 'undefined' && window.innerWidth * Math.min(window.devicePixelRatio || 1, 1.25) > 1400
  const file = wide ? STAGE_MEDIA.film.desktop : STAGE_MEDIA.film.mobile
  const refract = finePointer && !reduced

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

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!refract || !canvas || !video) return
    const film = createLiquidFilm(canvas, video, {
      radius: 160,
      displacement: 13,
      parallax: 10,
      zoom: 0.01,
      position: portrait ? FOCUS_PORTRAIT : FOCUS_WIDE,
    })
    if (!film) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') film.pointer(e.clientX, e.clientY)
    }
    const onLeave = () => film.pointer(null)
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) film.pointer(null)
    }
    // The refraction responds while the opening is in view; below it the film is only a faint ground.
    const onScroll = () => film.active(window.scrollY < window.innerHeight * 0.9)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('scroll', onScroll)
      film.destroy()
      delete canvas.dataset.ready
    }
  }, [refract, portrait])

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
      {refract && <canvas ref={canvasRef} className="home-film__canvas" />}
      <div className="home-film__shade" />
    </div>
  )
}

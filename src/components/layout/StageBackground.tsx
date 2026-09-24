import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { STAGE } from '../../config/stage'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export type StageRoute = keyof typeof STAGE.background.rate

const MOBILE_QUERY = `(max-width: ${STAGE.background.mobileBelow - 0.02}px)`

/**
 * The persistent set: a full-viewport architectural video behind every page,
 * mounted ONCE in PageShell so the same <video> keeps playing through route
 * changes and project openings. The poster is painted first and content never
 * waits for the video; the muted loop fades in over it once frames play. One
 * file per device class, chosen once. Reduced motion (OS or the footer's
 * "Reduce motion" toggle): poster only, no video request. A dark overlay per
 * route and a restrained violet floor light are CSS (src/styles/stage.css).
 * Decorative: aria-hidden; pauses while the document is hidden.
 */
export function StageBackground({ route }: { route: StageRoute }) {
  const reduced = useReducedMotion()
  const [file] = useState(() => (window.matchMedia(MOBILE_QUERY).matches ? STAGE_MEDIA.background.mobile : STAGE_MEDIA.background.desktop))
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Play while the document is visible.
  useEffect(() => {
    const video = videoRef.current
    if (reduced || !video) return
    const sync = () => {
      const want = document.visibilityState === 'visible'
      if (want && video.paused) video.play().catch(() => {})
      else if (!want && !video.paused) video.pause()
    }
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => document.removeEventListener('visibilitychange', sync)
  }, [reduced])

  // Calmer set on About, Art and Film: the same element, a slower loop.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const rate = STAGE.background.rate[route]
    video.defaultPlaybackRate = rate
    video.playbackRate = rate
  }, [route, reduced])

  const desktop = getImage(STAGE_MEDIA.background.desktop.poster)
  const mobile = getImage(STAGE_MEDIA.background.mobile.poster)

  return (
    <div className="stage-bg" data-route={route} aria-hidden="true">
      <picture className="stage-bg__poster">
        <source media={MOBILE_QUERY} type="image/avif" srcSet={srcSet(mobile, 'avif')} />
        <source media={MOBILE_QUERY} type="image/webp" srcSet={srcSet(mobile, 'webp')} />
        <source type="image/avif" srcSet={srcSet(desktop, 'avif')} />
        <source type="image/webp" srcSet={srcSet(desktop, 'webp')} />
        <img src={fallbackSrc(desktop)} alt="" width={desktop.width} height={desktop.height} decoding="async" fetchPriority="high" />
      </picture>
      {!reduced && (
        <video
          ref={videoRef}
          className="stage-bg__video"
          style={{ '--bg-video-fade': `${STAGE.background.fadeInMs}ms` } as CSSProperties}
          data-playing={playing || undefined}
          data-ambient=""
          data-stage-background=""
          src={file.src}
          width={file.width}
          height={file.height}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        />
      )}
      <div className="stage-bg__shade" />
      <div className="stage-bg__reflection" />
    </div>
  )
}

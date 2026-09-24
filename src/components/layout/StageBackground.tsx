import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { STAGE, stageRouteFor, type StageRoute } from '../../config/stage'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { subscribeTransitionTarget, transitionTarget } from '../transition/projectTransition'

const MOBILE_QUERY = `(max-width: ${STAGE.background.mobileBelow - 0.02}px)`

/**
 * The persistent set: a full-viewport architectural video behind every
 * professional page, mounted ONCE in PageShell so the same <video> keeps
 * playing through route changes and project openings (it never restarts).
 * The poster is painted first and content never waits for the video; the
 * muted loop fades in over it once frames play. One file per device class,
 * chosen once.
 *
 * Readability (src/styles/stage.css): broad gradients only, no boxes. A
 * base shade per route; a reading layer that is strongest behind the text
 * column on interior pages and, on the homepage, deepens as the visitor
 * scrolls from the carousel into About (`--read`, 0 → 1); and a soft band
 * that dims the bright floor line wherever it sits in the viewport.
 *
 * While a project opens from the carousel (projectTransition.ts), the set
 * already shows the destination's treatment, quickly (`data-hurry`), so the
 * darker interior shade is complete before the new page's text appears and
 * the bright floor line never crosses it.
 *
 * Reduced motion (OS or the footer's "Reduce motion"): poster only, no video
 * request. The video pauses while the tab is hidden, while an image is
 * enlarged or the small-screen menu is open, and while anything is
 * fullscreen. Decorative: aria-hidden.
 */
export function StageBackground({ route: current }: { route: StageRoute }) {
  const reduced = useReducedMotion()
  const opening = useSyncExternalStore(subscribeTransitionTarget, transitionTarget)
  const route = opening ? stageRouteFor(opening) : current
  const hurry = route !== current
  const [mobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const file = mobile ? STAGE_MEDIA.background.mobile : STAGE_MEDIA.background.desktop
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Play only while it can be seen: the tab is visible, no image dialog or
  // small-screen menu covers the page, nothing is fullscreen.
  useEffect(() => {
    const video = videoRef.current
    if (reduced || !video) return
    const root = document.documentElement
    const sync = () => {
      const covered = root.classList.contains('is-dialog-open') || root.classList.contains('is-menu-open')
      const want = document.visibilityState === 'visible' && !document.fullscreenElement && !covered
      if (want && video.paused) video.play().catch(() => {})
      else if (!want && !video.paused) video.pause()
    }
    const classes = new MutationObserver(sync)
    classes.observe(root, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', sync)
    document.addEventListener('fullscreenchange', sync)
    sync()
    return () => {
      classes.disconnect()
      document.removeEventListener('visibilitychange', sync)
      document.removeEventListener('fullscreenchange', sync)
    }
  }, [reduced])

  // Calmer set on About: the same element, a slower loop.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const rate = STAGE.background.rate[route]
    video.defaultPlaybackRate = rate
    video.playbackRate = rate
  }, [route, reduced])

  // Homepage: the reading treatment follows the scroll from the carousel
  // (a lighter room) into About (the interior-page treatment).
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (route !== 'home') {
      el.style.removeProperty('--read')
      return
    }
    const { start, span } = STAGE.homeReading
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const p = Math.min(1, Math.max(0, (window.scrollY - h * start) / (h * span)))
      el.style.setProperty('--read', p.toFixed(3))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [route])

  const desktop = getImage(STAGE_MEDIA.background.desktop.poster)
  const phone = getImage(STAGE_MEDIA.background.mobile.poster)

  return (
    <div
      ref={rootRef}
      className="stage-bg"
      data-route={route}
      data-hurry={hurry || undefined}
      data-file={mobile ? 'mobile' : 'desktop'}
      aria-hidden="true"
    >
      <picture className="stage-bg__poster">
        <source media={MOBILE_QUERY} type="image/avif" srcSet={srcSet(phone, 'avif')} />
        <source media={MOBILE_QUERY} type="image/webp" srcSet={srcSet(phone, 'webp')} />
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
      <div className="stage-bg__read" />
      <div className="stage-bg__band" />
    </div>
  )
}

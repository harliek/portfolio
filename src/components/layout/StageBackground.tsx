import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'
import { STAGE, stageRouteFor, type StageRoute } from '../../config/stage'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { subscribeTransitionTarget, transitionTarget } from '../transition/projectTransition'

/** Portrait phones get the room's portrait crop (the same pixels their cover crop shows, a third of the data). */
const PORTRAIT_QUERY = `(max-width: ${STAGE.background.portraitBelow - 0.02}px) and (max-aspect-ratio: 3 / 4)`

/** Whether the portrait file suits the window now (a phone turned to landscape takes the full frame). */
function usePortrait() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia(PORTRAIT_QUERY)
      query.addEventListener('change', notify)
      return () => query.removeEventListener('change', notify)
    },
    () => window.matchMedia(PORTRAIT_QUERY).matches,
  )
}

/** An image the visitor can see now: in the viewport, not in a hidden layer, not a low-priority prefetch. */
function seenNow(img: HTMLImageElement) {
  if (img.complete || img.fetchPriority === 'low' || img.closest('.stage-bg')) return false
  const r = img.getBoundingClientRect()
  if (r.width < 1 || r.height < 1 || r.bottom <= 0 || r.top >= window.innerHeight || r.right <= 0 || r.left >= window.innerWidth) return false
  return img.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true
}

/** Resolves when every image the visitor can see has loaded or failed (the page's own content comes first). */
function visibleImagesSettled() {
  const pending = [...document.images].filter(seenNow)
  return Promise.all(
    pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        }),
    ),
  )
}

/**
 * The room's video file, requested the first time the room is wanted (the
 * first visit to the homepage), once the images the visitor can see have
 * loaded (at most STAGE.background.contentFirstMaxMs later): on a slow
 * connection the project objects get the bandwidth before the decorative
 * video. Never with reduced motion (the poster stays). A later change of
 * file (a phone turned between portrait and landscape) is requested at once.
 */
function useContentFirstSrc(wanted: boolean, src: string, reduced: boolean) {
  /** The content-first wait has passed (once per visit). */
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (reduced || ready || !wanted) return
    let cancelled = false
    let timer = 0
    const frame = window.requestAnimationFrame(() => {
      const cap = new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, STAGE.background.contentFirstMaxMs)
      })
      void Promise.race([visibleImagesSettled(), cap]).then(() => {
        if (!cancelled) setReady(true)
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [reduced, ready, wanted])
  return ready && !reduced ? src : undefined
}

/**
 * Plays the room only while it is shown (and for `lingerMs` after, while it
 * fades out) and can be seen: the tab is visible, no image dialog or
 * small-screen menu covers the page, nothing is fullscreen. It resumes where
 * it paused (it never restarts).
 */
function usePlayWhileShown(ref: RefObject<HTMLVideoElement | null>, src: string | undefined, shown: boolean, lingerMs: number, reduced: boolean) {
  useEffect(() => {
    const video = ref.current
    if (reduced || !video || !src) return
    const root = document.documentElement
    // Just hidden while playing: it keeps playing through its fade-out.
    let on = shown || !video.paused
    let timer = 0
    const sync = () => {
      const covered = root.classList.contains('is-dialog-open') || root.classList.contains('is-menu-open')
      const want = on && document.visibilityState === 'visible' && !document.fullscreenElement && !covered
      if (want && video.paused) video.play().catch(() => {})
      else if (!want && !video.paused) video.pause()
    }
    if (!shown && on) {
      timer = window.setTimeout(() => {
        on = false
        sync()
      }, lingerMs)
    }
    const classes = new MutationObserver(sync)
    classes.observe(root, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', sync)
    document.addEventListener('fullscreenchange', sync)
    sync()
    return () => {
      window.clearTimeout(timer)
      classes.disconnect()
      document.removeEventListener('visibilitychange', sync)
      document.removeEventListener('fullscreenchange', sync)
    }
  }, [ref, src, shown, lingerMs, reduced])
}

/**
 * The persistent set, mounted ONCE in PageShell so the same <video> keeps
 * its place through route changes and project openings (it never
 * restarts), in two layers:
 *
 * - the ground: a quiet near-black behind every page (stage.css), which is
 *   all that shows behind case studies, About and the not-found page (no
 *   architectural walls, reflective floor or reflection line, and no video
 *   request);
 * - the room (brief v15): a dark architectural corridor behind the whole
 *   homepage, fixed while the page scrolls, cover-fit around its central
 *   vanishing point with its floor in view, where the project objects stand.
 *   A seam-free 12s loop (a smooth dolly in and back out, at rest where it
 *   loops; STAGE_MEDIA.room). A restrained shade keeps the header, title,
 *   captions and controls readable (stage.css); the room's own colour stays.
 *   The old close-up film no longer shows on the homepage.
 *
 * The room lies over the ground and fades in or out over it when the route
 * changes (STAGE.room: in over fadeMs, out over the shorter fadeOutMs;
 * quicker still while a project opens from the carousel, `data-hurry`): one
 * layer fading over a steady one, so there is never a black flash or two
 * pictures blended over each other. Its poster (the loop's first frame) is
 * painted first (at low priority when the visit starts on another page,
 * ready for the homepage) and content never waits for it; the muted loop
 * fades in over its poster once frames play (the same picture, so the fade
 * cannot be seen). The video is requested only once the homepage is first
 * shown, after the images the visitor can see have loaded. Portrait phones
 * get the portrait crop, everything else the full frame.
 *
 * While a project opens from the carousel (projectTransition.ts), the set
 * already shows the destination's treatment, quickly (`data-hurry`).
 *
 * Reduced motion (the operating system setting): the poster only, no video
 * request. The room plays only while it is shown and can be seen: it pauses
 * when the tab is hidden, an image or video is enlarged, the small-screen
 * menu is open, or anything is fullscreen. Decorative: aria-hidden.
 */
export function StageBackground({ route: current }: { route: StageRoute }) {
  const reduced = useReducedMotion()
  const opening = useSyncExternalStore(subscribeTransitionTarget, transitionTarget)
  const route = opening ? stageRouteFor(opening) : current
  const hurry = route !== current
  const shown = route === 'home'
  const [firstRoute] = useState(route)
  const portrait = usePortrait()
  const file = portrait ? STAGE_MEDIA.room.portrait : STAGE_MEDIA.room.desktop
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const src = useContentFirstSrc(shown, file.src, reduced)
  const { fadeMs, fadeOutMs } = STAGE.room

  usePlayWhileShown(videoRef, src, shown, fadeMs, reduced)

  const poster = getImage(STAGE_MEDIA.room.desktop.poster)
  const posterPortrait = getImage(STAGE_MEDIA.room.portrait.poster)

  return (
    <div
      className="stage-bg"
      data-route={route}
      data-hurry={hurry || undefined}
      data-file={portrait ? 'portrait' : 'full'}
      style={{ '--scene-fade': `${fadeMs}ms`, '--scene-fade-out': `${fadeOutMs}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="stage-scene" data-shown={shown || undefined}>
        <picture className="stage-scene__poster">
          <source media={PORTRAIT_QUERY} type="image/avif" srcSet={srcSet(posterPortrait, 'avif')} />
          <source media={PORTRAIT_QUERY} type="image/webp" srcSet={srcSet(posterPortrait, 'webp')} />
          <source media={PORTRAIT_QUERY} srcSet={srcSet(posterPortrait, 'jpg')} />
          <source type="image/avif" srcSet={srcSet(poster, 'avif')} />
          <source type="image/webp" srcSet={srcSet(poster, 'webp')} />
          <img
            src={fallbackSrc(poster, 1280)}
            srcSet={srcSet(poster, 'jpg')}
            alt=""
            width={poster.width}
            height={poster.height}
            decoding="async"
            fetchPriority={firstRoute === 'home' ? 'high' : 'low'}
          />
        </picture>
        {!reduced && (
          <video
            ref={videoRef}
            className="stage-scene__video"
            style={{ '--bg-video-fade': `${STAGE.background.fadeInMs}ms` } as CSSProperties}
            data-playing={playing || undefined}
            data-ambient=""
            data-stage-background=""
            src={src}
            width={file.width}
            height={file.height}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            onLoadStart={() => setPlaying(false)}
            onPlaying={() => setPlaying(true)}
          />
        )}
        <div className="stage-scene__shade" />
      </div>
    </div>
  )
}

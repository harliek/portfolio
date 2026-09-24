import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'
import { STAGE, stageRouteFor, type StageRoute } from '../../config/stage'
import { fallbackSrc, getImage, srcSet, STAGE_MEDIA } from '../../content/media'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { subscribeTransitionTarget, transitionTarget } from '../transition/projectTransition'

const MOBILE_QUERY = `(max-width: ${STAGE.background.mobileBelow - 0.02}px)`

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
 * The film file, requested the first time the film is wanted (the first
 * visit to the homepage), once the images the visitor can see have loaded
 * (at most STAGE.background.contentFirstMaxMs later): on a slow connection
 * the content gets the bandwidth before the decorative film. Never with
 * reduced motion (the poster stays).
 */
function useContentFirstSrc(wanted: boolean, src: string, reduced: boolean) {
  const [value, setValue] = useState<string>()
  useEffect(() => {
    if (reduced || value || !wanted) return
    let cancelled = false
    let timer = 0
    const frame = window.requestAnimationFrame(() => {
      const cap = new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, STAGE.background.contentFirstMaxMs)
      })
      void Promise.race([visibleImagesSettled(), cap]).then(() => {
        if (!cancelled) setValue(src)
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [reduced, value, wanted, src])
  return value
}

/**
 * Plays the film only while it is shown (and for `lingerMs` after, while it
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
 *   all that shows behind case studies, About and the not-found page (plan
 *   v12 item 10: no architectural walls, reflective floor or reflection
 *   line, and no architectural video request);
 * - the film: the original film of Harlie's first portfolio homepage,
 *   behind the whole homepage (the opening and the projects), fixed while
 *   the page scrolls, object-fit cover with its original framing (a
 *   narrower crop on phones keeps the subject in view). A restrained dark
 *   overlay keeps the text readable: a soft gradient, darker on the left
 *   behind the introduction and under the header, and a veil that darkens
 *   slightly as the projects enter (scroll-linked, `--film-enter`); the
 *   footage stays clearly visible.
 *
 * The film lies over the ground and fades in or out over it when the route
 * changes (STAGE.film: in over fadeMs, out over the shorter fadeOutMs;
 * quicker still while a project opens from the carousel, `data-hurry`): one
 * layer fading over a steady one, so there is never a black flash or two
 * pictures blended over each other. The film's
 * poster is painted first (at low priority when the visit starts on another
 * page, ready for the homepage) and content never waits for it; the muted
 * loop fades in over its poster once frames play. The film is requested
 * only once the homepage is first shown, after the images the visitor can
 * see have loaded. One file per device class, chosen once.
 *
 * While a project opens from the carousel (projectTransition.ts), the set
 * already shows the destination's treatment, quickly (`data-hurry`).
 *
 * Reduced motion (the operating system setting): the poster only, no video
 * request. The film plays only while it is shown and can be seen: it pauses
 * when the tab is hidden, an image or video is enlarged, the small-screen
 * menu is open, or anything is fullscreen. Decorative: aria-hidden.
 */
export function StageBackground({ route: current }: { route: StageRoute }) {
  const reduced = useReducedMotion()
  const opening = useSyncExternalStore(subscribeTransitionTarget, transitionTarget)
  const route = opening ? stageRouteFor(opening) : current
  const hurry = route !== current
  const film = route === 'home'
  const [firstRoute] = useState(route)
  const [mobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const filmFile = mobile ? STAGE_MEDIA.film.mobile : STAGE_MEDIA.film.desktop
  const [filmPlaying, setFilmPlaying] = useState(false)
  const filmRef = useRef<HTMLVideoElement>(null)
  const filmLayerRef = useRef<HTMLDivElement>(null)
  const filmSrc = useContentFirstSrc(film, filmFile.src, reduced)
  const { fadeMs, fadeOutMs, enterShare } = STAGE.film

  usePlayWhileShown(filmRef, filmSrc, film, fadeMs, reduced)

  // The film's veil darkens a little as the projects enter (the page's scroll over about one window height).
  useEffect(() => {
    const layer = filmLayerRef.current
    if (!layer || !film) return
    let frame = 0
    const update = () => {
      frame = 0
      const k = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight * enterShare)))
      layer.style.setProperty('--film-enter', k.toFixed(3))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [film, enterShare])

  const filmPoster = getImage(STAGE_MEDIA.film.desktop.poster)

  return (
    <div
      className="stage-bg"
      data-route={route}
      data-hurry={hurry || undefined}
      data-file={mobile ? 'mobile' : 'desktop'}
      style={{ '--film-fade': `${fadeMs}ms`, '--film-fade-out': `${fadeOutMs}ms` } as CSSProperties}
      aria-hidden="true"
    >
      <div ref={filmLayerRef} className="stage-film" data-shown={film || undefined}>
        <picture className="stage-film__poster">
          <source type="image/avif" srcSet={srcSet(filmPoster, 'avif')} />
          <source type="image/webp" srcSet={srcSet(filmPoster, 'webp')} />
          <img
            src={fallbackSrc(filmPoster, 1280)}
            srcSet={srcSet(filmPoster, 'jpg')}
            alt=""
            width={filmPoster.width}
            height={filmPoster.height}
            decoding="async"
            fetchPriority={firstRoute === 'home' ? 'high' : 'low'}
          />
        </picture>
        {!reduced && (
          <video
            ref={filmRef}
            className="stage-film__video"
            style={{ '--bg-video-fade': `${STAGE.background.fadeInMs}ms` } as CSSProperties}
            data-playing={filmPlaying || undefined}
            data-ambient=""
            data-stage-background=""
            src={filmSrc}
            width={filmFile.width}
            height={filmFile.height}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            onPlaying={() => setFilmPlaying(true)}
          />
        )}
        <div className="stage-film__shade" />
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { FIELD, fieldPath, isExternalTile, isFree, tileLabel } from '../../content/field'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ExternalMark } from '../layout/WorkShelf'
import { PageLink } from '../transition/PageLink'
import { leaveSite } from '../transition/pageChange'
import { isPlainClick } from '../transition/warm'
import { PlaneMedia } from './PlaneMedia'

/** How far outside the window a tile's footage is loaded and started, so it is already playing as it comes into view. */
const NEAR = '200px 0px'

/**
 * The selected work as a grid with an ordinary page scroll (Harlie's request, 2026-10-12; it replaced the moving
 * strip, whose tiles drifted to the left and which the page ended with): rows of three, centred, in field.ts's order (Creative Portfolio, About me, Creative
 * Production; AI Leasing Agent, CafePress UK, Jumpstart Finance; AI Spreadsheet Agent and Merchandising Platform), two to
 * a row on tablets and one on phones (home.css). The tiles keep the strip's frame, picture, caption, hover and focus. Footage plays muted on every tile in or near the window and pauses once it has left; reduced motion:
 * posters instead of footage. A tile opens its page with the site's page change; the Creative Portfolio tile leaves
 * for the separate creative site.
 */
export function ProjectGrid() {
  const reduced = useReducedMotion()
  const videos = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    if (reduced) return
    const near = new Set<HTMLVideoElement>()
    const play = (video: HTMLVideoElement) => {
      if (document.visibilityState === 'visible') void video.play().catch(() => {})
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            // Its file is attached the first time it comes near (PlaneMedia leaves it unloaded).
            if (!video.hasAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
            near.add(video)
            play(video)
          } else {
            near.delete(video)
            video.pause()
          }
        }
      },
      { rootMargin: NEAR },
    )
    const list = videos.current.filter((v): v is HTMLVideoElement => Boolean(v))
    list.forEach((v) => io.observe(v))
    // The site pauses every video in a hidden tab (useMediaPlayback); shown again, the tiles in view carry on.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') near.forEach(play)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      list.forEach((v) => v.pause())
    }
  }, [reduced])

  return (
    <section id="selected-work" className="work-grid" aria-labelledby="work-grid-label">
      {/* The section's name for screen readers; nothing shows over the tiles (Harlie's request). */}
      <h2 className="visually-hidden" id="work-grid-label">
        Selected work
      </h2>
      <ul className="work-grid__list" role="list">
        {FIELD.map((item, i) => {
          const path = fieldPath(item)
          const tile = {
            className: 'plane',
            'data-kind': item.media.kind,
            'data-free': isFree(item.media) || undefined,
            'aria-label': tileLabel(item),
            draggable: false,
          }
          const content = (
            <>
              <span className="plane__frame">
                <span className="plane__media" data-kind={item.media.kind} data-free={isFree(item.media) || undefined}>
                  <PlaneMedia
                    item={item}
                    videoRef={(el) => {
                      videos.current[i] = el
                    }}
                  />
                </span>
              </span>
              <span className="plane__caption" aria-hidden="true">
                <span className="plane__title">
                  {item.title}
                  {/* The creative portfolio is another site: its title ends with the link arrow the header's has. */}
                  {isExternalTile(item) && <ExternalMark />}
                </span>
                <span className="plane__line">{item.line}</span>
              </span>
            </>
          )
          return (
            <li key={item.id} className="work-grid__item" data-id={item.id}>
              {isExternalTile(item) ? (
                <a
                  href={path}
                  {...tile}
                  onClick={(e) => {
                    if (!isPlainClick(e)) return
                    e.preventDefault()
                    leaveSite(path)
                  }}
                >
                  {content}
                </a>
              ) : (
                <PageLink to={path} {...tile}>
                  {content}
                </PageLink>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

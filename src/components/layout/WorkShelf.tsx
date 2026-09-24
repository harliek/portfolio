import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { MOTION } from '../../config/motion'
import { PROJECTS, projectPath, type ProjectId } from '../../content/projects'
import { prefetchRoute } from '../../routes'
import { ResponsiveImage } from '../media/ResponsiveImage'

interface WorkShelfProps {
  id: string
  open: boolean
  /** Render the thumbnails (false until the visitor shows interest in Work, so a closed shelf downloads nothing). */
  thumbs: boolean
  /** The project whose case study is on screen (active indicator). */
  activeId?: ProjectId
  /** Close without moving focus (a link was followed). */
  onNavigate: () => void
  /** Close and return focus to the Work control. */
  onClose: () => void
}

const THUMB_SIZES = '64px'

/**
 * The Work shelf: a horizontal row of the six projects under the header,
 * each an ordinary link with a small 3:4 thumbnail, the project name and a
 * short category, plus a visible Close control. It reveals horizontally
 * over ~250ms (src/config/motion.ts, MOTION.shelf) while the Work control
 * shifts slightly left; the page itself never moves.
 *
 * Wide screens: all six fit within the content width as small cards (name
 * and category on one line each), with Close above the row. Intermediate
 * widths: a deliberately scrollable row with edge fades that show more is
 * there. Phones: a simple two-column menu. Escape, the Close button and a
 * click outside close it (Header.tsx); focus returns to Work.
 */
export function WorkShelf({ id, open, thumbs, activeId, onNavigate, onClose }: WorkShelfProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  // Overflow cues for the scrollable row: fades appear on the side(s) with more items.
  useEffect(() => {
    const el = viewportRef.current
    if (!el || !open) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      el.dataset.moreStart = String(el.scrollLeft > 2)
      el.dataset.moreEnd = String(max > 2 && el.scrollLeft < max - 2)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    // Entries slide in with a transform, which briefly widens the scroll area.
    el.addEventListener('transitionend', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      el.removeEventListener('transitionend', update)
      ro.disconnect()
    }
  }, [open])

  // Bring the current project into view in the scrollable row (horizontally
  // only: the page itself must not scroll when the shelf opens).
  useEffect(() => {
    const vp = viewportRef.current
    if (!open || !activeId || !vp || vp.scrollWidth <= vp.clientWidth) return
    const entry = vp.querySelector<HTMLElement>('[aria-current="page"]')?.closest('li')
    if (!entry) return
    const e = entry.getBoundingClientRect()
    const v = vp.getBoundingClientRect()
    if (e.left < v.left) vp.scrollLeft += e.left - v.left
    else if (e.right > v.right) vp.scrollLeft += e.right - v.right + 24
  }, [open, activeId])

  const style = {
    '--shelf-dur': `${MOTION.shelf.durationMs}ms`,
    '--shelf-offset': `${MOTION.shelf.itemOffsetPx}px`,
  } as CSSProperties

  return (
    <div id={id} className="work-shelf" data-open={open || undefined} inert={!open} style={style}>
      <div className="shell work-shelf__inner">
        <div ref={viewportRef} className="work-shelf__viewport">
          <ul className="work-shelf__list" role="list">
            {PROJECTS.map((p, i) => {
              const path = projectPath(p)
              const current = p.id === activeId
              return (
                <li key={p.id} className="work-shelf__entry" style={{ '--i': i, '--shelf-stagger': `${MOTION.shelf.itemStaggerMs}ms` } as CSSProperties}>
                  <Link
                    to={path}
                    className="shelf-item"
                    aria-current={current ? 'page' : undefined}
                    onClick={onNavigate}
                    onPointerEnter={() => prefetchRoute(path)}
                    onFocus={() => prefetchRoute(path)}
                  >
                    <span className="shelf-item__thumb">
                      {thumbs && <ResponsiveImage image={p.cover} sizes={THUMB_SIZES} decorative fit="cover" />}
                    </span>
                    <span className="shelf-item__text">
                      <span className="shelf-item__name">{p.name}</span>
                      <span className="shelf-item__category">{p.category}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <button type="button" className="work-shelf__close" onClick={onClose}>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Close
        </button>
      </div>
    </div>
  )
}

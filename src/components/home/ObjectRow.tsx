import { useLayoutEffect, useRef, type CSSProperties, type MouseEvent } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { CAROUSEL } from '../../config/carousel'
import { accentVars } from '../../content/accents'
import { CAROUSEL_ITEMS, OBJECT_SIZE } from '../../content/carousel'
import { openProject } from '../transition/projectTransition'
import { CarouselObject, isPlainClick, objectBox, warm } from './CarouselObject'
import { notePosition, persistPosition, recallPosition } from './carouselMemory'

/**
 * Size factor for the row: from the window height (as the arc), but never
 * so large that the widest object (the monitor or laptop) hides the next
 * one on a narrow screen.
 */
function rowFactor() {
  const { minU, maxU } = CAROUSEL.row
  const { heightOffset, heightSpan } = CAROUSEL.size
  const widest = Math.max(OBJECT_SIZE.monitor.width ?? 380, OBJECT_SIZE.laptop.width ?? 380)
  const fit = (window.innerWidth - 96) / widest
  return Math.max(minU, Math.min(maxU, (window.innerHeight - heightOffset) / heightSpan, fit))
}

/**
 * The static, horizontally swipeable row (touch and coarse pointers,
 * windows narrower than CAROUSEL.arcMinWidth, and reduced motion): the same
 * seven objects in the same order with About first at the content edge.
 * Nothing moves on its own and nothing depends on hover. Every object shows
 * its contribution sentence beneath it (the touch equivalent of the hover
 * state), and one tap opens it directly. Horizontal swipes scroll the row;
 * vertical gestures scroll the page. Back restores the row's scroll offset.
 */
export function ObjectRow() {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const { key: locationKey } = useLocation()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const items = itemRefs.current.slice(0, CAROUSEL_ITEMS.length)
    const measure = () => {
      const u = rowFactor()
      scroller.style.setProperty('--u', u.toFixed(4))
      const boxes = CAROUSEL_ITEMS.map((item) => objectBox(item, u))
      scroller.style.setProperty('--row-h', `${Math.max(...boxes.map((b) => b.boxH)).toFixed(2)}px`)
      boxes.forEach((b, i) => {
        items[i]?.style.setProperty('--w', `${b.boxW.toFixed(2)}px`)
        items[i]?.style.setProperty('--h', `${b.boxH.toFixed(2)}px`)
        items[i]?.style.setProperty('--img-h', `${b.imgH.toFixed(2)}px`)
      })
    }
    measure()
    const saved = recallPosition(locationKey, navigationType)
    scroller.scrollLeft = saved?.row ?? 0
    const save = () => {
      notePosition(locationKey, { row: scroller.scrollLeft })
      persistPosition(locationKey)
    }
    const onScroll = () => notePosition(locationKey, { row: scroller.scrollLeft })
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pagehide', save)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => {
      save()
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', save)
      window.removeEventListener('resize', onResize)
    }
  }, [locationKey, navigationType])

  const onOpen = (e: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    const source = itemRefs.current[i]?.querySelector<HTMLElement>('[data-cover-source]') ?? null
    openProject({ path: CAROUSEL_ITEMS[i].path, source, navigate })
  }

  return (
    <div ref={scrollerRef} className="hrow">
      <ul className="hrow__list" role="list">
        {CAROUSEL_ITEMS.map((item, i) => (
          <li
            key={item.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            className="hrow__item hobj"
            data-index={i}
            data-kind={item.kind}
            style={{ ...accentVars(item.id), '--item-min': `${CAROUSEL.row.minItemWidth}px` } as CSSProperties}
          >
            <a
              href={item.path}
              className="hobj__link hrow__link"
              draggable={false}
              aria-label={item.label}
              aria-describedby={`hrow-desc-${item.id}`}
              onClick={(e) => onOpen(e, i)}
              onPointerEnter={() => warm(item.path)}
              onPointerDown={() => warm(item.path)}
              onFocus={() => warm(item.path)}
            >
              <span className="hrow__object">
                <span className="hrow__box">
                  <CarouselObject item={item} priority={i < 3} />
                </span>
              </span>
              <span className="hrow__sentence" id={`hrow-desc-${item.id}`} data-hit="">
                {item.sentence}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { CAROUSEL } from '../../config/carousel'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ObjectArc } from './ObjectArc'
import { ObjectRow } from './ObjectRow'

/**
 * The homepage's PNG object carousel, in one of two forms:
 *
 * - the moving concave arc (ObjectArc) for hover-capable fine pointers with
 *   motion allowed, in windows at least CAROUSEL.arcMinWidth wide;
 * - the static, swipeable row (ObjectRow) for touch and coarse pointers,
 *   narrower windows and reduced motion (the OS setting or the footer's
 *   "Reduce motion"), where every object and its sentence is reachable
 *   without waiting for a rotation.
 */
export function HomeCarousel() {
  const reduced = useReducedMotion()
  const touch = useMediaQuery(CAROUSEL.touchQuery)
  const narrow = useMediaQuery(`(max-width: ${CAROUSEL.arcMinWidth - 0.02}px)`)
  return reduced || touch || narrow ? <ObjectRow /> : <ObjectArc />
}

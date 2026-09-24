import { useEffect } from 'react'
import { ACCENTS } from '../../content/accents'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** Mouse and trackpad only: touch, pens without hover and coarse pointers get no pool. */
const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** How slowly the pool follows: the time (ms) it takes to cover about 63% of the remaining distance. */
const FOLLOW_MS = 520
/** Its fade in and out (ms); about.css uses the same value. */
const FADE_MS = 700

/**
 * About's light: one broad, soft pool of lavender light in the room, behind
 * all of the page's content, that drifts slowly after the mouse pointer.
 *
 * It lives in the background set's layer rather than the page's: a fixed
 * element appended to <body> right after the app root, so it paints above
 * the background video (StageBackground, z-index 0, earlier in the tree)
 * and below the page, header and footer (z-index 1 and up), and its
 * `screen` blend lifts the room itself. It never takes pointer events,
 * never covers text, and has no edge (a radial gradient that fades to
 * nothing). It appears only after the first mouse movement (fading in where
 * the pointer is), fades out when the pointer leaves the window, and fades
 * out when the page is left.
 *
 * Nothing in React re-renders on movement; one animation-frame loop runs
 * only while the pool is still catching up with the pointer. Off entirely
 * (nothing created) for reduced motion and for touch or coarse pointers.
 * Decorative: aria-hidden.
 */
export function AboutLight() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useReducedMotion()
  const enabled = fine && !reduced

  useEffect(() => {
    if (!enabled) return
    const layer = document.createElement('div')
    layer.className = 'about-light'
    layer.setAttribute('aria-hidden', 'true')
    layer.style.setProperty('--accent-rgb', ACCENTS.about.rgb)
    layer.style.setProperty('--about-light-fade', `${FADE_MS}ms`)
    const pool = document.createElement('div')
    pool.className = 'about-light__pool'
    layer.append(pool)
    document.body.append(layer)

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let shown = false
    let frame = 0
    let last = 0

    const place = () => {
      pool.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const k = 1 - Math.exp(-dt / FOLLOW_MS)
      x += (tx - x) * k
      y += (ty - y) * k
      place()
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      if (!shown) {
        // Appear where the pointer is (fading in), rather than sliding in from elsewhere.
        shown = true
        x = tx
        y = ty
        place()
        layer.dataset.on = ''
        return
      }
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    const hide = () => {
      shown = false
      cancelAnimationFrame(frame)
      frame = 0
      delete layer.dataset.on
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', hide)
    window.addEventListener('blur', hide)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
      cancelAnimationFrame(frame)
      // Leaving About (or the preference changed): fade out, then remove.
      delete layer.dataset.on
      window.setTimeout(() => layer.remove(), FADE_MS)
    }
  }, [enabled])

  return null
}

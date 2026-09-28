import { useEffect, useRef } from 'react'
import { MOTION } from '../../config/motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { pointerOver } from './pointerContext'

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/** The same colour at zero alpha, so the tail fades without a dark fringe (the tokens are written rgb(r g b)). */
const clear = (color: string) => (/^rgb\([^/]*\)$/.test(color) ? color.replace(/\)$/, ' / 0)') : 'transparent')

interface Point {
  x: number
  y: number
  t: number
}

/**
 * A short glowing trail that stays attached to the mouse pointer: a
 * crisp, near-white luminous core inside a soft blue violet glow (three halo
 * layers added together, so the light is brightest at the centre line),
 * tapering to nothing at its tail. Points expire after MOTION.trail.lifeMs (lengthened at Harlie's
 * request, "the light trail a bit longer"), so the tail retracts into the ball of light and the
 * whole trail is gone shortly after the pointer stops. Its
 * length is capped (the tail is cut, never a long straight streak). Nothing
 * detached: no sparkles, no particles, no blobs.
 *
 * Its head sits under the blue violet ball of light that stands in for the system
 * cursor (CustomCursor, which draws exactly at the pointer), and it fades out
 * while that light's outline wraps a navigation item or "Watch the film"
 * (cursor.css). It is decoration, so it passes beneath the page (Harlie's brief, 2026-09-28: "Keep decorative
 * lighting underneath functional UI"; stage.css): copy, fields, buttons, focus rings, the header and the footer are
 * drawn over it, and only the ball is above them. Over a form, its fields and controls it nearly disappears, over
 * copy it is dimmer and shorter (pointerContext.ts, the same reading as the ball's and the soft light's). The canvas
 * never takes pointer events, so clicks and text selection are untouched
 * (the trail also hides while a mouse button is held, e.g. during a selection). Nothing in React
 * re-renders on movement; one animation-frame loop runs only while the
 * trail is visible. Off for touch and coarse pointers, under reduced motion
 * (the operating system setting), and while anything is fullscreen.
 * It is never the only sign that something is clickable.
 */
export function PointerTrail() {
  const fine = useMediaQuery(FINE_POINTER)
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enabled = fine && !reduced

  useEffect(() => {
    const canvas = canvasRef.current
    if (!enabled || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cfg = MOTION.trail
    // Every colour is a token of the pointer's light (tokens.css), so one edit there recolours the trail too.
    const styles = getComputedStyle(document.documentElement)
    const core = styles.getPropertyValue('--trail-core').trim()
    const glow = styles.getPropertyValue('--trail-glow').trim()
    const halo = styles.getPropertyValue('--trail-halo').trim()
    if (!core || !glow || !halo) return

    let points: Point[] = []
    let lastTarget: EventTarget | null = null
    let dimTarget = 1
    let lengthTarget: number = cfg.lengthPx
    let dim = 1
    let maxLength: number = cfg.lengthPx
    let frame = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    /** Newest-last points, cut to `maxLength` px along the path (interpolating the tail). */
    const clip = (now: number): Point[] => {
      const live = points.filter((p) => now - p.t < cfg.lifeMs)
      if (live.length < 2) return live
      const out: Point[] = [live[live.length - 1]]
      let length = 0
      for (let i = live.length - 1; i > 0; i--) {
        const a = live[i]
        const b = live[i - 1]
        const seg = Math.hypot(a.x - b.x, a.y - b.y)
        if (length + seg >= maxLength) {
          const k = seg > 0 ? (maxLength - length) / seg : 0
          out.unshift({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, t: b.t })
          return out
        }
        length += seg
        out.unshift(b)
      }
      return out
    }

    /** A tapered ribbon (0 width at the tail, `width` at the pointer) filled with a tail→head fade. */
    const ribbon = (path: Point[], width: number, color: string, alpha: number) => {
      const n = path.length
      const left: [number, number][] = []
      const right: [number, number][] = []
      for (let i = 0; i < n; i++) {
        const prev = path[Math.max(0, i - 1)]
        const next = path[Math.min(n - 1, i + 1)]
        let nx = -(next.y - prev.y)
        let ny = next.x - prev.x
        const len = Math.hypot(nx, ny) || 1
        nx /= len
        ny /= len
        const w = (width / 2) * (i / (n - 1))
        left.push([path[i].x + nx * w, path[i].y + ny * w])
        right.push([path[i].x - nx * w, path[i].y - ny * w])
      }
      const tail = path[0]
      const head = path[n - 1]
      const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
      gradient.addColorStop(0, clear(color))
      gradient.addColorStop(1, color)
      ctx.globalAlpha = alpha
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(left[0][0], left[0][1])
      for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1])
      // Round the head so the ribbon meets the pointer without a flat end.
      ctx.arc(head.x, head.y, width / 2, Math.atan2(left[n - 1][1] - head.y, left[n - 1][0] - head.x), Math.atan2(right[n - 1][1] - head.y, right[n - 1][0] - head.x), true)
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1])
      ctx.closePath()
      ctx.fill()
    }

    const draw = () => {
      frame = 0
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
      const now = performance.now()
      // Ease towards the target brightness and length (no pops at element edges).
      dim += (dimTarget - dim) * 0.35
      maxLength += (lengthTarget - maxLength) * 0.35
      const path = clip(now)
      if (path.length < 2 || document.fullscreenElement) {
        points = points.filter((p) => now - p.t < cfg.lifeMs)
        if (points.length > 0) frame = requestAnimationFrame(draw)
        return
      }
      const newest = points[points.length - 1]
      // The whole trail also fades as the pointer rests.
      const rest = Math.max(0, 1 - (now - newest.t) / cfg.lifeMs)
      const a = dim * (0.35 + 0.65 * rest)
      // Halo layers add up (brightest along the centre); the core is laid on top, crisp.
      ctx.globalCompositeOperation = 'lighter'
      ribbon(path, cfg.haloWidth, halo, 0.22 * a)
      ribbon(path, cfg.haloWidth * 0.55, halo, 0.34 * a)
      ribbon(path, cfg.haloWidth * 0.28, glow, 0.5 * a)
      ctx.globalCompositeOperation = 'source-over'
      ribbon(path, cfg.coreWidth, core, a)
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || document.fullscreenElement) return
      // A held button (text selection, dragging): no trail.
      if (e.buttons !== 0) {
        points = []
        return
      }
      if (e.target !== lastTarget) {
        lastTarget = e.target
        const over = pointerOver(e.target instanceof Element ? e.target : null)
        dimTarget = over === 'text' ? cfg.overText : over ? cfg.overControl : 1
        lengthTarget = over ? cfg.lengthPx * cfg.shortShare : cfg.lengthPx
      }
      const now = performance.now()
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : []
      const samples = events.length > 0 ? events : [e]
      for (const s of samples) {
        const last = points[points.length - 1]
        if (!last || Math.abs(last.x - s.clientX) + Math.abs(last.y - s.clientY) > 0.5) points.push({ x: s.clientX, y: s.clientY, t: now })
        else last.t = now
      }
      if (points.length > 48) points = points.slice(-48)
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const onLeave = () => {
      points = []
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onLeave, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled])

  if (!enabled) return null
  return <canvas ref={canvasRef} className="pointer-trail" aria-hidden="true" />
}

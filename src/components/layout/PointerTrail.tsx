import { useEffect, useRef } from 'react'
import { MOTION } from '../../config/motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/** Elements over which the trail is dimmed (a cheap tag check, no layout reads). */
const TEXT_TAGS = new Set(['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'DT', 'DD', 'FIGCAPTION', 'SPAN', 'A', 'LABEL', 'BLOCKQUOTE', 'EM', 'STRONG', 'SUMMARY'])

interface Point {
  x: number
  y: number
}

const FINE_POINTER = '(hover: hover) and (pointer: fine)'

/**
 * A subtle glowing line trailing the real mouse pointer: a thin ivory core
 * with a soft violet halo, about 34px long, fading within ~190ms after the
 * pointer stops. The system cursor stays; the canvas never takes pointer
 * events; nothing in React re-renders on movement (points live in a ref and
 * one animation frame loop runs only while the line is visible).
 *
 * Off for touch and coarse pointers, under reduced motion (OS or the
 * footer toggle), and while anything is shown fullscreen (e.g. a video).
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
    const styles = getComputedStyle(document.documentElement)
    const core = styles.getPropertyValue('--trail-core').trim() || 'rgb(238 234 226)'
    const halo = styles.getPropertyValue('--trail-halo').trim() || 'rgb(165 140 240)'

    let points: Point[] = []
    let lastMove = 0
    let dim = 1
    let frame = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    /** Keeps only the newest stretch of the path, `lengthPx` long. */
    const trim = () => {
      let length = 0
      for (let i = points.length - 1; i > 0; i--) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
        if (length > cfg.lengthPx) {
          points = points.slice(i - 1)
          return
        }
      }
    }

    const stroke = (width: number, color: string, alpha: number) => {
      const n = points.length
      for (let i = 1; i < n; i++) {
        // Tapers from transparent at the tail to full at the pointer.
        ctx.globalAlpha = alpha * (i / (n - 1))
        ctx.lineWidth = width * (0.45 + 0.55 * (i / (n - 1)))
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.moveTo(points[i - 1].x, points[i - 1].y)
        ctx.lineTo(points[i].x, points[i].y)
        ctx.stroke()
      }
    }

    const draw = () => {
      frame = 0
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const age = performance.now() - lastMove
      const life = 1 - age / cfg.fadeMs
      if (life <= 0 || points.length < 2 || document.fullscreenElement) {
        points = points.slice(-1)
        return
      }
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      const a = life * dim
      stroke(cfg.haloWidth, halo, 0.16 * a)
      stroke(cfg.haloWidth * 0.45, halo, 0.28 * a)
      stroke(cfg.coreWidth, core, 0.9 * a)
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || document.fullscreenElement) return
      const target = e.target as Element | null
      dim = target && TEXT_TAGS.has(target.tagName) ? cfg.overText : 1
      const last = points[points.length - 1]
      if (!last || Math.abs(last.x - e.clientX) + Math.abs(last.y - e.clientY) > 0.5) points.push({ x: e.clientX, y: e.clientY })
      trim()
      lastMove = performance.now()
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const onLeave = () => {
      points = []
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled])

  if (!enabled) return null
  return <canvas ref={canvasRef} className="pointer-trail" aria-hidden="true" />
}

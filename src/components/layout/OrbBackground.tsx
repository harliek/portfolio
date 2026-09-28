import { useEffect, useRef } from 'react'

/**
 * Harlie's "Orb" shader: a static WebGL1 picture (its time is fixed at zero) drawn with one fullscreen triangle, no
 * libraries, behind the page's content. Since the case studies and About took the Nebula Drift ground (CaseGround) and
 * the homepage its film, it is `active` only on the remaining pages: the not-found page and a route error (2026-09-28).
 * The only movement is the cursor's spotlight, which follows a mouse or trackpad and fades in and out; the frame loop
 * redraws only while that changes and stops when the tab is hidden. The canvas is at most 2x the CSS size. Without
 * WebGL the quiet ground below it shows instead. Decorative: aria-hidden.
 *
 * The shader and its renderer (orbRenderer.ts) are a separate chunk, loaded
 * only once `active`, so pages that never show the orb do not download it.
 * If that chunk cannot be loaded, the ground shows as it does without WebGL.
 */
export function OrbBackground({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    // Set on cleanup: a renderer that arrives after `active` turns false (or the page is left) is not started.
    let cancelled = false
    let stop: (() => void) | null = null
    import('./orbRenderer')
      .then(({ startOrb }) => {
        if (!cancelled) stop = startOrb(canvas)
      })
      .catch(() => {
        /* Not loaded (offline, an old tab after a deploy): the canvas stays transparent. */
      })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [active])

  return (
    <div className="orb-bg" aria-hidden="true" data-active={active || undefined}>
      <canvas ref={canvasRef} className="orb-bg__canvas" />
    </div>
  )
}

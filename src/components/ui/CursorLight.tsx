import { useEffect, useRef } from 'react'

/**
 * The light around the cursor (Harlie's request, after the Orb shader's
 * spotlight): a soft blue violet circle (tokens.css --pointer-light-rgb), 0.14 of the window's shorter side, that
 * follows a mouse or trackpad and fades in with movement and out when the
 * pointer leaves the window. It lies over the homepage film and over the
 * black ground of the case studies (styles in stage.css, .cursor-light);
 * its container must fill the window from its top left corner. Moved by
 * transform only, at most once a frame. Touch screens never show it.
 * Decorative: aria-hidden.
 *
 * `active` false (the case studies' ground kept mounted but hidden on the homepage, CaseGround) lets go of the pointer
 * altogether: no listener runs while it cannot be seen (Harlie's brief, 2026-09-28: no work for hidden decoration).
 */
export function CursorLight({ className, active = true }: { className?: string; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const light = ref.current
    if (!light || !active || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    let x = 0
    let y = 0
    const place = () => {
      frame = 0
      light.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(place)
      if (!('on' in light.dataset)) {
        place()
        light.dataset.on = ''
      }
    }
    const off = () => delete light.dataset.on
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) off()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onOut)
    window.addEventListener('blur', off)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', off)
      // Shown again only from the pointer's next move, where it then is.
      off()
    }
  }, [active])

  return <div ref={ref} className={['cursor-light', className].filter(Boolean).join(' ')} aria-hidden="true" />
}

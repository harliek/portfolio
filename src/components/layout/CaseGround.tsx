import { lazy, Suspense, useEffect, useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { CursorLight } from '../ui/CursorLight'

/** The field's code (WebGL) loads only with the pages that show it. */
const loadField = () => import('../ui/originkit/nebula-drift').catch(() => ({ default: () => <></> }))
const NebulaDrift = lazy(loadField)

/** How long after the first arrival the field starts (ms): its setup is a heavy moment, kept clear of the page's arrival. */
const START_AFTER = 1100

/** It fills the ground (stage.css .case-ground). */
const FILL = { position: 'absolute', inset: 0 } as const

/**
 * The ground of the case studies and About (Harlie's request, 2026-09-27): Originkit's Nebula Drift in Harlie's
 * preset (2026-09-28), black until the pointer moves, then a deep navy flow with a cyan glint along its path that
 * settles back to black, with the cursor's soft blue violet light over it. Touch screens have no pointer to show
 * it, so there the ground is just black and the field (WebGL) never starts. Mounted with the first visit to one of
 * those pages and then kept (hidden on the others, where it rests), so moving between pages never restarts it. On
 * that first visit it starts once the page has arrived (its setup, compiling its shaders, would otherwise catch the
 * arrival's animation) and fades in over the black. Decorative. Reduced motion: the field holds still, so stays black.
 *
 * Its flow and the soft light step back while the pointer is on a form, a field, a button or copy (Harlie's brief,
 * 2026-09-28: decorative lighting beneath functional UI), through .case-ground__quiet and the light's brightness
 * (stage.css, html[data-pointer-over] from CustomCursor); at full strength everywhere else. While hidden (the
 * homepage), the soft light stops following the pointer (2026-09-28).
 */
export function CaseGround({ on }: { on: boolean }) {
  const [visited, setVisited] = useState(on)
  // The first visit mounts it (adjusting state while rendering, not in an effect).
  if (on && !visited) setVisited(true)
  const coarse = useMediaQuery('(pointer: coarse)')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!visited || ready || coarse) return
    void loadField()
    let idle = 0
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 800 })
      else setReady(true)
    }, START_AFTER)
    return () => {
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback(idle)
    }
  }, [visited, ready, coarse])
  if (!visited) return null
  return (
    <div className="case-ground" data-off={on ? undefined : ''} aria-hidden="true">
      {ready && !coarse && (
        <div className="case-ground__field">
          <div className="case-ground__quiet">
            <Suspense fallback={null}>
              <NebulaDrift style={FILL} />
            </Suspense>
          </div>
        </div>
      )}
      <CursorLight active={on} />
    </div>
  )
}


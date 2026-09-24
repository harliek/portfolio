import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export function LiquidEffectAnimation({ imageUrl = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80', className }: { imageUrl?: string; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const host = hostRef.current
    if (!host || reduced) return
    // Each effect owns its canvas, including StrictMode's setup/cleanup cycle.
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y'
    host.append(canvas)
    let cancelled = false
    let release: (() => void) | undefined
    void import('threejs-components/build/backgrounds/liquid1.min.js').then(async ({ default: createLiquid }) => {
      if (cancelled) return
      const app = createLiquid(canvas)
      let disposed = false
      const dispose = () => {
        if (disposed) return
        disposed = true
        const { material, geometry } = app.liquidPlane
        material.map?.dispose()
        material.envMap?.dispose()
        material.dispose()
        geometry.dispose()
        app.dispose()
      }
      // Allow an in-flight texture load to finish before releasing its resources.
      let loading = true
      release = () => { if (!loading) dispose() }
      app.setRain(false)
      app.liquidPlane.material.metalness = .75
      app.liquidPlane.material.roughness = .25
      app.liquidPlane.uniforms.displacementScale.value = 5
      try { await app.loadImage(imageUrl) }
      finally { loading = false; if (cancelled) dispose() }
    }).catch(() => { release?.(); canvas.remove() })
    return () => { cancelled = true; release?.(); canvas.remove() }
  }, [imageUrl, reduced])
  return <div ref={hostRef} aria-hidden="true" className={cn('relative h-full w-full overflow-hidden', className)} style={{ backgroundImage: `url("${imageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
}

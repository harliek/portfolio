import { useState, type ReactNode } from 'react'
import SmoothScrollSlider from './smooth-scroll-slider'
import NeonBorder from './neon-border'
import GlowBorder from './glow-border'
import DotCursor from './dot-cursor'
import MouseEffects from './click-effects'
import VectorWordmark from './vector-wordmark'
import TypeSequence from './type-sequence'
import ParticleDrift from './particle-drift'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const names = ['Slider', 'Neon border', 'Glow border', 'Dot cursor', 'Click effects', 'Wordmark', 'Type sequence', 'Particles'] as const
export default function OriginkitDemos() {
  const [active, setActive] = useState<(typeof names)[number]>('Wordmark')
  const reduced = useReducedMotion()
  const examples: Record<(typeof names)[number], ReactNode> = {
    Slider: <SmoothScrollSlider direction="left" images={['/media/img/merch-catalog-800.avif', '/media/img/aristocracy-poster-960.jpg', '/media/img/sheet-returned-800.avif']} slideWidth={280} slideHeight={280} style={{ height: '100%' }} />,
    'Neon border': <NeonBorder color="#bd9bff" style={{ width: '80%', height: '80%', margin: 'auto' }} />,
    'Glow border': <GlowBorder glowColor="#bd9bff" rounded={24} style={{ width: '80%', height: '80%', margin: 'auto' }} />,
    'Dot cursor': <DotCursor labelText="Move your pointer" labelFont={{ fontSize: 28 }} />,
    'Click effects': <MouseEffects interactionMode="rings" color="#bd9bff" labelText="Click to preview" labelFont={{ fontSize: 28 }} />,
    Wordmark: <VectorWordmark text="PORTFOLIO" accent="#bd9bff" handles={{ labels: false }} />,
    'Type sequence': <TypeSequence prefix="" texts={['AI product', 'Strategy', 'Operations']} font={{ fontSize: 48, fontWeight: 700 }} />,
    Particles: <ParticleDrift density={100} accentColor="#bd9bff" />,
  }
  return <section className="py-12"><h2 className="mb-6 text-3xl">Originkit effects</h2><div className="mb-6 flex flex-wrap gap-3" aria-label="Choose an effect">{names.map(name => <button key={name} type="button" aria-pressed={active === name} onClick={() => setActive(name)} className="rounded-lg border border-white/30 px-4 py-2">{name}</button>)}</div><div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-white/20">{reduced ? <p>Animation preview disabled by your reduced-motion preference.</p> : <div key={active} className="relative h-full w-full">{examples[active]}</div>}</div></section>
}

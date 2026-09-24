// Tailwind utilities load only with this development-only demo route (never in the production site).
import '../../styles/utilities.css'
import OriginkitDemos from './originkit/demo'
import { GlowCard } from './spotlight-card'
import { LiquidEffectAnimation } from './liquid-effect-animation'
import { ContainerScroll } from './container-scroll-animation'
const photo = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80'
export function Default() {
  return <div className="flex flex-wrap justify-center gap-8 py-12">{(['blue', 'purple', 'green'] as const).map(color => <GlowCard key={color} glowColor={color}><img src={photo} alt="Mountain beneath a starry sky" className="h-full w-full rounded-xl object-cover" /></GlowCard>)}</div>
}
export function DemoOne() { return <div className="h-[420px] overflow-hidden rounded-2xl"><LiquidEffectAnimation /></div> }
export function HeroScrollDemo() { return <ContainerScroll titleComponent={<h2 className="text-3xl">Scroll perspective</h2>}><img src="/media/img/merch-catalog-800.avif" alt="Merchandising catalog prototype" className="block w-full" /></ContainerScroll> }
export default function ComponentDemos() {
  return <main className="mx-auto max-w-6xl px-6 py-12"><a href="/">Back to portfolio</a><h1 className="my-8 text-4xl">Motion components</h1><h2 className="text-2xl">Pointer spotlight</h2><Default /><h2 className="mb-6 text-2xl">Liquid surface</h2><DemoOne /><HeroScrollDemo /><OriginkitDemos /></main>
}

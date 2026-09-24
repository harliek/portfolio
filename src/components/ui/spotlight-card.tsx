import { useRef, type CSSProperties, type ReactNode, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import './spotlight-card.css'

export interface GlowCardProps {
  children?: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean
}
const colors = { blue: 220, purple: 280, green: 120, red: 0, orange: 30 }
const sizes = { sm: 'w-48 h-64', md: 'w-64 h-80', lg: 'w-80 h-96' }
type GlowStyle = CSSProperties & { '--glow-hue': number }

export function GlowCard({ children, className, glowColor = 'blue', size = 'md', width, height, customSize = false }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    ref.current?.style.setProperty('--glow-x', `${event.clientX - rect.left}px`)
    ref.current?.style.setProperty('--glow-y', `${event.clientY - rect.top}px`)
  }
  const style: GlowStyle = { '--glow-hue': colors[glowColor], width, height }
  return <div ref={ref} onPointerMove={move} style={style} className={cn('spotlight-card relative grid gap-4 rounded-2xl p-4', !customSize && sizes[size], className)}>
    <span className="spotlight-card__halo" aria-hidden="true" />
    {children}
  </div>
}

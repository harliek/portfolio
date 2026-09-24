import { useRef, type ReactNode } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export function ContainerScroll({ titleComponent, children, className }: { titleComponent: ReactNode; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotate = useTransform(scrollYProgress, [0, 1], [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [.94, 1])
  const translate = useTransform(scrollYProgress, [0, 1], [24, 0])
  return <section ref={ref} className={cn('relative mx-auto w-full max-w-5xl px-4 py-12 md:py-20', className)} style={{ perspective: '1000px' }}>
    <motion.div style={{ y: reduced ? 0 : translate }} className="mb-8 text-center">{titleComponent}</motion.div>
    <motion.div style={{ rotateX: reduced ? 0 : rotate, scale: reduced ? 1 : scale, transformOrigin: 'center bottom' }} className="overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-2xl">{children}</motion.div>
  </section>
}

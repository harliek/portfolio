/**
 * Single source of truth for GSAP motion values. CSS-side durations live in
 * src/styles/tokens.css (--dur-*). Easing is perceptually consistent with the
 * CSS curves, not mathematically identical to them.
 */
export const MOTION = {
  feedback: { duration: 0.15, pressScale: 0.98 },
  enterSmall: { duration: 0.45, y: 10, ease: 'power2.out' },
  enterSection: { duration: 0.55, y: 14, ease: 'power2.out' },
  stagger: { each: 0.06, max: 0.18 },
  route: { duration: 0.18, ease: 'power1.out', reducedMax: 0.1 },
  carouselSnap: { duration: 0.52, ease: 'power3.out' },
  sharedTransition: { duration: 0.52, ease: 'power3.inOut', neighbourFade: 0.15, align: 0.26 },
  label: { duration: 0.16, ease: 'power1.out' },
  mediaFade: { duration: 0.2, ease: 'power1.out' },
  dialog: { duration: 0.18, scaleFrom: 0.985, ease: 'power2.out' },
  /** ScrollTrigger start position for once-only entrances. */
  enterStart: 'top 85%',
} as const

/** Clamp a stagger so a group never takes longer than MOTION.stagger.max. */
export const staggerFor = (count: number) =>
  count <= 1 ? 0 : Math.min(MOTION.stagger.each, MOTION.stagger.max / (count - 1))

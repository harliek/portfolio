import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * The site's one GSAP entry point: ScrollTrigger is registered here once,
 * and every component imports gsap and ScrollTrigger from this module (never
 * from 'gsap' directly), so the plugin is always registered before use.
 */
gsap.registerPlugin(ScrollTrigger)

/** The motion language (brief v16): slow, cinematic, no overshoot. */
export const EASE = {
  /** Spatial moves: frames expanding, planes receding. */
  move: 'power3.inOut',
  /** Arrivals: things settling into place. */
  arrive: 'power2.out',
} as const

export { gsap, ScrollTrigger }

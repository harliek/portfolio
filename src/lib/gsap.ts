import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * The site's one GSAP entry point: ScrollTrigger is registered here once,
 * and every component imports gsap and ScrollTrigger from this module (never
 * from 'gsap' directly), so the plugin is always registered before use.
 */
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

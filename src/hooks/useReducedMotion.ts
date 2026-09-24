import { motionReduced, useMotionPreference } from './useMotionPreference'

/**
 * Reduced motion as decided by the site-wide preference (the OS setting,
 * or the footer's "Reduce motion" toggle when the visitor has used it).
 */
export function useReducedMotion(): boolean {
  return useMotionPreference().reduced
}

/** Non-hook check for event handlers and effects. */
export const prefersReducedMotion = () => (typeof window !== 'undefined' ? motionReduced() : false)

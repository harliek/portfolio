import { motionReduced, useMotionPreference } from './useMotionPreference'

/** Reduced motion as set in the operating system (followed live). */
export function useReducedMotion(): boolean {
  return useMotionPreference().reduced
}

/** Non-hook check for event handlers and effects. */
export const prefersReducedMotion = () => (typeof window !== 'undefined' ? motionReduced() : false)

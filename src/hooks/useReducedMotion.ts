import { useMediaQuery } from './useMediaQuery'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY)
}

/** Non-hook check for event handlers and effects. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches

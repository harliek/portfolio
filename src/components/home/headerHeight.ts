/**
 * The site header's height, read once from its one definition (tokens.css --header-height) instead of a copy of its
 * 61px here and in Home.tsx (Harlie's brief, 2026-09-28, code cleanup: no duplicated magic numbers). The token is the
 * same at every width, so it is read the first time it is needed and kept.
 */
let cached = 0

export function headerHeight() {
  if (!cached) cached = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 61
  return cached
}

import type { CSSProperties } from 'react'

/**
 * One accent per carousel item (the latest brief, section 10). Used for the
 * carousel glow and caption, and carried into that project's page through
 * active section markers, interactive link and button hover states, media
 * focus and hover edges, and the next-project link. Never for whole
 * paragraphs of ordinary text.
 */
export const ACCENTS = {
  /** Lavender. */
  about: { hex: '#c9b8ff', rgb: '201 184 255' },
  /** Light rose, derived from the burgundy artwork. */
  'merchandising-platform': { hex: '#f2b7c6', rgb: '242 183 198' },
  /** Softened lime. */
  'cafepress-uk': { hex: '#cde47e', rgb: '205 228 126' },
  /** Mint. */
  'spreadsheet-agent': { hex: '#92e6c3', rgb: '146 230 195' },
  /** Pale gold. */
  'ai-leasing-agent': { hex: '#ead48f', rgb: '234 212 143' },
  /** Warm amber. */
  'creative-production': { hex: '#f3b56c', rgb: '243 181 108' },
  /** Green. */
  'jumpstart-finance': { hex: '#72de8f', rgb: '114 222 143' },
} as const

export type AccentId = keyof typeof ACCENTS

/** CSS custom properties for an accent: --accent (hex) and --accent-rgb ("r g b", for rgb(var(--accent-rgb) / a)). */
export const accentVars = (id: AccentId): CSSProperties =>
  ({ '--accent': ACCENTS[id].hex, '--accent-rgb': ACCENTS[id].rgb }) as CSSProperties

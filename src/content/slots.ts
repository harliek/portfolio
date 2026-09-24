import type { ImageId } from './media'
import type { ProjectId } from './projects'

/**
 * Places reserved for Harlie's own diagrams. The case studies contain NO
 * generated diagrams or flowcharts; each slot marks one place where a
 * hand-made diagram may go if Harlie supplies one.
 *
 * - `image: null` = empty. An empty slot renders NOTHING (no box, no space)
 *   in development and production alike.
 * - Debugging only: add `?debug=slots` to the URL, or run
 *   `localStorage.setItem('hk-debug-slots', '1')` in the console, to see
 *   every empty slot as a thin labelled outline. Off by default.
 * - To fill a slot: add the source to scripts/prepare-media.mjs so
 *   public/media/img/<file>-<width>.{avif,webp,jpg} exist, add an IMAGES
 *   entry in src/content/media.ts with provenance 'own-diagram' (the caption
 *   then reads "Diagram by Harlie"), and set `image` here. See
 *   docs/site-structure.md, section Slots.
 */
export interface SlotDef {
  project: ProjectId
  /** Where the slot sits on its page. */
  where: string
  /** What belongs here. */
  brief: string
  /** Suggested media id / file basename. */
  expected: string
  image: ImageId | null
}

export const SLOTS = {
  'ai-leasing-agent-diagram': {
    project: 'ai-leasing-agent',
    where: 'AI Leasing Agent, Approach, below the sticky conversation',
    brief: 'Harlie’s own diagram of which questions the assistant answers, which need current property data, and which go to a leasing team member.',
    expected: 'ai-leasing-agent-diagram',
    image: null,
  },
  'merchandising-platform-diagram': {
    project: 'merchandising-platform',
    where: 'Merchandising Platform, Approach, below the application frame',
    brief: 'Optional diagram of how product, pricing, inventory and vendor information connect in the prototype.',
    expected: 'merchandising-platform-diagram',
    image: null,
  },
  'jumpstart-finance-diagram': {
    project: 'jumpstart-finance',
    where: 'Jumpstart Finance, Approach, below the phone',
    brief: 'Optional diagram of the lesson, level and community structure.',
    expected: 'jumpstart-finance-diagram',
    image: null,
  },
} satisfies Record<string, SlotDef>

export type SlotId = keyof typeof SLOTS

export const getSlot = (id: SlotId): SlotDef => SLOTS[id]

/** The explicit, off-by-default debug flag for empty slots. */
export function slotsDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('debug') === 'slots') return true
    return window.localStorage.getItem('hk-debug-slots') === '1'
  } catch {
    return false
  }
}

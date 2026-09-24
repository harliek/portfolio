import type { ImageId } from '../media'

/**
 * The Art archive (/art): every drawing from Harlie's previous portfolio.
 *
 * Series names, their order, the order of works inside each series, the
 * series note and every title come from the old site (old portfolio copy/
 * src/app/content/creative.ts, SERIES). Titles are the `caption` of each
 * drawing in src/content/media.ts. “Published in BSB Magazine” (Etched in
 * Iris) and any awards are not shown (unverified).
 *
 * Three files in the old site's public/art folder (turn.jpg, line.jpg,
 * man.jpg) were never placed in a series or given a title. They are shown
 * last, without invented titles, until Harlie supplies them.
 */

export interface Series {
  /** Anchor id for the series links. */
  id: string
  name: string
  /** Harlie's own series note, where the old site had one (verbatim). */
  note?: string
  works: ImageId[]
}

export const ART = {
  intro: 'Drawings in four series, each drawing shown with its title, followed by three untitled drawings outside the series.',
  series: [
    {
      id: 'the-art-of-aging',
      name: 'The Art of Aging',
      note: 'Five drawings on ageing. The slow withering of the body and the fading of the mind, moved with rather than resisted.',
      works: ['drawing-oldwoman', 'drawing-oldman', 'drawing-oldman2', 'drawing-eye', 'drawing-hands'],
    },
    {
      id: 'a-portrait-in-ash',
      name: 'A Portrait in Ash',
      works: ['drawing-draw', 'drawing-smoke', 'drawing-bite'],
    },
    {
      id: 'she-is-her',
      name: 'She is Her',
      works: ['drawing-nyu', 'drawing-close', 'drawing-body', 'drawing-baby', 'drawing-two', 'drawing-long'],
    },
    {
      id: 'lines-of-loss',
      name: 'Lines of Loss',
      works: ['drawing-sex', 'drawing-scribble', 'drawing-square', 'drawing-tree', 'drawing-blur', 'drawing-drip'],
    },
    {
      id: 'other-drawings',
      name: 'Other drawings',
      note: 'Three drawings that are not part of a series, shown without titles.',
      works: ['drawing-turn', 'drawing-line', 'drawing-man'],
    },
  ] satisfies Series[],
}

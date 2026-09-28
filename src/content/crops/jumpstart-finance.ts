import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/jumpstart-finance.json →
 * node scripts/prepare-media.mjs crops jumpstart-finance). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * Three of the original 2024 prototype screens (the profile, lessons and
 * community screens, proto 2–4), each cropped to its phone body (584×1194 in
 * every file) plus 8px of transparent margin, so all three sit in a 600×1210
 * canvas at exactly the same size. The case page itself now shows Harlie's
 * tile phones (jf-tile-*); these crops are no longer rendered.
 * Sources are the matte-removed full-resolution screens that
 * `node scripts/prepare-media.mjs images` writes to .media-cache/covers/
 * (from JumpStart Finance/proto 2–4.png; the screens are untouched).
 */
const screen = (id: string, proto: number, rect: string, alt: string): ImageAsset => ({
  id,
  type: 'image',
  file: id,
  width: 600,
  height: 1210,
  widths: [320, 480, 600],
  fallback: 'png',
  transparent: true,
  alt,
  provenance: 'original-artifact',
  synthetic: false,
  source: `JumpStart Finance/proto ${proto}.png`,
  role: 'Prototype screen crop (not rendered since the case page uses jf-tile-*)',
  crop: `${rect} of .media-cache/covers/proto-${proto}.png (the phone body plus 8px of transparent margin)`,
  opaque: { x: 1.33, y: 0.66, w: 97.33, h: 98.68 },
})

export const JUMPSTART_FINANCE_CROPS = {
  'jf-screen-lessons': screen(
    'jf-screen-lessons',
    3,
    'x 14–614, y 9–1219',
    'Jumpstart prototype lessons screen with a lesson search field and a lesson card, Introduction to the basics of personal finance, with Start learning and Start the test buttons.',
  ),
  'jf-screen-progress': screen(
    'jf-screen-progress',
    2,
    'x 9–609, y 30–1240',
    'Jumpstart prototype profile screen for User 1 at Level 1, above a winding path of numbered levels.',
  ),
  'jf-screen-community': screen(
    'jf-screen-community',
    4,
    'x 18–618, y 5–1215',
    'Jumpstart prototype community screen with a member’s question about optimizing an investment portfolio in volatile markets, replies from other members, and each member’s level beside their name.',
  ),
} satisfies Record<string, ImageAsset>

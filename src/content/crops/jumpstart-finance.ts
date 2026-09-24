import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/jumpstart-finance.json →
 * node scripts/prepare-media.mjs crops jumpstart-finance). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * The four original 2024 prototype screens, each cropped to its phone body
 * (584×1194 in every file) plus 8px of transparent margin, so all four sit in
 * a 600×1210 canvas and render at exactly the same size in the case frame.
 * Sources are the matte-removed full-resolution screens that
 * `node scripts/prepare-media.mjs images` writes to .media-cache/covers/
 * (from JumpStart Finance/proto 1–4.png; the screens are untouched).
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
  role: 'Jumpstart Finance case frame (prototype screen)',
  crop: `${rect} of .media-cache/covers/proto-${proto}.png (the phone body plus 8px of transparent margin)`,
  opaque: { x: 1.33, y: 0.66, w: 97.33, h: 98.68 },
})

export const JUMPSTART_FINANCE_CROPS = {
  'jf-screen-home': screen(
    'jf-screen-home',
    1,
    'x 16–616, y 2–1212',
    'Jumpstart prototype home screen with a sample balance, a tip about diversifying investments, six learning topics (portfolio, budget, banks, stocks, taxes, spending), and a list of simulated events.',
  ),
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

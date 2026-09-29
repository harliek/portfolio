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
 * tile phones (jf-tile-*); these crops are no longer rendered, and their
 * entries (jf-screen-*) moved to archive/media-registry-unplaced.ts on 2026-09-29.
 * Sources are the matte-removed full-resolution screens that
 * `node scripts/prepare-media.mjs images` writes to .media-cache/covers/
 * (from JumpStart Finance/proto 2–4.png; the screens are untouched).
 */
export const JUMPSTART_FINANCE_CROPS = {} satisfies Record<string, ImageAsset>

import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/client-work.json →
 * node scripts/prepare-media.mjs crops client-work). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 */
export const CLIENT_WORK_CROPS = {} satisfies Record<string, ImageAsset>

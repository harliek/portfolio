import type { ImageAsset } from '../media'

/**
 * Crops for this page (scripts/crops/merchandising-platform.json →
 * node scripts/prepare-media.mjs crops merchandising-platform). Keys are image
 * ids; each entry is a full ImageAsset (type: 'image') with the dimensions the
 * task prints.
 *
 * The case page shows the recording itself (brief-v5 section 15: no screenshot
 * slideshow), so the earlier walkthrough crops (catalog, economics, working,
 * inventory, ask) were retired, and so was `mp-overview`, once the page's
 * `hero`. None is in use.
 */
export const MERCHANDISING_PLATFORM_CROPS = {} satisfies Record<string, ImageAsset>

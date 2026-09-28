import type { ImageAsset } from '../media'

/**
 * Crops for this page (scripts/crops/spreadsheet-agent.json →
 * node scripts/prepare-media.mjs crops spreadsheet-agent). Keys are image ids;
 * each entry is a full ImageAsset (type: 'image') with the dimensions the task
 * prints.
 *
 * The case page shows the recording itself (brief-v5 section 15: no screenshot
 * slideshow), so the earlier walkthrough crops (request, plan, unused words,
 * plan panel, sheet, list) were retired, and so was `sa-overview`, once the
 * page's `hero`. None is in use.
 */
export const SPREADSHEET_AGENT_CROPS = {} satisfies Record<string, ImageAsset>

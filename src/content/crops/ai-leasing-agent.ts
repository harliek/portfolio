import type { ImageAsset } from '../media'

/**
 * Crops for the AI Leasing Agent page (scripts/crops/ai-leasing-agent.json →
 * node scripts/prepare-media.mjs crops ai-leasing-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * The page shows Harlie's three illustrative mockups (valiance-*, media.ts). The
 * earlier conversation crop, ala-conversation, was no longer rendered; its entry
 * and notes are in archive/media-registry-unplaced.ts (2026-09-29). None is in use.
 */
export const AI_LEASING_AGENT_CROPS = {} satisfies Record<string, ImageAsset>

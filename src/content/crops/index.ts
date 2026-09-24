import { CAFEPRESS_UK_CROPS } from './cafepress-uk'
import { MERCHANDISING_PLATFORM_CROPS } from './merchandising-platform'
import { SPREADSHEET_AGENT_CROPS } from './spreadsheet-agent'
import { AI_LEASING_AGENT_CROPS } from './ai-leasing-agent'
import { JUMPSTART_FINANCE_CROPS } from './jumpstart-finance'
import { CLIENT_WORK_CROPS } from './client-work'

/** All page crop registries, merged into IMAGES in ../media.ts. */
export const CROP_IMAGES = {
  ...CAFEPRESS_UK_CROPS,
  ...MERCHANDISING_PLATFORM_CROPS,
  ...SPREADSHEET_AGENT_CROPS,
  ...AI_LEASING_AGENT_CROPS,
  ...JUMPSTART_FINANCE_CROPS,
  ...CLIENT_WORK_CROPS,
}

import type { ImageAsset } from '../media'
import type { CropRegion } from '.'

/**
 * Crops for the AI Leasing Agent page (scripts/crops/ai-leasing-agent.json →
 * node scripts/prepare-media.mjs crops ai-leasing-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * All are views of one illustrative conversation (Valiance Capital/messages.png,
 * 1672×941, invented names and data; its own footer reads “Reconstruction ·
 * Invented data”). The page labels it “Illustrative conversation” once, and the
 * enlarged view opens the whole illustration (valiance-messages).
 *
 * - ala-conversation: the three messages with their avatars, names and times
 *   (Jordan, the prospective renter; Oski, the assistant; Sam, from the leasing
 *   team), cut in the white space above Jordan and above the message field, so
 *   no line of text is split. It is the ONE image of the desktop and tablet
 *   stage (brief-v8 section 11): the page emphasises one message after another
 *   over it instead of replacing it. At the 645px desktop stage the 18px chat
 *   text shows at about 14px (0.78×).
 * - ala-phone-*: phones (below 600px), the text of each message alone, cut
 *   inside its bubble at one shared width (x 376 to 1036), so the three read in
 *   order at the same scale in the 350px column (the 18px text at about 9.5px,
 *   0.53×; the longest chat lines are 640px wide, so a line cannot be larger).
 *
 * AI_LEASING_AGENT_REGIONS: where ala-conversation sits in the whole
 * illustration (source pixels), so the enlarged view opens at actual size on it.
 */
const conversation = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'synthetic-example',
  synthetic: true,
  source: 'Valiance Capital/messages.png',
  ...a,
})

export const AI_LEASING_AGENT_CROPS = {
  'ala-conversation': conversation({
    id: 'ala-conversation',
    width: 831,
    height: 640,
    widths: [640, 831],
    alt: 'Illustrative web chat for Maple Court apartments. Jordan, a prospective renter, asks for a two-bedroom under $2,600 near campus for August, mentions one cat and an August 15 move-in, and asks whether the application fee can be waived and unit 2B held. The assistant, Oski, offers general information about floor plans, pet policies, and the application process, and says the fee waiver and unit hold need review by leasing staff, who it will connect. Sam, from the Maple Court leasing team, takes over, offering to help with the fee waiver request and unit hold, and asks for an email or phone number.',
    role: 'AI Leasing Agent stage (desktop and tablet): the whole exchange, with each message emphasised in turn',
    crop: 'x 262–1093, y 208–848 of messages.png (the three messages, without the chat header and the message field)',
  }),
  'ala-phone-renter': conversation({
    id: 'ala-phone-renter',
    width: 660,
    height: 134,
    widths: [660],
    alt: 'Jordan writes that they are looking for a two-bedroom under $2,600 near campus for August, have one cat, and hope to move in on August 15, and asks whether the application fee can be waived and unit 2B held.',
    role: 'AI Leasing Agent stage on phones (the renter’s question)',
    crop: 'x 376–1036, y 262–396 of messages.png (the text of Jordan’s message, inside its bubble)',
  }),
  'ala-phone-assistant': conversation({
    id: 'ala-phone-assistant',
    width: 660,
    height: 150,
    widths: [660],
    alt: 'The assistant replies that it can help with general information about floor plans, pet policies, and the application process, and that requests to waive the application fee or hold a specific unit need review by the leasing staff, so it will connect Jordan with a team member.',
    role: 'AI Leasing Agent stage on phones (the assistant’s answer)',
    crop: 'x 376–1036, y 470–620 of messages.png (the text of Oski’s message, inside its bubble)',
  }),
  'ala-phone-staff': conversation({
    id: 'ala-phone-staff',
    width: 660,
    height: 124,
    widths: [660],
    alt: 'Sam, from the Maple Court leasing team, takes over, offering to help with the fee waiver request and unit hold, and asks for the best email or phone number.',
    role: 'AI Leasing Agent stage on phones (the staff handoff)',
    crop: 'x 376–1036, y 699–823 of messages.png (the text of Sam’s message, inside its bubble)',
  }),
} satisfies Record<string, ImageAsset>

/** Where the stage's conversation sits in the whole illustration (source pixels). */
export const AI_LEASING_AGENT_REGIONS = {
  'ala-conversation': { of: 'valiance-messages', x: 262, y: 208, w: 831, h: 640 },
} satisfies Record<string, CropRegion>

import type { ImageAsset } from '../media'

/**
 * Crops for the AI Leasing Agent page (scripts/crops/ai-leasing-agent.json →
 * node scripts/prepare-media.mjs crops ai-leasing-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * A view of one illustrative conversation (Valiance Capital/messages.png,
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
} satisfies Record<string, ImageAsset>

import type { ImageAsset } from '../media'

/**
 * Focused crops for the AI Leasing Agent page (scripts/crops/ai-leasing-agent.json →
 * node scripts/prepare-media.mjs crops ai-leasing-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * All three are readable views of one illustrative conversation
 * (Valiance Capital/messages.png, 1672×941, invented names and data; its own
 * footer reads “Reconstruction · Invented data”). The page labels every view
 * “Illustrative conversation”, and a click opens the whole illustration
 * (valiance-messages). All three are 16:10, the page's one stage ratio, cut in
 * the white space between messages and panels so no line of text is split.
 * At the 645px desktop stage the chat text is about 14px (0.75×) and the
 * panel text about 17px (1.09×).
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
  'ala-chat-request': conversation({
    id: 'ala-chat-request',
    width: 856,
    height: 535,
    widths: [640, 856],
    alt: 'Illustrative web chat for Maple Court. Jordan asks for a two-bedroom under $2,600 near campus for August, mentions one cat and an August 15 move-in, and asks whether the application fee can be waived and unit 2B held. The assistant, Oski, offers general information about floor plans, pet policies, and the application process, and says the fee waiver and unit hold need review by leasing staff.',
    caption: 'Jordan’s request and the assistant’s reply.',
    role: 'AI Leasing Agent stage (opening, the request, the answer)',
    crop: 'x 264–1120, y 102–637 of messages.png (chat header, Jordan and Oski)',
  }),
  'ala-live-check': conversation({
    id: 'ala-live-check',
    width: 594,
    height: 371,
    widths: [594],
    alt: 'Illustrative Behind the scenes panel beside the chat. Live data required, current pricing and availability are checked for the preferred dates, floor plan, and pet policy. Human approval, requests to waive the application fee or hold a specific unit need review and approval from leasing staff.',
    caption: 'The panel beside the chat, with the live data check and the approval step.',
    role: 'AI Leasing Agent stage (live information check)',
    crop: 'x 1078–1672, y 364–735 of messages.png (the Behind the scenes panel)',
  }),
  'ala-chat-handoff': conversation({
    id: 'ala-chat-handoff',
    width: 856,
    height: 535,
    widths: [640, 856],
    alt: 'Illustrative web chat. Oski says requests to waive the application fee or hold a specific unit need review by leasing staff and connects Jordan with a team member. Sam, from the Maple Court leasing team, offers to help with the fee waiver request and unit hold and asks for an email or phone number.',
    caption: 'The assistant refers the request to staff, and a team member replies.',
    role: 'AI Leasing Agent stage (staff handoff)',
    crop: 'x 268–1124, y 406–941 of messages.png (Oski, Sam and the message field)',
  }),
} satisfies Record<string, ImageAsset>

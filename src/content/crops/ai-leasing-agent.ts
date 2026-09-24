import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/ai-leasing-agent.json →
 * node scripts/prepare-media.mjs crops ai-leasing-agent). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * Two readable views of the illustrative conversation
 * (Valiance Capital/messages.png, 1672×941, invented names and data; its own
 * footer reads “Reconstruction · Invented data”). Both are 836×452 (the case
 * frame's ratio), cut in the white space between messages: Jordan and Oski
 * (rows 196–648) and Oski and Sam (rows 401–853). At the 620px frame the
 * chat text is about 13px. The full illustration stays one click away
 * through “Enlarge image”.
 */
const conversation = (a: Omit<ImageAsset, 'type' | 'file' | 'width' | 'height' | 'widths' | 'fallback' | 'provenance' | 'synthetic' | 'source'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  width: 836,
  height: 452,
  widths: [640, 836],
  fallback: 'jpg',
  provenance: 'synthetic-example',
  synthetic: true,
  source: 'Valiance Capital/messages.png',
  ...a,
})

export const AI_LEASING_AGENT_CROPS = {
  'ala-conversation-request': conversation({
    id: 'ala-conversation-request',
    alt: 'Illustrative web chat. Jordan asks for a two-bedroom under $2,600 near campus for August, with one cat and a move-in date of August 15, and asks whether the application fee can be waived and unit 2B held. The assistant, Oski, replies that it can help with general information about floor plans, pet policies, and the application process, and that the fee waiver and unit hold need review by leasing staff.',
    caption: 'Jordan’s request and the assistant’s first reply.',
    role: 'AI Leasing Agent case frame (general answer; request needing current information)',
    crop: 'x 258–1094, y 196–648 of messages.png (Jordan and Oski)',
  }),
  'ala-conversation-handoff': conversation({
    id: 'ala-conversation-handoff',
    alt: 'Illustrative web chat. Oski says requests to waive the application fee or hold a specific unit need to be reviewed by leasing staff and connects Jordan with a team member. Sam, from the Maple Court leasing team, offers to help with the fee waiver request and unit hold and takes over the conversation.',
    caption: 'The assistant refers the request to staff, and a team member replies.',
    role: 'AI Leasing Agent case frame (staff handoff)',
    crop: 'x 258–1094, y 401–853 of messages.png (Oski and Sam)',
  }),
} satisfies Record<string, ImageAsset>

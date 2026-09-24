import type { ConversationStep, Rect } from '../../components/pages/ai-leasing-agent/ConversationSteps'

/*
 * AI Leasing Agent (route /work/valiance). Copy from the client's brief
 * (Page 4), verbatim where given. Evidence: the résumé (role, dates,
 * "Defined development requirements for AI leasing agent", adoption across
 * 18 properties) and Harlie's own account (the opportunity proposal, the
 * testing, the third-party platform). No response-time or conversion claim
 * is published. No generated flowchart.
 *
 * The only image is an illustrative conversation with invented data
 * (Valiance Capital/messages.png, 1672 × 941, footer "Reconstruction ·
 * Invented data"). It is labelled illustrative and synthetic wherever it
 * appears. Message positions below were measured on that file (text rows
 * Jordan 232–384, Oski 434–611, Sam 665–815; bubbles x 366–1075; avatars
 * x 281–340).
 *
 *   Jordan  "Hi! I'm looking for a two-bedroom under $2,600 near campus for
 *           August. I have one cat, and I'm hoping to move in on August 15.
 *           Can you waive the application fee? I'd also like to hold unit
 *           2B if possible."
 *   Oski    "I can help with general information about floor plans, pet
 *           policies, and the application process." / "Requests to waive
 *           the application fee or to hold a specific unit (like 2B) need
 *           to be reviewed by our leasing staff. I'll connect you with a
 *           team member…"
 *   Sam     "part of the Maple Court leasing team … can help with the fee
 *           waiver request and unit hold … I'll take it from here."
 */

/**
 * The one conversation frame: the three messages (avatars, names, bubbles),
 * without the chat's title band, so the frame is about 4:3 and sits at the
 * same scale as the other product pages' frames.
 */
const FRAME: Rect = { x: 268, y: 218, w: 820, h: 618 }

/* Excerpts under each paragraph on narrow screens: the message column only
   (names stay visible; avatars are left out so the text is as large as possible). */
const EXCERPT_X = { x: 352, w: 738 }

const steps: ConversationStep[] = [
  {
    id: 'general',
    title: 'General information',
    body: <p>I identified questions that could be answered using approved property and policy information.</p>,
    // Oski's first paragraph.
    region: { x: 271, y: 415, w: 815, h: 115 },
    excerpt: { ...EXCERPT_X, y: 401, h: 242 },
    excerptAlt:
      'The assistant, Oski, replies that it can help with general information about floor plans, pet policies, and the application process.',
    caption: 'Oski, the assistant, offers general information about floor plans, pet policies, and the application process.',
  },
  {
    id: 'current',
    title: 'Current information',
    body: <p>I distinguished questions that required current availability or other changing property data.</p>,
    // Jordan's request.
    region: { x: 271, y: 218, w: 815, h: 191 },
    excerpt: { ...EXCERPT_X, y: 204, h: 219 },
    excerptAlt:
      'Jordan asks for a two-bedroom under $2,600 near campus for August, with one cat and a move-in date of August 15, and asks to hold unit 2B.',
    caption: 'Jordan asks about a two-bedroom under $2,600 for August and about unit 2B. Both depend on current availability and pricing.',
  },
  {
    id: 'staff',
    title: 'Staff decisions',
    body: <p>I specified when the assistant should refer a question to a leasing team member.</p>,
    // Oski's second paragraph and Sam's reply.
    region: { x: 271, y: 531, w: 815, h: 307 },
    excerpt: { ...EXCERPT_X, y: 401, h: 451 },
    excerptAlt:
      'Oski says the fee waiver and the unit hold need review by leasing staff and connects Jordan with a team member. Sam from the leasing team replies and takes over both requests.',
    caption: 'The fee waiver and unit hold need review by leasing staff. Oski refers them, and Sam from the leasing team takes over.',
  },
]

export const AI_LEASING_AGENT = {
  description: (
    <p>An AI assistant for recurring leasing questions at Valiance Capital. I defined its workflow requirements and helped test it.</p>
  ),
  note: 'The production assistant was supplied by a third-party platform.',
  heroCaption: 'A leasing web chat with invented names and data. Not a production screenshot.',
  context: (
    <>
      <p>
        While working in leasing and operations at Valiance Capital, I identified an opportunity to use an AI assistant for recurring leasing
        questions. I translated those workflows into requirements and helped test the assistant.
      </p>
      <p className="ala-boundary">The production assistant was supplied by a third-party platform.</p>
    </>
  ),
  problem: <p>Leasing questions can depend on general policies, current property information, or decisions that require a staff member.</p>,
  conversation: {
    image: 'valiance-messages' as const,
    frame: FRAME,
    frameAlt:
      'Illustrative web chat with invented data. Jordan asks for a two-bedroom under $2,600 near campus for August, asks whether the application fee can be waived, and asks to hold unit 2B. The assistant, Oski, offers general information about floor plans, pet policies, and the application process, and says the fee waiver and unit hold need review by leasing staff. Sam from the leasing team takes over.',
    note: 'A conversation with invented names and data. Not a production screenshot.',
    steps,
  },
  results: (
    <>
      <p>
        The assistant was adopted across 18 properties. My contribution covered the opportunity proposal, workflow requirements, and testing. A
        third-party platform provided the production system.
      </p>
      <p>Response-time and conversion changes were not independently verified.</p>
    </>
  ),
}

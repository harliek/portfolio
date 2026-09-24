import type { Rect, Section, Visual } from '../../components/case/CaseScroll'

/*
 * AI Leasing Agent (route /work/valiance, CaseScroll). Copy from the latest
 * brief (section 21), verbatim where given. Evidence: the résumé (role,
 * dates, "Defined development requirements for AI leasing agent", adoption
 * across 18 properties) and Harlie's own account (the opportunity proposal,
 * the testing, the third-party platform). No response-time or conversion
 * claim is published. No generated flowchart.
 *
 * The only image is an illustrative conversation with invented data
 * (Valiance Capital/messages.png, 1672×941, footer "Reconstruction ·
 * Invented data"). Its provenance label ("Illustrative · Synthetic") is
 * shown once, with the opening (CaseScroll shows a label again only when the
 * provenance changes); the captions describe the example plainly. The three
 * focused views are crops of the thread (src/content/crops/ai-leasing-agent.ts);
 * "Enlarge image" always opens the full conversation.
 *
 * First-person sentences stay at the level of the three requirement
 * categories (general policy information, current property data, staff
 * decisions), the only part supported by Harlie's account (S1). The specific
 * examples (floor plans, pet policies, the fee waiver, unit 2B) come from the
 * invented conversation and are introduced as the illustration's.
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
 *
 * Highlights are percentages of the 836×452 crops.
 */

/** Oski's first paragraph (general information), in ala-conversation-request. */
const GENERAL_ANSWER: Rect = { x: 13.6, y: 59.5, w: 82.8, h: 14.2 }
/** Jordan's first paragraph (a two-bedroom under $2,600, August 15), in ala-conversation-request. */
const CURRENT_REQUEST: Rect = { x: 13.6, y: 15, w: 80.4, h: 14.2 }
/** Oski's referral and Sam's reply, in ala-conversation-handoff. */
const HANDOFF: Rect = { x: 2, y: 29.2, w: 96, h: 67 }

const FULL = 'valiance-messages' as const

const sections: Section[] = [
  {
    id: 'problem',
    title: 'Problem',
    blocks: [
      {
        id: 'problem-text',
        body: (
          <p>
            Leasing inquiries repeat many of the same questions, but <strong>not every question has the same kind of answer</strong>. Some can be
            answered from approved property and policy information. Others depend on current pricing and availability, or need a decision that
            only leasing staff can make.
          </p>
        ),
      },
    ],
  },
  {
    id: 'contribution',
    title: 'My contribution',
    blocks: [
      {
        id: 'requirements',
        body: (
          <p>
            I turned those differences into <strong>requirements</strong> covering what the assistant could answer directly, what needed current
            property data, and when a team member should take over. I also <strong>worked on testing</strong>, checking cases that involved changing
            information, policy limits, and escalation against the requirements.
          </p>
        ),
        visual: {
          kind: 'placeholder',
          placeholder: {
            id: 'ai-leasing-agent-diagram',
            ratio: '836 / 452',
            label: 'Diagram of the requirements, showing which questions the assistant answers, which need current property data, and which go to a leasing team member.',
            description:
              'Harlie’s own retrospective diagram of the leasing assistant’s requirements, labelled as such. Three routes for an incoming question: (1) general policy questions answered from approved property and policy information (floor plans, pet policy, the application process); (2) questions that need current data (availability, pricing, move-in dates), answered only from current property data; (3) requests that need a staff decision (fee waivers, unit holds, exceptions), handed to a leasing team member. Plain labels; no metrics, no platform internals, no third-party platform name. Landscape 1.85:1, 1672×904 px, text at least 28px in the source so it reads at 620px wide.',
          },
        },
      },
      {
        id: 'general',
        title: 'A general policy answer',
        body: (
          <p>
            I identified the questions the assistant could <strong>answer from approved property and policy information</strong>. In the
            illustrative conversation, that is the general information the assistant offers first.
          </p>
        ),
        visual: {
          kind: 'image',
          image: 'ala-conversation-request',
          caption: 'The example reply offers general information about floor plans, pet policies, and the application process.',
          highlight: GENERAL_ANSWER,
          enlarge: FULL,
        },
      },
      {
        id: 'current',
        title: 'A request that needs current information',
        body: (
          <p>
            I distinguished questions that depend on <strong>current availability, pricing, or other changing property data</strong>. In the
            illustrative conversation, whether a two-bedroom under $2,600 is free for an August 15 move-in depends on what is available when the
            question is asked.
          </p>
        ),
        visual: {
          kind: 'image',
          image: 'ala-conversation-request',
          caption: 'The example request depends on current pricing and availability for an August move-in.',
          highlight: CURRENT_REQUEST,
          enlarge: FULL,
        },
      },
      {
        id: 'handoff',
        title: 'A staff handoff',
        body: (
          <p>
            I specified when the assistant should <strong>refer a conversation to a leasing team member</strong>, for requests that need a staff
            decision. In the illustrative conversation, a request to waive the application fee and hold unit 2B goes to leasing staff.
          </p>
        ),
        visual: {
          kind: 'image',
          image: 'ala-conversation-handoff',
          caption: 'The example handoff, from the assistant’s referral to the team member’s reply.',
          highlight: HANDOFF,
          enlarge: FULL,
        },
      },
    ],
  },
]

export const AI_LEASING_AGENT = {
  situation: (
    <p>
      At Valiance Capital, I <strong>proposed an AI assistant</strong> for recurring leasing questions and worked on its{' '}
      <strong>requirements and testing</strong>. A third-party platform supplied the production assistant.
    </p>
  ),
  opening: {
    kind: 'image',
    image: FULL,
    caption: 'A leasing web chat between a prospective resident, the assistant, and a leasing team member.',
  } satisfies Visual,
  sections,
  results: (
    <p>
      The assistant was <strong>adopted across 18 properties</strong>. Changes in response time and conversion were not independently verified.
    </p>
  ),
}

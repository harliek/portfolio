import type { CaseMedia, Rect, StorySection, Visual } from '../../components/case/CaseScroll'

/**
 * AI Leasing Agent (route /work/valiance, CaseScroll states media).
 *
 * Copy is brief-v5 section 20 under the copy rules and lead decision 5 (one
 * qualification, once, in My contribution: the production assistant ran on a
 * third-party platform). The brief's “My contribution” is split in two
 * (“My contribution” and “Testing and rollout”) so the story has three
 * sections of 25 to 45 words and each of the three highlights the brief asks
 * for (the answer, the live-information check, the staff handoff) follows the
 * text that describes it. No other wording is changed.
 *
 * Sources: the résumé (Valiance Capital, Leasing & Operations Associate,
 * Oct 2024 to Jun 2025; “Defined development requirements for AI leasing
 * agent adopted across 18 properties”). The proposal, the workflow
 * documentation, the test cases, the API check, the phased rollout, the
 * third-party platform and the effect on the team's time are Harlie's own
 * statements (no file in the project documents them). No response-time or
 * conversion figure is published.
 *
 * The only image is an illustrative conversation with invented names and data
 * (Valiance Capital/messages.png; its footer reads “Reconstruction · Invented
 * data”), shown as readable crops (src/content/crops/ai-leasing-agent.ts), each
 * labelled “Illustrative conversation”. A click opens the whole illustration.
 * Highlights are percentages of each crop.
 */

/** Jordan's message (availability, a cat, a fee waiver, a unit hold), in ala-chat-request. */
const REQUEST: Rect = { x: 11.3, y: 27.9, w: 81.5, h: 28.6 }
/** Oski's first paragraph, the general information it can give, in ala-chat-request. */
const ANSWER: Rect = { x: 13.2, y: 68.4, w: 72.3, h: 10.8 }
/** The Live data required card, in ala-live-check. */
const LIVE_CHECK: Rect = { x: 18.5, y: 19.7, w: 74.7, h: 39.1 }
/** Oski's referral to staff and Sam's reply, in ala-chat-handoff. */
const HANDOFF: Rect = { x: 10.9, y: 24.1, w: 84, h: 55.5 }

const FULL = 'valiance-messages' as const
const LABEL = 'Illustrative conversation'

const view = (v: Omit<Visual, 'label' | 'expandTo'>): Visual => ({ ...v, label: LABEL, expandTo: FULL })

export const AI_LEASING_AGENT = {
  meta: ['Leasing and Operations Associate · Valiance Capital', 'October 2024 to June 2025 · Adopted across all 18 properties'],
  summary: (
    <p>
      At Valiance Capital, I <strong>proposed an AI leasing agent</strong>, wrote its requirements and workflow documentation, and developed test cases for its
      rollout across the portfolio.
    </p>
  ),
  media: {
    kind: 'states',
    // All three crops are 16:10.
    frameRatio: '16 / 10',
    opening: view({ image: 'ala-chat-request', caption: 'A prospective resident writes to the property’s web chat.' }),
  } satisfies CaseMedia,
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          The leasing team spent time answering recurring questions while also managing leads and conversations that needed personal attention. Some answers
          depended on live property information, and others required a decision from staff.
        </p>
      ),
      visual: view({ image: 'ala-chat-request', caption: 'One message asks about availability and a pet, and asks for a fee waiver and a unit hold.', highlight: REQUEST }),
    },
    {
      id: 'contribution',
      title: 'My contribution',
      body: (
        <p>
          I defined <strong>what the assistant could answer</strong>, when it needed to check property data through the API, and when it should hand a
          conversation to the team. The production assistant ran on a third-party platform.
        </p>
      ),
      visual: view({ image: 'ala-chat-request', caption: 'The assistant answers the general questions about floor plans, pets, and applications.', highlight: ANSWER }),
    },
    {
      id: 'testing',
      title: 'Testing and rollout',
      body: (
        <p>
          I tested questions about availability, pricing, tours, application status, and leasing policies. We introduced it in{' '}
          <strong>lower-risk scenarios</strong>, then expanded its use.
        </p>
      ),
      visual: view({ image: 'ala-live-check', caption: 'Current pricing and availability come from a live data check.', highlight: LIVE_CHECK }),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        The agent was <strong>adopted across all 18 properties</strong>. By handling recurring inquiries, it gave the leasing team more time to pursue leads and
        focus on resident and prospect interactions that needed a person.
      </p>
    ),
    visual: view({ image: 'ala-chat-handoff', caption: 'The fee waiver and unit hold go to a member of the leasing team.', highlight: HANDOFF }),
  } satisfies StorySection,
}

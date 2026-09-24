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
 * text that describes it. No other wording is changed. Round 5 (R5-01): the
 * summary starts with Harlie's action; the metadata names Valiance Capital.
 *
 * Sources: the résumé (Valiance Capital, Leasing & Operations Associate,
 * Oct 2024 to Jun 2025; “Managed CRM and leasing operations for a 1,000+
 * tenant portfolio”, the problem's opening clause since round 2, R2-08, so
 * the reader sees where and at what scale she saw the problem; “Defined
 * development requirements for AI leasing agent adopted across 18
 * properties”). The proposal, the workflow
 * documentation, the test cases, the API check, the phased rollout, the
 * third-party platform and the effect on the team's time are Harlie's own
 * statements (no file in the project documents them). No response-time or
 * conversion figure is published.
 *
 * The only image is an illustrative conversation with invented names and data
 * (Valiance Capital/messages.png; its footer reads “Reconstruction · Invented
 * data”), shown as readable crops (src/content/crops/ai-leasing-agent.ts), each
 * labelled “Illustrative conversation”. A click opens the whole illustration
 * at actual size on the clicked detail. Highlights are percentages of each crop.
 * Phones show narrower crops of just the message or panel column (`phone`,
 * round 4, R4-06), which read in place; the request and the handoff crops are
 * themselves the detail, so they carry no highlight there.
 */

/** Jordan's message (availability, a cat, a fee waiver, a unit hold), in ala-chat-request. */
const REQUEST: Rect = { x: 11.3, y: 27.9, w: 81.5, h: 28.6 }
/** Oski's first paragraph, the general information it can give, in ala-chat-request. */
const ANSWER: Rect = { x: 13.2, y: 68.4, w: 72.3, h: 10.8 }
/** The Live data required card, in ala-live-check. */
const LIVE_CHECK: Rect = { x: 18.5, y: 19.7, w: 74.7, h: 39.1 }
/** Oski's referral to staff and Sam's reply, in ala-chat-handoff. */
const HANDOFF: Rect = { x: 10.9, y: 24.1, w: 84, h: 55.5 }
/** The Live data required card in the phone crop ala-phone-panel (source x 1188–1632, y 437–582, as LIVE_CHECK). */
const LIVE_CHECK_PHONE: Rect = { x: 4.91, y: 22.47, w: 90.8, h: 36.62 }

const FULL = 'valiance-messages' as const
const LABEL = 'Illustrative conversation'

const view = (v: Omit<Visual, 'label' | 'expandTo'>): Visual => ({ ...v, label: LABEL, expandTo: FULL })

export const AI_LEASING_AGENT = {
  meta: ['Leasing and Operations Associate · Valiance Capital', 'October 2024 to June 2025 · Adopted across all 18 properties'],
  summary: (
    <p>
      I <strong>proposed an AI leasing agent</strong>, wrote its requirements and workflow documentation, and developed test cases for its rollout across the
      portfolio.
    </p>
  ),
  media: {
    kind: 'states',
    // All three crops are 16:10.
    frameRatio: '16 / 10',
    opening: view({ image: 'ala-chat-request', caption: 'A prospective resident writes to the property’s web chat.', phone: { image: 'ala-phone-request' } }),
  } satisfies CaseMedia,
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          Managing CRM and leasing operations for more than 1,000 tenants, I saw the team spend time answering recurring questions while also handling leads
          and conversations that needed personal attention. Some answers depended on live property information, and others required a decision from staff.
        </p>
      ),
      visual: view({ image: 'ala-chat-request', caption: 'One message asks about availability and a pet, and asks for a fee waiver and a unit hold.', highlight: REQUEST }),
    },
    {
      id: 'contribution',
      title: 'My contribution',
      body: (
        <p>
          I defined what the assistant could answer, when it needed to check property data through the API, and when it should hand a
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
          I tested questions about availability, pricing, tours, application status, and leasing policies. We introduced it in lower-risk
          scenarios, then expanded its use.
        </p>
      ),
      visual: view({
        image: 'ala-live-check',
        caption: 'Current pricing and availability come from a live data check.',
        highlight: LIVE_CHECK,
        phone: { image: 'ala-phone-panel', highlight: LIVE_CHECK_PHONE },
      }),
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
    visual: view({
      image: 'ala-chat-handoff',
      caption: 'The fee waiver and unit hold go to a member of the leasing team.',
      highlight: HANDOFF,
      phone: { image: 'ala-phone-handoff' },
    }),
  } satisfies StorySection,
}

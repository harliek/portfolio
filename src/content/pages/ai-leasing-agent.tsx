import type { CaseMedia, StageContext, StorySection } from '../../components/case/CaseScroll'
import { ConversationStage, type ConversationFocus, type ConversationMoment } from '../../components/pages/ai-leasing-agent/ConversationStage'

/**
 * AI Leasing Agent (route /work/valiance, CaseScroll custom media).
 *
 * brief-v8 section 11: one large, legible conversation with three identifiable
 * moments (a prospective renter asks, the assistant says what it can answer
 * and what needs staff, a member of the leasing staff takes over), each brought
 * forward as the section about it is read, with the rest of the exchange in
 * view. The story follows those moments. The problem (the renter's question),
 * My contribution (what the assistant could answer and check), Handoff to staff
 * (when a person takes over), then the whole exchange beside the result. The
 * brief-v5 copy is kept, with its testing sentence in My contribution and its
 * rollout sentence in Handoff to staff; one qualification, once, in My
 * contribution (the production assistant ran on a third-party platform, lead
 * decision 1).
 *
 * Sources: the résumé (Valiance Capital, Berkeley, California; Leasing &
 * Operations Associate, Oct 2024 to Jun 2025; “Managed CRM and leasing
 * operations for a 1,000+ tenant portfolio”; “Defined development requirements
 * for AI leasing agent adopted across 18 properties”). The résumé says 18
 * properties, not all 18, so the page does too. The proposal, the workflow
 * documentation, the test cases, the API check, the handoff rules, the phased
 * rollout and the third-party platform are Harlie's own statements (no file in
 * the project documents them). The effect on the team's time is stated as what
 * the agent was designed to do, not as a measured result (brief-v8: benefits
 * only as observed findings with evidence; there is none in the project). No
 * response-time or conversion figure is published.
 *
 * Berkeley and Valiance (brief-v8 section 11, lead decision 3): the metadata
 * gives the role's location, Berkeley (résumé), which is why the concept cover
 * and the illustration are Berkeley-themed; the page names Valiance Capital as
 * the employer and nothing else. The cover's “The Berkeley Group” branding
 * awaits Harlie's confirmation in docs/asset-checklist.md.
 *
 * The only image is an illustrative conversation with invented names and data
 * (Valiance Capital/messages.png; its footer reads “Reconstruction · Invented
 * data”), labelled “Illustrative conversation” once. It is not presented as a
 * production screenshot. Rectangles are percentages of ala-conversation
 * (src/content/crops/ai-leasing-agent.ts, 831×640 from x 262, y 208).
 */

/** The three moments, in the order of the conversation. */
const MOMENTS: ConversationMoment[] = [
  {
    // Jordan: avatar, name row and message (source x 272–1066, y 220–410).
    tag: 'Prospective renter',
    rect: { x: 1.2, y: 1.88, w: 95.55, h: 29.69 },
    tagAt: { y: 4.84, right: 4.57 },
    phone: 'ala-phone-renter',
    paper: 'rgb(238 240 236)',
  },
  {
    // Oski: avatar, name row and reply (source x 272–1086, y 420–634).
    tag: 'AI assistant',
    rect: { x: 1.2, y: 33.13, w: 97.95, h: 33.44 },
    tagAt: { y: 36.41, right: 2.05 },
    phone: 'ala-phone-assistant',
    paper: 'rgb(254 253 252)',
  },
  {
    // Sam: avatar, name row and reply (source x 272–1086, y 654–838).
    tag: 'Leasing staff',
    rect: { x: 1.2, y: 69.69, w: 97.95, h: 28.75 },
    tagAt: { y: 72.81, right: 2.05 },
    phone: 'ala-phone-staff',
    paper: 'rgb(254 253 252)',
  },
]

/** The story's sections, in order, bring the renter, the assistant and the staff member forward; the opening and the result show the whole exchange. */
const focusFor = (active: number): ConversationFocus => (active >= 0 && active < MOMENTS.length ? active : 'all')

export const AI_LEASING_AGENT = {
  meta: ['Leasing and Operations Associate · Valiance Capital, Berkeley', 'October 2024 to June 2025 · Adopted across 18 properties'],
  summary: (
    <p>
      I <strong>proposed an AI leasing agent</strong>, wrote its requirements and workflow documentation, and developed test cases for its rollout across the
      portfolio.
    </p>
  ),
  media: {
    kind: 'custom',
    render: ({ active, layout }: StageContext) => (
      <ConversationStage image="ala-conversation" full="valiance-messages" moments={MOMENTS} focus={focusFor(active)} layout={layout} label="Illustrative conversation" />
    ),
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
    },
    {
      id: 'contribution',
      title: 'My contribution',
      body: (
        <p>
          I defined <strong>what the assistant could answer</strong> and when it needed to check property data through the API. I tested it with questions about
          availability, pricing, tours, application status, and leasing policies. The production assistant ran on a third-party platform.
        </p>
      ),
    },
    {
      id: 'handoff',
      title: 'Handoff to staff',
      body: (
        <p>
          I also defined when it should hand a conversation to the leasing team, so a request that needed a staff decision reached a person. We introduced the
          assistant in lower-risk scenarios, then expanded its use.
        </p>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        The agent was <strong>adopted across 18 properties</strong>. It was designed to handle recurring inquiries so the leasing team could spend more time on
        leads and on conversations that needed a person.
      </p>
    ),
  } satisfies StorySection,
}

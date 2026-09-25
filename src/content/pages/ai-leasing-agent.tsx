/**
 * AI Leasing Agent (brief v19): a compact page. The introduction and three
 * short passages (responsibilities, testing, rollout), with the illustrative
 * conversation (labelled as illustrative) fixed beside them, moving to the
 * part each passage is about.
 *
 * Facts (unchanged from the verified copy): Leasing and Operations Associate,
 * Valiance Capital, Berkeley, October 2024 to June 2025; CRM and leasing
 * operations for more than 1,000 tenants; tested with questions about
 * availability, pricing, tours, application status and leasing policies;
 * introduced in lower-risk scenarios, then expanded; adopted across 18
 * properties; the production assistant ran on a third-party platform.
 */
export const LEASING = {
  title: 'AI Leasing Agent',
  meta: ['Leasing and Operations Associate', 'Valiance Capital, Berkeley', 'October 2024 to June 2025'],
  lede: (
    <p>
      Managing CRM and leasing operations for more than 1,000 tenants, I saw the team spend time on recurring questions alongside leads that needed personal
      attention. I proposed an AI leasing agent, wrote its requirements and workflow documentation, and developed test cases for its rollout.
    </p>
  ),
  conversationLabel: 'Illustrative conversation, not a transcript.',
  /** Where each passage sits in the illustration (source pixels): the Behind the scenes panel, the conversation, then all of it. */
  regions: [{ x: 1160, y: 350, w: 500, h: 400 }, { x: 260, y: 215, w: 830, h: 620 }, null],
  sections: [
    {
      title: 'Responsibilities',
      text: 'I defined what the assistant could answer, when it had to check live property data through the API, and when a request needed a staff decision and should reach the leasing team.',
    },
    {
      title: 'Testing',
      text: 'I tested it with questions about availability, pricing, tours, application status, and leasing policies. The production assistant ran on a third-party platform.',
    },
    {
      title: 'Rollout',
      text: 'It was introduced in lower-risk scenarios, then expanded, and was adopted across 18 properties. It was designed to handle recurring inquiries so the leasing team could spend more time on leads.',
    },
  ],
}

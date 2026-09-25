/**
 * AI Leasing Agent (brief v16): a system view instead of a device. The
 * illustrative conversation is the opening image; the requirements Harlie
 * wrote are drawn as the routing they defined (what the assistant could
 * answer, when it had to check live property data through the API, and
 * when it handed a conversation to the leasing team); the rollout and the
 * adoption close it.
 *
 * Facts (unchanged from the verified copy): Leasing and Operations
 * Associate, Valiance Capital, Berkeley, October 2024 to June 2025; CRM and
 * leasing operations for more than 1,000 tenants; tested with questions
 * about availability, pricing, tours, application status and leasing
 * policies; introduced in lower-risk scenarios, then expanded; adopted across
 * 18 properties. Qualified once: the production assistant ran on a
 * third-party platform; the conversation is illustrative. The diagram shows
 * the three routes the requirements defined, not which topic took which.
 */
export const LEASING = {
  title: 'AI Leasing Agent',
  meta: ['Leasing and Operations Associate', 'Valiance Capital, Berkeley', 'October 2024 to June 2025'],
  summary: (
    <p>
      I <strong>proposed an AI leasing agent</strong>, wrote its requirements and workflow documentation, and developed test cases for its rollout across the
      portfolio.
    </p>
  ),
  conversationLabel: 'Illustrative conversation',
  problem: {
    lead: 'Managing CRM and leasing operations for more than 1,000 tenants, I saw the team spend time answering recurring questions while also handling leads and conversations that needed personal attention.',
    statement: 'Some answers depended on live property information, and others required a decision from staff.',
  },
  routing: {
    kicker: 'My contribution',
    title: 'The routing the requirements defined',
    incoming: 'A renter’s question',
    routes: [
      { title: 'Answer', body: 'What the assistant could answer on its own.' },
      { title: 'Check live data', body: 'When it needed to check property data through the API first.' },
      { title: 'Hand to staff', body: 'When a request needed a staff decision, so it reached a person.' },
    ],
    tested: ['Availability', 'Pricing', 'Tours', 'Application status', 'Leasing policies'],
    testedLabel: 'Tested with questions about',
    platform: 'The production assistant ran on a third-party platform.',
  },
  rollout: ['Lower-risk scenarios', 'Expanded use', '18 properties'],
  result: {
    figure: '18',
    unit: 'properties',
    body: (
      <p>
        The agent was <strong>adopted across 18 properties</strong>. It was designed to handle recurring inquiries so the leasing team could spend more time on leads
        and on conversations that needed a person.
      </p>
    ),
  },
}

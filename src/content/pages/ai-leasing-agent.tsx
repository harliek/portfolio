/**
 * AI Leasing Agent (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and four short sections (inquiry scope,
 * live property data, staff escalation, testing and deployment), with the
 * illustrative conversation (captioned as illustrative) fixed beside them,
 * moving to the part each section is about; one implementation note.
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
  /** The role, then the company and the years ("company – year", years only; Harlie's requests). */
  meta: ['Leasing and Operations Associate', 'Valiance Capital – 2024 to 2025'],
  lede: (
    <p>
      At Valiance Capital, I proposed an AI assistant to handle recurring leasing questions for a portfolio serving more than 1,000 tenants.
    </p>
  ),
  /** Harlie's editorial pass (v23): descriptive headings, one implementation note, one caption for the illustration. */
  sections: [
    {
      title: 'Defining the assistant’s scope',
      text: 'I defined which questions the assistant could answer.',
    },
    {
      title: 'Using current property data',
      text: 'I specified when answers needed live pricing and availability from the property API.',
    },
    {
      title: 'Handing requests to staff',
      text: 'I documented which requests needed staff review and how to transfer them to the leasing team.',
    },
    {
      title: 'Testing and rollout',
      text: 'I tested answers about availability, pricing, tours, application status, and leasing policies. Rollout began with lower-risk inquiries and expanded to 18 properties.',
    },
  ],
}

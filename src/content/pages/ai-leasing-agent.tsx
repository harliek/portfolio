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
  /** The role, then the organisation and the years (years only, Harlie's request). */
  meta: ['Leasing and Operations Associate', 'Valiance Capital, Berkeley 2024 to 2025'],
  lede: (
    <p>
      At Valiance Capital, I proposed an AI leasing assistant to address recurring inquiries within operations serving more than 1,000 tenants. I documented
      requirements, defined inquiry workflows, and developed test cases for deployment.
    </p>
  ),
  /**
   * Where each group sits in the illustration (source pixels of valiance-messages): the renter's question and the
   * assistant's first answer; the Live data required card; the Human approval card; then all of it.
   */
  regions: [{ x: 270, y: 215, w: 740, h: 330 }, { x: 1170, y: 365, w: 480, h: 225 }, { x: 1170, y: 590, w: 480, h: 155 }, null],
  /** Harlie's editorial pass (v23): descriptive headings, one implementation note, one caption for the illustration. */
  sections: [
    {
      title: 'Inquiry scope',
      text: 'I defined the recurring questions the assistant could handle and the inquiries that required direct support from the leasing team.',
    },
    {
      title: 'Live property data',
      text: 'I specified when responses required current pricing and availability from the property API.',
    },
    {
      title: 'Staff escalation',
      text: 'I documented which requests required staff review and how they should be transferred to the leasing team.',
    },
    {
      title: 'Testing and deployment',
      text: 'I tested responses covering availability, pricing, tours, application status, and leasing policies. The assistant was introduced in lower-risk scenarios before deployment expanded to 18 properties.',
    },
  ],
}

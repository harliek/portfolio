/**
 * AI Leasing Agent (brief v19; copy from Harlie's editorial pass, v23, and the September 26 copy): a compact page.
 * The introduction, then three sections, each beside the illustrative interface it goes with, in the order Harlie
 * set for the pictures: the listing (current property information), the inbox (scope and escalation), the dashboard
 * (testing and rollout). No caption (Harlie's request).
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
  meta: ['Leasing and Operations Associate', 'Valiance Capital · 2024–2025'],
  lede: (
    <p>
      At Valiance Capital, I proposed an AI leasing assistant and defined its requirements for operations serving more than 1,000 tenants.
    </p>
  ),
  /** Harlie's wording; the sections follow the pictures' order (the listing first, then the inbox, then the dashboard). */
  sections: [
    {
      title: 'Current property information',
      text: 'I specified when responses required live pricing and availability from the property API.',
    },
    {
      title: 'Scope and escalation',
      text: 'I defined which questions the assistant should handle, which required staff review, and how to transfer those requests to the leasing team.',
    },
    {
      title: 'Testing and rollout',
      text: 'I tested responses about availability, pricing, tours, application status, and leasing policies. The assistant was introduced in lower-risk scenarios before deployment expanded to 18 properties.',
    },
  ],
}

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
 *
 * Harlie's QA pass, 2026-09-28 (for Harlie to confirm): the lede names what the assistant was for, "for recurring
 * renter questions" (projects.ts's description, "recurring leasing questions"; docs/content-provenance.md).
 *
 * Harlie's brief of 2026-09-28 (this page is the benchmark): the lede stays as it was; the three sections keep their
 * headings and read as scope, safeguards and rollout, each with the reason behind it (an old price quoted as current;
 * which questions a person must see; lower-risk scenarios first). No sentence says Harlie built or deployed the
 * production assistant, and its platform is not named. "With the conversation attached" rests on the earlier site
 * only; the tested topics and the lower-risk rollout on Harlie's earlier briefs (flagged for Harlie).
 */
export const LEASING = {
  title: 'AI Leasing Agent',
  /** The role, then the company and the years ("company – year", years only; Harlie's requests). */
  meta: ['Leasing and Operations Associate', 'Valiance Capital · 2024–2025'],
  lede: (
    <p>
      At Valiance Capital, I proposed an AI leasing assistant for recurring renter questions and defined its requirements for operations serving more than 1,000 tenants.
    </p>
  ),
  /** The sections follow the pictures' order (the listing first, then the inbox, then the dashboard). */
  sections: [
    {
      title: 'Current property information',
      text: 'To avoid quoting an old price as current, I specified which answers needed live pricing and availability.',
    },
    {
      title: 'Scope and escalation',
      text: 'I separated routine questions from those needing staff review, which went to the leasing team with the conversation attached.',
    },
    {
      title: 'Testing and rollout',
      text: 'I tested answers on availability, pricing, tours, application status, and leasing policies. The assistant then moved from lower-risk scenarios to 18 properties.',
    },
  ],
}

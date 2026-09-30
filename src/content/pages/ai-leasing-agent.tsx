/**
 * AI Leasing Agent (route /work/valiance; brief v19; copy from Harlie's copy brief of 2026-09-28): a compact page.
 * The introduction, then three sections, each beside the illustrative interface it goes with, in the order Harlie set
 * for the pictures: the listing, the inbox, the dashboard, in a card-hover gallery. No captions or labels on the
 * pictures (Harlie's request, 2026-09-28), and no "Illustrative screens" label in the meta line either (Harlie's
 * request, 2026-09-29).
 *
 * Facts: Leasing & Operations Associate, Valiance Capital, October 2024 to June 2025 (résumé); requirements for the
 * AI leasing assistant (résumé: "Defined development requirements"); adopted across 18 properties (résumé; no adoption
 * date). Harlie's statements (no project document records them): the proposal, the testing and the situations it was
 * tested against, the test topics (availability, pricing, tours, application status, leasing policies), approval and
 * judgment as the handoff points, and the third-party platform (no longer stated on the page; nothing on it says
 * Harlie built the assistant). Copy brief of 2026-09-29: the response-time and conversion sentence is removed; the
 * résumé's figures are not published.
 */
export const LEASING = {
  title: 'AI Leasing Agent',
  /** The role, then the company and the years ("company · years"; Harlie's requests). */
  meta: ['Leasing and Operations Associate', 'Valiance Capital · 2024–2025'],
  /** Harlie's revised text of 2026-09-30, verbatim (four sections); the sections follow the pictures' order. */
  lede: (
    <p>
      At Valiance Capital, I worked across leasing and operations for a portfolio of 18 properties.
    </p>
  ),
  sections: [
    {
      title: 'Operational problem',
      text: 'Staff repeatedly answered questions about properties, applications, availability, and leasing policies, creating avoidable manual work.',
    },
    {
      title: 'Automation boundary',
      text: 'Static policy questions could be handled consistently, while pricing, availability, approvals, and individual applications depended on current information or staff judgment.',
    },
    {
      title: 'Assistant design',
      text: 'I mapped recurring questions into requirements for an AI assistant, defining approved information sources, response boundaries, and staff handoffs.',
    },
    {
      title: 'Testing and adoption',
      text: 'I tested common leasing scenarios, documented failure cases, and refined responses that required revision. The assistant was adopted across all 18 properties.',
    },
  ],
}

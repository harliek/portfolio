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
  /** Harlie's copy brief of 2026-09-29, verbatim; the sections follow the pictures' order. */
  lede: (
    <p>
      While working in leasing and operations at Valiance Capital, I encountered recurring questions about properties and applications that the team answered repeatedly. I proposed an AI assistant to handle routine inquiries and translated those workflows into requirements for its information sources, responses, and staff handoffs.
    </p>
  ),
  sections: [
    {
      title: 'Information requirements',
      text: 'I distinguished questions answerable through approved property policies from those requiring current pricing and availability.',
    },
    {
      title: 'Staff handoff',
      text: 'I defined which requests the assistant could handle and when staff needed to take over for approval or individual review.',
    },
    {
      title: 'Testing and adoption',
      text: 'I tested responses across common leasing scenarios and identified answers requiring revision. The assistant was adopted across 18 properties.',
    },
  ],
}

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
 * Harlie built the assistant). Copy brief of 2026-09-29: the response-time and conversion sentence was removed; Harlie's
 * text of 2026-10-12 puts the résumé's 95% response-time figure back.
 */
export const LEASING = {
  title: 'AI Leasing Agent',
  /** The role, then the company (Harlie's text of 2026-10-12; it was "Leasing and Operations Associate", "Valiance Capital · 2024–2025"). */
  meta: ['Leasing and Operations', 'Valiance Capital'],
  /** Harlie's text of 2026-10-12, verbatim (four sections); the sections follow the pictures' order. */
  lede: (
    <p>
      At Valiance Capital, I worked across leasing and operations for 18 properties, where I identified opportunities to automate recurring tasks and improve communication with prospective residents.
    </p>
  ),
  sections: [
    {
      title: 'Operational problem',
      text: 'Leasing teams repeatedly answered similar questions about properties, availability, applications, and policies, creating unnecessary manual work.',
    },
    {
      title: 'Automation strategy',
      text: 'I identified which interactions could be automated and which required current information, staff judgment, or approval.',
    },
    {
      title: 'Assistant design',
      text: 'I translated recurring leasing questions into product requirements, defining approved information sources, response boundaries, and staff handoffs.',
    },
    {
      title: 'Testing and adoption',
      text: 'I tested leasing scenarios, documented failure cases, and refined the assistant’s responses. The assistant was adopted across all 18 properties, reducing response times by 95%.',
    },
  ],
}

import type { VisualStep } from '../../components/case/StickyVisual'

/**
 * Jumpstart Finance (route /work/jumpstart): copy from the client's brief
 * (Page 5), used verbatim where the brief gives text.
 *
 * Evidence
 * - Résumé: Founder & Product Lead, European Innovation Academy, Porto,
 *   Jun–Jul 2024, five-person international team (dates shown in the
 *   opening facts from projects.ts).
 * - Program pitch (JumpStart Finance/jumpstart presentation.pdf.pdf):
 *   p. 6 "Solution" lists gamified learning, personalized education and
 *   forums; p. 7 the four business model tiers; p. 10 "Traction &
 *   Validation" gives "150 sign-ups in 24 hours" (shown in Results as an
 *   excerpt of the title and that line only; the slide's second bullet,
 *   "Encouraging customer interviews", is not verified and is left out).
 * - Prototype screens proto 1–4: home (topics), profile (level path),
 *   lessons (search, lesson cards, start learning, start the test),
 *   community (a question, replies, each member's level).
 *
 * The problem sentence is the team's premise, not a research finding. No
 * testing results are claimed. The pitch's anxiety statistic, market size,
 * milestones and funding ask are not used. Three phones appear together only
 * in the opening overview; the sticky section shows one phone at a time.
 */
export const JUMPSTART_FINANCE = {
  subtitle: 'Financial education startup concept',
  description: (
    <p>
      A student venture in financial education, developed at the European Innovation Academy in Porto, with a mobile prototype built around
      short lessons, levels, and a community space.
    </p>
  ),
  summary: (
    <p>
      150 sign-ups in 24 hours, as reported in the team’s program pitch. An early indication of interest, not evidence of retention, revenue, or
      product-market fit.
    </p>
  ),
  heroCaption: 'Three prototype screens. Lessons, the home screen with learning topics, and the profile with numbered levels.',
  context: (
    <p>
      I was Founder and Product Lead on a five-person international team at the European Innovation Academy in Porto. We developed a financial
      education concept and mobile prototype during the 2024 program.
    </p>
  ),
  problem: <p>We explored how short lessons, visible progress, and community features could support a financial learning experience.</p>,
  steps: [
    {
      id: 'lessons',
      title: 'Lessons',
      body: (
        <p>
          The prototype grouped educational material into short lessons. The lessons screen pairs a search field with lesson cards. The first
          card introduces the basics of personal finance and offers a choice to start learning or take a test.
        </p>
      ),
      image: 'jumpstart-proto-3',
      caption: 'The lessons screen, with a search field and lesson cards.',
    },
    {
      id: 'progress',
      title: 'Progress',
      body: (
        <p>
          The profile showed progression through levels. It shows the member’s current level above a winding path of numbered levels. The
          team’s pitch listed gamified learning as part of the proposed solution.
        </p>
      ),
      image: 'jumpstart-proto-2',
      caption: 'The profile screen, with the current level and a path of numbered levels.',
    },
    {
      id: 'community',
      title: 'Community',
      body: (
        <p>
          A separate space supported the proposed community experience. The screen shows a member’s question about investing, replies from
          other members, and each member’s level beside their name. The pitch described forums as a way to build a network while learning
          personal finance.
        </p>
      ),
      image: 'jumpstart-proto-4',
      caption: 'The proposed community space, with a question, replies, and each member’s level.',
    },
  ] satisfies VisualStep[],
  results: (
    <p>
      The team reported 150 sign-ups in 24 hours in its program pitch. This was an early indication of interest and did not establish retention,
      revenue, or product-market fit.
    </p>
  ),
  resultsFigureCaption: 'Excerpt of the traction slide from the team’s 2024 program pitch.',
  /** Optional supporting material after the results. */
  businessModel: {
    label: 'Supporting material',
    title: 'Proposed business model',
    body: (
      <p>
        The pitch proposed free access to basic features and educational content, with paid options for in-app purchases and a monthly or yearly
        premium subscription. These tiers were business model assumptions, not revenue results.
      </p>
    ),
    caption: 'The four proposed tiers from the 2024 program pitch.',
  },
}

import type { StorySection } from '../../components/case/CaseScroll'
import type { GroupPhone, PhoneFocus } from '../../components/pages/jumpstart-finance/PhoneGroup'

/**
 * Jumpstart Finance (route /work/jumpstart), CaseScroll with `custom` media:
 * a group of three original prototype phones whose emphasis follows the story
 * (brief-v8 section 14; PhoneGroup.tsx). The role is Founder and Product Lead
 * (the pitch's and the cover artwork's "CEO" are not used); the result is the
 * sentence Harlie supplied in brief-v8.
 *
 * Evidence (docs/content-provenance.md, Jumpstart Finance)
 * - Résumé: "Jumpstart Finance | Founder & Product Lead · European Innovation
 *   Academy, Porto", Jun to Jul 2024; "Led a 5-person international team from
 *   customer discovery to prototype and pitch, driving 150 sign-ups in 24
 *   hours"; "Translated user research into gamified mechanics, personalized
 *   journeys, monetization, and product requirements".
 * - Pitch (JumpStart Finance/jumpstart presentation.pdf.pdf, 12 pp., text
 *   checked with pdftotext): p. 5 "Gamified learning leads to increased
 *   engagement"; p. 6 "Build your network through forums as you compete and
 *   learn personal finance"; p. 10 "Traction & Validation, 150 sign-ups in 24
 *   hours". The sign-ups were reported in the pitch, so the result says so.
 * - Competitor slide (p. 4, public/media/img/jumpstart-competitors, not shown on
 *   the page): Robinhood, Zogo and Acorn(s) have no forum; only Zogo is
 *   gamified. The slide spells the brand "Acorn"; the page uses its name, Acorns.
 * - Prototype screens (JumpStart Finance/proto 3, 2, 4.png, each cropped to a
 *   600×1210 canvas in src/content/crops/jumpstart-finance.ts): lessons with a
 *   lesson card offering Start learning and Start the test; a profile at Level 1
 *   above a path of numbered levels; a community thread where members answer a
 *   question, each shown with their level.
 * - "I led the product concept, positioning, prototype, and business model"
 *   and "short lessons" are Harlie's own words (brief-v5 section 21), consistent
 *   with the résumé's product requirements and gamified mechanics.
 *
 * Harlie's own statement kept as written and reported as not shown by the
 * sources: "young adults" (the pitch's problem slide speaks of adults).
 *
 * The phone PNG in the opening is the redesigned cover artwork (its label says
 * Concept cover); the group shows only the original 2024 screens, and its one
 * media label says so. No presentation slides appear on the page.
 */

/** The group, in reading order: learning, motivation, peer support. */
export const JUMPSTART_PHONES: GroupPhone[] = [
  { image: 'jf-screen-lessons', name: 'Lessons' },
  { image: 'jf-screen-progress', name: 'Progress' },
  { image: 'jf-screen-community', name: 'Community' },
]

/**
 * The phone that leads for each story position: the opening (-1) and each
 * section in [...sections, outcome] order. The outcome shows the balanced
 * overview of the whole prototype.
 */
export const jumpstartFocus = (active: number): PhoneFocus => (active < 0 ? 0 : active <= 2 ? active : 'all')

export const JUMPSTART_FINANCE = {
  meta: ['Founder and Product Lead · Student venture, Porto', 'June to July 2024 · Prototype and academy pitch'],
  summary: (
    <p>
      I led a <strong>five&#8209;person team</strong> at the European Innovation Academy building Jumpstart, a financial education app for young adults.
    </p>
  ),
  /** The group's one media label: the phones are the original screens, the cover above is later artwork. */
  mediaLabel: 'Original 2024 prototype',
  sections: [
    {
      id: 'lessons',
      title: 'Short lessons',
      body: (
        <>
          <p>
            Many young adults want to understand personal finance but struggle to stay engaged with conventional financial education.
          </p>
          <p>
            I led the product concept, positioning, prototype, and business model. The prototype teaches through <strong>short lessons</strong>, each paired
            with a test.
          </p>
        </>
      ),
    },
    {
      id: 'progress',
      title: 'Visible progress',
      body: (
        <p>
          Our premise was that gamified learning would hold people’s attention. Each profile places the learner on <strong>a path of numbered levels</strong>,
          so progress stays visible.
        </p>
      ),
    },
    {
      id: 'community',
      title: 'Peer support',
      body: (
        <p>
          Our comparison of Robinhood, Zogo, and Acorns found no community forum. We added <strong>a community where members answer each other’s questions</strong>,
          with each member’s level beside their name.
        </p>
      ),
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        We reported <strong>150 sign&#8209;ups in 24 hours</strong> during the academy pitch. This showed early interest in the concept.
      </p>
    ),
  } satisfies StorySection,
}

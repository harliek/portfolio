import type { CaseMedia, StorySection } from '../../components/case/CaseScroll'

/**
 * Jumpstart Finance (route /work/jumpstart), CaseScroll with `states` media.
 * Copy is brief-v5 section 21, edited only for the copy rules and the lead
 * decisions: the role is Founder and Product Lead (the pitch's "CEO" and the
 * cover artwork's "CEO" are not used), and the sign-up figure is the one the
 * academy pitch reported.
 *
 * Evidence (docs/content-provenance.md, Jumpstart Finance)
 * - Résumé: "Jumpstart Finance | Founder & Product Lead · European Innovation
 *   Academy, Porto", Jun to Jul 2024; "Led a 5-person international team from
 *   customer discovery to prototype and pitch, driving 150 sign-ups in 24
 *   hours"; "Translated user research into gamified mechanics, personalized
 *   journeys, monetization, and product requirements".
 * - Pitch (JumpStart Finance/jumpstart presentation.pdf.pdf, 12 pp.): p. 5
 *   "Gamified learning leads to increased engagement", "Personalized
 *   education based on experience and goals"; p. 6 forums "as you compete
 *   and learn personal finance"; p. 7 business model; p. 10 "Traction &
 *   Validation, 150 sign-ups in 24 hours". The sign-ups were reported IN the
 *   pitch (they did not follow it), so the result says the pitch reported them.
 *   The problem's second sentence is the p. 5 premise, stated as a premise.
 * - What we built (round 2, R2-02): the positioning decision from the pitch's
 *   competitor comparison (p. 4, JumpStart Finance/competitors.png; the
 *   slide itself is not shown). Of Robinhood, Zogo and Acorn(s), none has a
 *   forum and only Zogo is gamified (Robinhood is not educational either).
 *   The slide spells the brand "Acorn"; the page uses its name, Acorns. The
 *   three features named are the three screens on the stage (lessons, the
 *   profile's level path, the community). The earlier feature list, with the
 *   unshown "personalized learning", and the summary's second sentence (the
 *   metadata's status) were removed.
 * - Prototype screens (JumpStart Finance/proto 1–4.png, cropped to one
 *   600×1210 canvas each in src/content/crops/jumpstart-finance.ts): home
 *   with topics, lessons with Start learning and Start the test, a profile
 *   with a numbered level path, a community with questions, replies and
 *   each member's level. Captions only describe what each screen shows.
 *
 * Harlie's own statement kept as written and reported as not shown by the
 * sources: "young adults" (the pitch's problem slide speaks of adults).
 *
 * No presentation slides (competitors, business model, traction) appear on
 * the page (brief-v5 section 24). The phone PNG in the opening is the
 * redesigned cover artwork; the stage shows only the original 2024 screens,
 * and the opening caption's “Original 2024 prototype” tag says which is which
 * (round 1, R1-04: no second qualification). The role is stated once, in the
 * metadata (R1-01).
 */

export const JUMPSTART_FINANCE = {
  meta: ['Founder and Product Lead · Student venture, Porto', 'June to July 2024 · Prototype and academy pitch'],
  summary: (
    <p>
      At the European Innovation Academy in Porto, I led a <strong>five&#8209;person team</strong> building Jumpstart, a financial education app for young
      adults.
    </p>
  ),
  media: {
    kind: 'states',
    // Every screen is a 600×1210 transparent canvas (the phone plus 8px), so the phone keeps one size.
    frameRatio: '600 / 1210',
    opening: {
      image: 'jf-screen-home',
      label: 'Original 2024 prototype',
      caption: 'The home screen.',
    },
  } satisfies CaseMedia,
  sections: [
    {
      id: 'problem',
      title: 'The problem',
      body: (
        <p>
          Many young adults want to understand personal finance but struggle to stay engaged with conventional financial education. Our premise was
          that gamified learning would keep them engaged.
        </p>
      ),
      visual: {
        image: 'jf-screen-lessons',
        caption: 'The lessons screen. Each lesson card pairs the reading with a test.',
      },
    },
    {
      id: 'built',
      title: 'What we built',
      body: (
        <p>
          In our comparison of Robinhood, Zogo, and Acorns, none offered a community forum and only Zogo was gamified. So we built the prototype around gamified
          lessons, a level path, and a community where members answer each other’s questions. I led the product concept,
          positioning, prototype, and business model.
        </p>
      ),
      visual: {
        image: 'jf-screen-progress',
        caption: 'The profile tracks progress along a path of numbered levels.',
      },
    },
  ] satisfies StorySection[],
  outcome: {
    id: 'result',
    title: 'The result',
    body: (
      <p>
        We pitched Jumpstart at the academy, reporting <strong>150 sign&#8209;ups in 24 hours</strong>. The response gave us an early signal of demand for a more
        engaging way to learn personal finance.
      </p>
    ),
    visual: {
      image: 'jf-screen-community',
      caption: 'The community, with each member’s level beside their name.',
    },
  } satisfies StorySection,
}

import type { ImageId } from '../media'

/**
 * Jumpstart Finance (brief v19; copy from Harlie's editorial pass, v23, and
 * the September 26 copy): a compact page. The introduction, then a section for
 * each of the three phone screens, the screens together beside them; only the
 * current section's screen is emphasised (CaseStory's phones).
 *
 * Facts: student venture at the European Innovation Academy, Porto, June to
 * July 2024; Harlie was Founder and Product Lead of a five-person team
 * (résumé). The pitch deck (p. 10) reports "150 sign-ups in 24 hours" at the
 * academy pitch; it is stated as sign-ups, not adoption. Harlie adds that
 * the concept was presented to a board of investors (Harlie's statement;
 * the project files do not show it). Not claimed: a launched app, what people
 * signed up for.
 *
 * Harlie's QA pass, 2026-09-28 (for Harlie to confirm): the phones follow the September 26 sections again. The mapping
 * was set for the earlier sections (Financial education, Learning progression, Community discussion), so the forum
 * came forward for "Pitch and early interest" and the profile for "Community discussion". Now Home (the topics) comes
 * forward for "Learning structure", the Community forum for "Community discussion", the Profile for "Pitch and early
 * interest"; the other way round (Profile first, for its learning path) would also fit. Two sentences read more
 * directly: "The prototype’s learning path used levels to keep users progressing" (was "The prototype used a learning
 * path with levels to encourage continued learning") and "The prototype’s forum let users ask questions ..." (was "The
 * proposed forum would let ..."; the forum screen is part of the 2024 prototype, jf-tile-third).
 *
 * Copy pass of 2026-09-28: the three phones are ChatGPT redraws (PNG Tiles, 2026-09-25) of the 2024 prototype screens
 * (JumpStart Finance/proto 1 to 4) with details of their own. No caption or label on the phones (Harlie's request,
 * 2026-09-28: "there should be no captions for any photos").
 */
export const JUMPSTART = {
  title: 'Jumpstart Finance',
  /** The role, then the status and the year (the program and Porto are in the lede; copy brief of 2026-09-29). Role
   * "Student Founder and CEO" and no "Reconstructed screens" label (Harlie's request, 2026-09-29). */
  meta: ['Student Founder and CEO', 'Student venture · 2024'],
  /** Harlie's copy brief of 2026-09-29, verbatim. */
  lede: (
    <p>
      At the European Innovation Academy in Porto, I led a five&#8209;person international team developing a mobile financial education product.
    </p>
  ),
  /**
   * Harlie's three phones, left to right as on the homepage tile (Profile, Home, Community); `step` is the sections
   * each belongs to, one phone at a time, the middle first: Home with the topics for the first two sections (User
   * problem, Product direction), then the Community forum (Experience design), then the Profile (Validation).
   */
  phones: [
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: 3 },
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: [0, 1] },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: 2 },
  ],
  /**
   * Harlie's wording, verbatim (Harlie's revised text of 2026-09-30, four sections; before, the copy brief of 2026-09-29). The audience change is Harlie's account (no project file
   * records the ages or the interview findings). The prototype's lessons, level path and forum are the 2024 screens
   * (pitch pp.5–6; proto 2 to 4); "short" lessons stays out (no screen shows a length). The 150 sign-ups are attributed
   * to the program pitch (p.10), where what was counted is not stated; no outcome is drawn from them. The landing page:
   * the pitch's webflow link and the rebuild README.
   */
  features: [
    {
      title: 'User problem',
      text: 'We initially targeted young adults broadly, but interviews showed that younger users with less financial experience had a clearer need for structured guidance.',
    },
    {
      title: 'Product direction',
      text: 'We shifted the concept toward foundational skills in spending, saving, and investing, organized around progressive learning levels.',
    },
    {
      title: 'Experience design',
      text: 'The prototype combined lessons, visible progress, financial tools, and a community forum for questions and discussion.',
    },
    {
      title: 'Validation',
      text: 'I led the product direction, research, prototype, and business model, then presented the concept to investors. Jumpstart attracted 150 sign-ups within 24 hours.',
    },
  ],
}

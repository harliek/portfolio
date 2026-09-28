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
 * Harlie's brief of 2026-09-28: the phones carry the features, so the three sections give the reasoning instead, in
 * the order premise, point of difference, validation. "Learning design": levels and tailored lessons came from one
 * premise, that gamified, personalized learning keeps people engaged (the deck). "Community forum": the reason for it,
 * the competitor comparison (JumpStart Finance/competitors.png: Zogo was educational and gamified, and none of the
 * three apps compared had a forum). No pivot toward younger users is claimed; no source documents one. The phone
 * mapping is unchanged: Home (the topics) for Learning design, the Community forum for Community forum, the Profile
 * for the pitch.
 */
export const JUMPSTART = {
  title: 'Jumpstart Finance',
  meta: ['Founder and Product Lead', 'Student venture, Portugal · 2024'],
  lede: (
    <p>
      At the European Innovation Academy in Porto, I led a five&#8209;person team developing a financial education app concept.
    </p>
  ),
  /**
   * Harlie's three phones, left to right as on the homepage tile (Profile, Home, Community); `step` is the one section
   * each belongs to, one phone at a time, the middle first: Home with the topics, then the Community forum, then the
   * Profile.
   */
  phones: [
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: 2 },
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: 0 },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: 1 },
  ],
  /** The product reasoning behind the screens (Harlie's brief, 2026-09-28), not a tour of their features. */
  features: [
    {
      title: 'Learning design',
      text: 'Levels and tailored lessons came from one premise, that gamified, personalized learning keeps people engaged.',
    },
    {
      title: 'Community forum',
      text: 'Zogo was already gamified, but none of the apps we compared had a forum, so community set us apart.',
    },
    {
      // The figure the team's pitch cited (the pitch deck, p. 10), stated as what the pitch cited, not as customers or
      // active users. Not claimed: what people signed up for. "Investors" is Harlie's statement.
      title: 'Pitch and early interest',
      text: 'I presented the concept to investors, citing 150 sign‑ups in 24 hours.',
    },
  ],
}

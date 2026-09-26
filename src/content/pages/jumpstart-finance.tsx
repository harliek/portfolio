import type { ImageId } from '../media'

/**
 * Jumpstart Finance (brief v19; copy from Harlie's editorial pass, v23, and
 * the September 26 copy): a compact page. The introduction, then a section for
 * each of the three phone screens, the screens together beside them; only the
 * current section's screen is emphasised (PhoneSections).
 *
 * Facts: student venture at the European Innovation Academy, Porto, June to
 * July 2024; Harlie was Founder and Product Lead of a five-person team
 * (résumé). The pitch deck (p. 10) reports "150 sign-ups in 24 hours" at the
 * academy pitch; it is stated as sign-ups, not adoption. Harlie adds that
 * the concept was presented to a board of investors (Harlie's statement;
 * the project files do not show it). Not claimed: a launched app, what people
 * signed up for.
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
   * each belongs to, one phone at a time in Harlie's order: the middle first, then the left, then the right.
   */
  phones: [
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: 1 },
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: 0 },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: 2 },
  ],
  /** Harlie's wording. */
  features: [
    {
      title: 'Learning structure',
      text: 'We organized financial topics around users’ experience and goals. The prototype used a learning path with levels to encourage continued learning.',
    },
    {
      title: 'Community discussion',
      text: 'The proposed forum would let users ask questions and exchange perspectives on financial topics.',
    },
    {
      // A reported figure from the project's pitch deck (p. 10), not customers or active users.
      title: 'Pitch and early interest',
      text: 'I presented the concept to investors. The project’s pitch deck reported 150 sign‑ups in 24 hours.',
    },
  ],
}

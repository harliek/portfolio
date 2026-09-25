import type { ImageId } from '../media'

/**
 * Jumpstart Finance (brief v19; copy from Harlie's editorial pass, v23): a
 * compact page. The introduction and a short section for each of the three
 * phone screens, the screens fixed beside them (the section's own screen
 * comes forward), and the qualified result.
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
      At the European Innovation Academy in Porto, I led a five&#8209;person team developing a financial education app concept. My work covered product direction, positioning, prototyping, and the business model.
    </p>
  ),
  /**
   * Harlie's three phones, left to right as on the homepage tile (Profile, Home, Community); `step` is the section (or
   * sections) each one lights: the learning experience lights the learning path and the topics, the discussion lights
   * the community, and the pitch lights the whole app.
   */
  phones: [
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: [0, 2] },
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: [0, 2] },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: [1, 2] },
  ],
  /** Harlie's editorial pass (v23): the product decisions only (no competitor claims, no pitch narration). */
  features: [
    {
      title: 'Designing the learning experience',
      text: 'We organized budgeting, banking, investing, and tax topics around users’ experience and goals. The prototype used a learning path with numbered levels to encourage continued learning.',
    },
    {
      title: 'Supporting discussion',
      text: 'The proposed forum would let users ask questions and exchange perspectives alongside the lessons.',
    },
    {
      // The sign-ups are the pitch deck's (p. 10); the investor presentation is Harlie's own statement.
      title: 'Pitch and response',
      text: 'I presented the concept to a board of investors. The pitch generated 150 sign‑ups within 24 hours.',
    },
  ],
}

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
 * academy pitch; it is stated as early interest in the concept, not
 * adoption. Not claimed: an investor pitch, a launched app, what people
 * signed up for.
 */
export const JUMPSTART = {
  title: 'Jumpstart Finance',
  meta: ['Founder and Product Lead', 'Student venture, Portugal 2024'],
  lede: (
    <p>
      I led a five&#8209;person team at the European Innovation Academy in Porto to develop a financial education app concept, which drew 150 sign&#8209;ups
      within 24 hours of its pitch. My responsibilities included product direction, positioning, prototyping, and business&#8209;model development.
    </p>
  ),
  /** Harlie's three phones (the homepage tile's, left to right); `step` is the group each one illustrates. */
  phones: [
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: 0 },
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: 1 },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: 2 },
  ],
  /** Harlie's editorial pass (v23): the product decisions only (no competitor claims, no pitch narration). */
  features: [
    {
      title: 'Financial education',
      text: 'The concept organized financial education around users’ experience and goals, with topics including budgeting, banking, investing, and taxes.',
    },
    {
      title: 'Learning progression',
      text: 'The prototype used numbered levels and a learning path to structure progression through the material. Gamification was intended to support engagement.',
    },
    {
      title: 'Community discussion',
      text: 'The proposed community forum allowed users to ask questions and exchange perspectives alongside the learning content.',
    },
  ],
}

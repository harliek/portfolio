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
  meta: ['Founder and Product Lead', 'Student venture, Portugal – 2024'],
  lede: (
    <p>
      At the European Innovation Academy in Porto, I led a five&#8209;person team developing a financial education app concept. My work covered product direction, positioning, prototyping, and business&#8209;model development.
    </p>
  ),
  /** Harlie's three phones, left to right as on the homepage tile (Profile, Home, Community); `step` is the section each one illustrates. */
  phones: [
    { image: 'jf-tile-profile' as ImageId, name: 'Profile', step: 1 },
    { image: 'jf-tile-home' as ImageId, name: 'Home', step: 0 },
    { image: 'jf-tile-third' as ImageId, name: 'Community', step: 2 },
  ],
  /** Harlie's editorial pass (v23): the product decisions only (no competitor claims, no pitch narration). */
  features: [
    {
      title: 'Organizing the learning content',
      text: 'We organized topics such as budgeting, banking, investing, and taxes around users’ experience and goals.',
    },
    {
      title: 'Building a learning path',
      text: 'The prototype used a learning path with numbered levels to encourage continued learning.',
    },
    {
      title: 'Making room for discussion',
      text: 'The proposed forum would let users ask questions and discuss what they were learning.',
    },
  ],
  /** Under the three sections (Harlie's request). The sign-ups are the pitch deck's (p. 10); the investor presentation is Harlie's own statement (not shown in the project files). */
  result: { title: 'Result', text: '150 sign‑ups within 24 hours of the pitch. I presented the concept to a board of investors.' },
}

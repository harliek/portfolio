import type { ImageId } from '../media'

/**
 * Jumpstart Finance (brief v18): a compact page. The introduction with the
 * three original 2024 prototype screens beside it (a stable composition),
 * a short line for each, and the qualified result.
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
  meta: ['Founder and Product Lead', 'Student venture, Porto', 'June to July 2024'],
  lede: (
    <p>
      I led a five&#8209;person team at the European Innovation Academy building Jumpstart, a financial education app for young adults. I led the product
      concept, positioning, prototype, and business model.
    </p>
  ),
  phones: [
    { image: 'jf-screen-lessons' as ImageId, name: 'Lessons' },
    { image: 'jf-screen-progress' as ImageId, name: 'Progress' },
    { image: 'jf-screen-community' as ImageId, name: 'Community' },
  ],
  label: 'Original 2024 prototype screens',
  features: [
    { title: 'Short lessons', text: 'Personal finance taught in short lessons, each paired with a test, for people who find conventional financial education hard to stay with.' },
    { title: 'Visible progress', text: 'Each profile places the learner on a path of numbered levels, so progress stays visible.' },
    {
      title: 'Peer support',
      text: 'Our comparison of Robinhood, Zogo, and Acorns found no community forum, so we added one where members answer each other’s questions.',
    },
  ],
  result: 'At the academy pitch in 2024 we reported 150 sign-ups in 24 hours, early interest in the concept rather than proven adoption.',
}

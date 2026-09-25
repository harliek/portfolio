import type { ImageId } from '../media'

/**
 * Jumpstart Finance (brief v16): one composition of the three original 2024
 * prototype screens (Lessons left, Progress centre, Community right) that
 * the story moves through: each screen comes toward the viewer for its
 * section and returns; at the end all three stand together again.
 *
 * Facts: student venture at the European Innovation Academy, Porto, June to
 * July 2024; Harlie was Founder and Product Lead of a five-person team
 * (résumé). The result is qualified as it always has been: "We reported 150
 * sign-ups in 24 hours during the academy pitch" (pitch deck p. 10). Not
 * claimed: an investor pitch, a launched app, what people signed up for.
 */
export const JUMPSTART = {
  title: 'Jumpstart Finance',
  meta: ['Founder and Product Lead', 'Student venture, Porto', 'June to July 2024'],
  summary: (
    <p>
      I led a <strong>five&#8209;person team</strong> at the European Innovation Academy building Jumpstart, a financial education app for young adults.
    </p>
  ),
  label: 'Original 2024 prototype',
  phones: [
    { image: 'jf-screen-lessons', name: 'Lessons' },
    { image: 'jf-screen-progress', name: 'Progress' },
    { image: 'jf-screen-community', name: 'Community' },
  ] satisfies { image: ImageId; name: string }[],
  /** Each story step and the phone it brings forward (an index into `phones`). */
  steps: [
    {
      id: 'lessons',
      phone: 0,
      title: 'Short lessons',
      body: (
        <>
          <p>Many young adults want to understand personal finance but struggle to stay engaged with conventional financial education.</p>
          <p>
            I led the product concept, positioning, prototype, and business model. The prototype teaches through <strong>short lessons</strong>, each paired
            with a test.
          </p>
        </>
      ),
    },
    {
      id: 'progress',
      phone: 1,
      title: 'Visible progress',
      body: (
        <p>
          Our premise was that gamified learning would hold people’s attention. Each profile places the learner on <strong>a path of numbered levels</strong>, so
          progress stays visible.
        </p>
      ),
    },
    {
      id: 'community',
      phone: 2,
      title: 'Peer support',
      body: (
        <p>
          Our comparison of Robinhood, Zogo, and Acorns found no community forum. We added <strong>a community where members answer each other’s questions</strong>,
          with each member’s level beside their name.
        </p>
      ),
    },
  ],
  result: {
    figure: '150',
    unit: 'sign‑ups in 24 hours',
    body: <p>We reported 150 sign&#8209;ups in 24 hours during the academy pitch. This showed early interest in the concept.</p>,
  },
}

import type { Section, Visual } from '../../components/case/CaseScroll'
import type { ImageId } from '../media'

/**
 * Jumpstart Finance (route /work/jumpstart), CaseScroll. Latest brief,
 * section 22: role, program context and status clear; "Product premise"
 * (the evidence describes an idea, not a validated problem); lessons,
 * progression and community in one consistently sized phone frame; the
 * sign-up figure qualified as a program-pitch result beside the pitch
 * evidence; pricing only in the supplementary disclosure.
 *
 * Evidence (docs/content-provenance.md, Jumpstart Finance)
 * - Résumé: Founder & Product Lead, European Innovation Academy, Porto,
 *   June to July 2024; "Led a 5-person international team from customer
 *   discovery to prototype and pitch". Customer discovery and user research
 *   are not published (no evidence in the folder).
 * - Pitch (JumpStart Finance/jumpstart presentation.pdf.pdf), the only
 *   documented design reasoning:
 *     p. 4 Competitors: Jumpstart, Robinhood, Zogo and Acorn against
 *       Educational, Forum, Gamified and Real-time market data. The team
 *       marked Forum as missing for all three competitors (Robinhood has
 *       only real-time data; Zogo educational and gamified; Acorn
 *       educational and real-time data).
 *     p. 5 Solution: "Gamified learning leads to increased engagement.";
 *       "Personalized education based on experience and goals."
 *     p. 6 "Build your network through forums as you compete and learn
 *       personal finance."
 *     p. 7 Business model (four tiers), p. 10 "150 sign-ups in 24 hours".
 * - Prototype screens (proto 1–4): home with topics, lessons with a search
 *   field and Start learning / Start the test, profile with a numbered level
 *   path, community with questions, replies and each member's level.
 *
 * Not used: the pitch's anxiety statistic, market size, milestones, funding
 * ask, team photos, "Encouraging customer interviews", and the redrawn
 * presentation mockups (jumpstart-mockup-*), which add details the 2024
 * prototype did not have. Every frame here is an original prototype screen.
 */

export const JUMPSTART_FINANCE = {
  situation: (
    <p>
      Jumpstart Finance was a student venture for <strong>mobile financial education</strong>, developed at the European Innovation Academy in
      Porto. As Founder and Product Lead, I led a <strong>five-person international team</strong> from the product concept to a prototype and a
      program pitch.
    </p>
  ),
  opening: {
    kind: 'image',
    image: 'jf-screen-home',
    caption: 'Home screen from the team’s 2024 prototype. The balance and events are sample content.',
  } satisfies Visual,
  sections: [
    {
      id: 'premise',
      title: 'Product premise',
      blocks: [
        {
          id: 'premise-idea',
          body: (
            <>
              <p>
                The pitch rested on a premise rather than a tested problem. Its solution slide states that{' '}
                <strong>gamified learning leads to increased engagement</strong>. It also proposed education matched to each person’s experience
                and goals, and forums where members learn alongside each other.
              </p>
              <p>These were the team’s proposals. The project materials include no research that tested them.</p>
            </>
          ),
        },
      ],
    },
    {
      id: 'decisions',
      title: 'Design decisions',
      blocks: [
        {
          id: 'role',
          body: (
            <p>
              I worked with the team on the <strong>product concept, positioning, prototype, and business model</strong>. The prototype carries
              the pitch’s proposals across four screens, from the home screen’s learning topics to lessons, a profile, and a community space.
            </p>
          ),
        },
        {
          id: 'lessons',
          title: 'Lessons',
          body: (
            <p>
              The pitch’s first proposal was game-like learning. In the prototype, financial education is broken into{' '}
              <strong>short lessons</strong>, and each lesson card pairs the reading with a test.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'jf-screen-lessons',
            caption: 'The lessons screen, with a lesson search and a card offering Start learning or Start the test.',
          },
        },
        {
          id: 'progression',
          title: 'Progression',
          body: (
            <p>
              Progress appears as a <strong>path of numbered levels</strong> on the profile. The same level is shown beside each member’s name in
              the community, in line with the pitch’s description of members who “compete and learn” together, so a level is a personal record
              that other members can also see.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'jf-screen-progress',
            caption: 'The profile screen, with the member’s current level above a path of numbered levels.',
          },
        },
        {
          id: 'community',
          title: 'Community',
          body: (
            <p>
              The third proposal was a forum where members <strong>build a network while they learn</strong>. In the pitch’s 2024 comparison
              with Robinhood, Zogo, and Acorn, forums were the one feature the team marked as missing from all three.
            </p>
          ),
          visual: {
            kind: 'image',
            image: 'jf-screen-community',
            caption: 'The community screen, with a question about investing, replies from other members, and each member’s level.',
          },
        },
      ],
    },
  ] satisfies Section[],
  results: (
    <p>
      The team’s program pitch reported <strong>150 sign-ups in 24 hours</strong>, without stating what people signed up for. It was an early
      signal of interest presented at the program, not evidence of retention, revenue, or product-market fit.
    </p>
  ),
  resultsFigure: {
    image: 'jumpstart-traction',
    caption: 'Excerpt of the Traction and Validation slide from the team’s 2024 program pitch.',
  } satisfies { image: ImageId; caption: string },
  /** Optional supplementary material after the results (a labelled disclosure). */
  businessModel: {
    body: (
      <p>
        The pitch proposed free basic features and educational content, with paid in-app purchases and a monthly or yearly premium
        subscription. These tiers were <strong>business-model assumptions</strong>, not sales or revenue.
      </p>
    ),
    caption: 'The four proposed tiers from the 2024 program pitch.',
  },
}

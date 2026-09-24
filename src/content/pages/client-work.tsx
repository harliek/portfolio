import type { ReactNode } from 'react'
import type { PlaceholderSpec } from '../../components/media/Placeholder'
import type { VideoId } from '../media'

/**
 * Client Work (route /work/shift), FilmScroll. Latest brief, section 23: all
 * three projects readable by scrolling, a jump-navigation row, one stable
 * player beside the explanations on desktop, each film with its explanation
 * on mobile, and the brief's exact Nickleby wording.
 *
 * Documented contributions only (docs/content-provenance.md, Shift):
 * - Harlie's weekly journals and Data 197 report (Shift Content/Shift
 *   journals.pdf): equipment and lighting setup and B-roll on "a shoot filming
 *   interviews for an investment firm"; setup, lighting, coordinating and
 *   behind-the-scenes documentation on the two-day Aristocracy production;
 *   "a branded Run Club event" and "live event coverage"; pitch decks, six
 *   Google Ads campaigns and the Google Ads Search Certification, LinkedIn
 *   posts, Squarespace CSS, and editing B-roll into sequences in Premiere Pro.
 * - The agency's own project summaries (Shift Content/Film case studies.pdf)
 *   for each client, the assignment and the deliverables. Harlie's share of
 *   those deliverables is not established, so they are stated as the
 *   agency's, never credited to her.
 *
 * Exactly three client films, Nickleby first. nickleby-640.mp4 is a lossless
 * remux of "Nickleby Capital Video 1.mp4" (Video 2 is never published and
 * "Video 1" never appears in visitor copy). The journal does not name the
 * investment firm, so linking that shoot to Nickleby Capital is the site's
 * existing inference (the brief's own wording is used). The third title is
 * The Night Club Global Tour; the "Videographer" credit on Harlie's previous
 * site is not verified, so only production support is stated.
 *
 * The campaign photographs and film frames that used to sit beside the films
 * are gone: they are agency deliverables that do not show Harlie's part.
 */

export interface ClientFilm {
  /** Section id and URL hash (/work/shift#aristocracy). */
  id: 'nickleby' | 'aristocracy' | 'night-club'
  /** Section heading and jump-navigation label. */
  name: string
  /** Short kind of film, shown under the heading. */
  kind: string
  video: VideoId
  /** Caption under the player (FilmScroll adds the provenance label "Agency work" to the first film only). */
  caption: string
  /** The client and what the agency was asked to make. */
  client: ReactNode
  /** Harlie's documented part. */
  contribution: ReactNode
  /** What the agency delivered (its own project summary), or what is shown. */
  delivered: ReactNode
  /** A draft placeholder for authentic evidence of Harlie's own part (docs/asset-requests.md). */
  evidence?: PlaceholderSpec
}

export const CLIENT_WORK = {
  situation: (
    <p>
      During my internship at Shift Content, a London agency for video and brand content, I supported client shoots with{' '}
      <strong>equipment setup, lighting, coordination, and B-roll</strong>, alongside the agency’s marketing work. Three of those projects are
      below, each with its film.
    </p>
  ),
  /** The ownership boundary, stated once in the opening. */
  note: 'These films are agency productions made by a team. My part in each one is described beside the film.',
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      kind: 'Interview film',
      video: 'nickleby',
      caption: 'Interview film produced by Shift Content for Nickleby Capital.',
      client: (
        <p>
          Shift Content produced interview films for Nickleby Capital during a one-day shoot. The investment firm needed{' '}
          <strong>client testimonials and answers to frequently asked questions</strong>, plus a short social video, all from that day.
        </p>
      ),
      contribution: (
        <p>
          I helped set up the <strong>equipment and lighting</strong> and filmed <strong>B-roll</strong> during the interviews.
        </p>
      ),
      delivered: <p>Five testimonials, nine FAQ responses, and a 60-second social video. The film here is one of the interview films.</p>,
      evidence: {
        id: 'client-work-nickleby-broll',
        ratio: '16 / 9',
        label: 'A still from the B-roll I filmed during the Nickleby Capital interviews.',
        description:
          'Client Work, Nickleby Capital section, after the section text and before the transcript (desktop text column; below the film and text on phones). Purpose: authentic evidence of the B-roll contribution, since the published film is an agency edit and does not show which shots were Harlie’s. Subject: one frame from Harlie’s own B-roll footage of the interview day (hands, room detail, cutaways or setup), not a frame from the finished film. Composition: a single clean 16:9 frame, no burned-in subtitles, no interviewee faces unless releases allow it. 16:9, 1920×1080 (at least 1280×720). Authentic footage only; no illustration. Replacement file: Shift Content/nickleby-broll-still.jpg (registered as image id client-work-nickleby-broll).',
      },
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy',
      kind: 'Fashion campaign',
      video: 'aristocracy',
      caption: 'Campaign film produced by Shift Content for Aristocracy London, shown uncropped in its original frame.',
      client: (
        <p>
          Aristocracy London is a fashion brand. Shift Content produced its <strong>Spring/Summer campaign over two days</strong>, ahead of the
          opening of its Manchester store.
        </p>
      ),
      contribution: (
        <p>
          I helped with <strong>setup, lighting, and coordination</strong>, and documented the camera and creative work behind the scenes.
        </p>
      ),
      delivered: <p>A campaign video, e-commerce imagery, and social assets.</p>,
      evidence: {
        id: 'client-work-aristocracy-bts',
        ratio: '3 / 2',
        label: 'A behind-the-scenes photograph I took of the camera and lighting setup on the Aristocracy shoot.',
        description:
          'Client Work, Aristocracy section, after the section text and before the transcript (desktop text column; below the film and text on phones). Purpose: authentic evidence of Harlie’s documented role (setup, lighting, coordination and behind-the-scenes documentation over the two-day production). Subject: one of Harlie’s own behind-the-scenes photographs showing the set, the lighting rig or the camera crew at work. Composition: landscape, the equipment and set clearly visible, models only if releases allow. 3:2, 1800×1200 (at least 1200×800). Authentic photograph only; no illustration or AI imagery. Replacement file: Shift Content/aristocracy-bts-01.jpg (registered as image id client-work-aristocracy-bts).',
      },
    },
    {
      id: 'night-club',
      name: 'The Night Club Global Tour',
      kind: 'Event film',
      video: 'heck',
      caption: 'Event film produced by Shift Content at The Night Club Global Tour.',
      client: (
        <p>
          The Night Club Global Tour, a collaboration between The Night Club and Gymshark, brought women together to{' '}
          <strong>run after dark as a group</strong>. HECK branding appears in the film.
        </p>
      ),
      contribution: <p>I supported the agency team’s production work on this branded run club event.</p>,
      delivered: <p>A short film of the event.</p>,
    },
  ] satisfies ClientFilm[],
  /** The compact ending: other documented agency work (no metrics). */
  otherWork: {
    intro: <p>Alongside the shoots, I worked on the agency’s pitches, advertising, website, and social media.</p>,
    items: [
      <>
        Built <strong>six Google Ads campaigns</strong>, from keyword research to links and descriptions, and earned the Google Ads Search
        certification.
      </>,
      <>Turned creative ideas into structured client pitch decks, including pricing, strategy, and direction.</>,
      <>Made CSS changes to the agency’s Squarespace site to adjust layouts and spacing and to display videos as intended.</>,
      <>Drafted LinkedIn posts for the agency’s founder about past projects and filmmaking advice.</>,
      <>Edited B-roll into sequences in Premiere Pro.</>,
    ],
  },
}

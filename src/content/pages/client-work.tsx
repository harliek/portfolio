import type { ImageId, VideoId } from '../media'

/**
 * Client Work (route /work/shift): copy from the client's brief (Page 6).
 *
 * Documented contributions only. Sources (docs/content-provenance.md, Shift):
 * - Harlie's weekly journals and Data 197 report (Shift Content/Shift journals.pdf)
 *   for what she did: equipment and lighting setup and B-roll on "a shoot filming
 *   interviews for an investment firm"; setup, lighting, coordinating and
 *   behind-the-scenes documentation on the two-day Aristocracy production; "a
 *   branded Run Club event"; pitch decks, six Google Ads campaigns and the Google
 *   Ads Search Certification, LinkedIn posts, Squarespace CSS, and editing B-roll
 *   into sequences in Premiere Pro.
 * - The agency's own project summaries (Shift Content/Film case studies.pdf) for
 *   the client context and the deliverables. Harlie's share of those deliverables
 *   is not established, so the page never credits them to her.
 *
 * Exactly three client films, in this order, defaulting to Nickleby Capital
 * Video 1 (nickleby-640.mp4 is a lossless remux of "Nickleby Capital Video
 * 1.mp4"; Video 2 is never published). The third project's verified title is
 * The Night Club Global Tour. Harlie's previous site listed her as
 * "Videographer" on it; that is not verified, so only production support is
 * stated. The journal does not name the investment firm, so linking that shoot
 * to Nickleby Capital is the site's existing inference; the wording stays modest
 * and never says Harlie's B-roll appears in this cut.
 *
 * Copy rule: no em dashes and no colons anywhere in visitor copy (including the
 * alt text in media.ts and the ratio of the Aristocracy film, which is described
 * in words).
 */

export interface ClientFilm {
  /** Also the URL hash that preselects the tab (/work/shift#aristocracy). */
  id: 'nickleby' | 'aristocracy' | 'night-club'
  /** Tab label (names, not numbers). */
  name: string
  /** Short kind of film, shown above the name. */
  kind: string
  video: VideoId
  /** Caption under the player (the provenance label "Agency work" is added automatically). */
  caption: string
  context: string
  contribution: string
  deliverable: string
  /** Real frames or photographs from the supplied project materials. */
  gallery: { label: string; shape: 'wide' | 'portrait'; images: ImageId[] }
}

export const CLIENT_WORK = {
  intro: 'During my internship at Shift Content in London, I supported client projects through production preparation, coordination, and related agency work.',
  /** The ownership boundary, stated once near the films. */
  note: 'These films are agency productions. My part in each one is described with the film.',
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      kind: 'Interview film',
      video: 'nickleby',
      caption: 'One film from the Nickleby Capital project.',
      context:
        'Nickleby Capital is an investment firm. It needed client testimonials, answers to frequently asked questions, and a short social video, all filmed in one day.',
      contribution: 'I helped set up the equipment and lighting before the interviews began, and filmed B-roll during the interviews.',
      deliverable: 'Five testimonials, nine FAQ responses, and a 60-second social video. This page shows one film from the project.',
      gallery: { label: 'Frames from the film', shape: 'wide', images: ['film-nickleby-a', 'film-nickleby-b'] },
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy',
      kind: 'Fashion campaign',
      video: 'aristocracy',
      caption: 'Campaign film for Aristocracy London, shown uncropped in its original frame.',
      context: 'Aristocracy London is a fashion brand. The agency produced its Spring/Summer campaign over two days, ahead of the opening of its Manchester store.',
      contribution: 'During the two-day production, I helped with setup, lighting, and coordination, and documented the camera and creative work behind the scenes.',
      deliverable: 'A campaign video, e-commerce imagery, and social assets.',
      gallery: {
        label: 'Campaign photographs',
        shape: 'portrait',
        images: ['aristocracy-photo-234', 'aristocracy-photo-103', 'aristocracy-photo-077'],
      },
    },
    {
      id: 'night-club',
      name: 'The Night Club Global Tour',
      kind: 'Event film',
      video: 'heck',
      caption: 'Event film from The Night Club Global Tour.',
      context: 'A collaboration between The Night Club and Gymshark that brought women together to run after dark as a group. HECK branding appears in the film.',
      contribution: 'I supported the agency team’s production work on this branded run club event.',
      deliverable: 'A short film of the event.',
      gallery: { label: 'Frames from the film', shape: 'wide', images: ['film-heck-a', 'film-heck-b'] },
    },
  ] satisfies ClientFilm[],
  otherWork: {
    intro: 'Alongside the client shoots, my internship included presentation, advertising, website, and social media work for the agency.',
    items: [
      { title: 'Pitch decks', text: 'Turned creative ideas into structured client pitch decks, including pricing, strategy, and direction.' },
      {
        title: 'Google Ads',
        text: 'Built six Google Ads campaigns, from keyword research to links and descriptions, and completed the Google Ads Search certification.',
      },
      { title: 'Agency website', text: 'Made CSS changes to the agency’s Squarespace site to adjust layouts and spacing and to display videos as intended.' },
      { title: 'LinkedIn posts', text: 'Drafted LinkedIn posts for the agency’s founder about past projects and filmmaking advice.' },
      { title: 'Video editing', text: 'Edited B-roll into sequences in Premiere Pro.' },
    ],
  },
}

import type { ReactNode } from 'react'
import type { VideoId } from '../media'

/**
 * Creative Production (route /work/creative-production; the files keep the
 * older client-work name). Copy is brief-v5 section 22, edited for the copy
 * rules; round 1 of the critique (R1-01, R1-04) gave the metadata the role
 * (the résumé title, as on About), dates and status, and shortened the
 * summary so the films' sections carry the specifics. FilmScroll lays it out.
 *
 * Evidence (docs/content-provenance.md, Shift Content)
 * - Harlie's weekly journals and Data 197 report (Shift Content/Shift
 *   journals.pdf): the agency is "led by the founder", Liam Wilson, whom she
 *   "assisted in various content productions"; "helping with camera setup,
 *   lighting, and being on set"; "capturing useful behind-the-scenes
 *   content"; "editing footage in Adobe Premiere Pro, taking b-roll and
 *   turning it into sequences"; on "a shoot filming interviews for an
 *   investment firm" she helped "with all the equipment and lighting" and
 *   "filmed b-roll during the interviews"; for Aristocracy "setup, lighting,
 *   coordinating and behind-the-scenes documentation of camera and creative
 *   work during a two-day production"; "a branded Run Club event" and "live
 *   event coverage".
 * - The agency's project summaries (Shift Content/Film case studies.pdf):
 *   Nickleby, "All from one filming day", "five distinct testimonials, nine
 *   FAQ responses ... and a 60 second social mashup"; Aristocracy, "Over two
 *   days, we brought Aristocracy London’s Spring/Summer campaign to life
 *   ahead of their Manchester store launch", "campaign video, e-commerce
 *   imagery, and social assets"; The Night Club Global Tour "brought women
 *   together to run after dark as a visible collective" with Gymshark.
 * - Round 2 (R2-07): the Aristocracy and tour sections state the client's
 *   purpose from those summaries in place of "fashion campaign shoot",
 *   "branded run-club event" and "energy of the evening"; Harlie's part is
 *   unchanged. Nickleby already states its need (one filming day).
 *
 * Harlie's own statements kept as written and reported as not shown by the
 * sources: interview "audio" (the sources say equipment and lighting),
 * "camera work on set" (the sources say camera setup and B-roll), the
 * Nickleby material being "for its site", and filming at the run-club event
 * for the final film (the sources say production support and event
 * coverage). The investment-firm shoot in the journal is not named, so
 * linking it to Nickleby Capital remains an inference.
 *
 * Exactly three client films, Nickleby first. nickleby-640.mp4 is a remux of
 * "Nickleby Capital Video 1.mp4"; "Video 1" and "Video 2" never appear in
 * visitor copy. Every film is an agency production; each player caption
 * credits Shift Content once, and no other qualification is repeated.
 * Evidence placeholders were removed from the page (their briefs are in the
 * private asset checklist).
 */

export interface ClientFilm {
  /** Section id and URL hash (/work/creative-production#aristocracy). */
  id: 'nickleby' | 'aristocracy' | 'night-club'
  /** Section heading and project navigation label. */
  name: string
  /** Short kind of film (the player caption). */
  kind: string
  /** The client as credited in the caption. */
  client: string
  video: VideoId
  /** Harlie's part, first person (25 to 45 words). */
  body: ReactNode
}

export const CLIENT_WORK = {
  meta: ['Creative Strategy and Client Solutions Intern · Shift Content, London', 'January to May 2026 · Three client films'],
  summary: (
    <p>
      At Shift Content in London, I worked directly with the founder on client films, from <strong>lighting and camera work on set</strong> to editing.
    </p>
  ),
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      kind: 'Interview film',
      client: 'Nickleby Capital',
      video: 'nickleby',
      body: (
        <p>
          For a one-day interview shoot, I set up lighting and audio and filmed B-roll. We produced <strong>five testimonials, nine FAQ responses</strong>,
          and a short social edit, giving the client material for its site and social channels.
        </p>
      ),
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy',
      kind: 'Campaign film',
      client: 'Aristocracy London',
      video: 'aristocracy',
      body: (
        <p>
          I helped run a two-day shoot for Aristocracy London’s spring and summer campaign, ahead of its Manchester store opening,
          handling lighting, setup, and on-set coordination. I also filmed behind-the-scenes footage for the agency’s marketing.
        </p>
      ),
    },
    {
      id: 'night-club',
      name: 'The Night Club Global Tour',
      kind: 'Event film',
      client: 'The Night Club Global Tour',
      video: 'heck',
      body: (
        <p>
          I filmed and supported production for the tour with Gymshark, capturing the participants for the final film. The tour brought women together to
          run after dark as a visible group.
        </p>
      ),
    },
  ] satisfies ClientFilm[],
}

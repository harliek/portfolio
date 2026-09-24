import type { ReactNode } from 'react'
import type { VideoId } from '../media'

/**
 * Creative Production (route /work/creative-production; the files keep the
 * older client-work name). Three stacked project sections, each pairing its
 * own description with its own film (brief-v8 section 13; FilmScroll lays it
 * out). Copy is brief-v5 section 22, edited for the copy rules: each section
 * states Harlie's part first ("I ...") and then, separately, what the Shift
 * Content team delivered, so her work is never read as the whole production.
 *
 * Evidence (docs/content-provenance.md, Shift Content)
 * - Harlie's weekly journals and Data 197 report (Shift Content/Shift
 *   journals.pdf, text checked with pdftotext): the agency is "led by the
 *   founder", Liam Wilson, whom she "assisted in various content productions";
 *   "helping with camera setup, lighting, and being on set"; "putting together
 *   behind-the-scenes content to represent the brand"; "editing footage in
 *   Adobe Premiere Pro, taking b-roll and turning it into sequences"; on "a
 *   shoot filming interviews for an investment firm" she helped "with all the
 *   equipment and lighting" and "filmed b-roll during the interviews"; for
 *   Aristocracy "the setup, lighting, coordinating and behind-the-scenes
 *   documentation of camera and creative work during a two-day production"
 *   announcing "the brand's Manchester launch"; "a branded Run Club event" and
 *   "live event coverage".
 * - The agency's project summaries (Shift Content/Film case studies.pdf,
 *   re-read with pdftotext in the v8 revision): Nickleby, "All from one
 *   filming day", "we delivered five distinct testimonials, nine FAQ responses
 *   ... and a 60 second social mashup", "enough material to sustain their
 *   content calendar for months"; Aristocracy, "Over two days, we brought
 *   Aristocracy London’s Spring/Summer campaign to life ahead of their
 *   Manchester store launch, delivering ... campaign video, e-commerce imagery,
 *   and social assets"; The Night Club Global Tour, with Gymshark, "brought
 *   women together to run after dark as a visible collective". “Powered by
 *   Gymshark” is spoken in the film (src/content/transcripts.tsx).
 * - v8: the Nickleby deliverable follows the agency's wording (a 60-second
 *   social edit for the client's content calendar) in place of brief-v5's "for
 *   its site and social channels", which no source shows.
 *
 * Harlie's own statements kept as written and reported as not shown by the
 * sources: interview "audio" (the sources say equipment and lighting) and
 * filming the participants at the run-club event (the sources say production
 * support and live event coverage, and do not name the event). The
 * investment-firm shoot in the journal is not named, so linking it to
 * Nickleby Capital remains an inference.
 *
 * Exactly three client films, Nickleby first. nickleby-640.mp4 is a remux of
 * "Nickleby Capital Video 1.mp4"; "Video 1" and "Video 2" never appear in
 * visitor copy. No captions under the films (brief-v8 section 8): the one
 * status line under the summary says the films are the agency's productions.
 */

export interface ClientFilm {
  /** Section id and URL hash (/work/creative-production#aristocracy). */
  id: 'nickleby' | 'aristocracy' | 'night-club'
  /** Section heading and anchor link label. */
  name: string
  /** Short kind of film, shown with its duration under the heading. */
  kind: string
  video: VideoId
  /** Harlie's part, first person. */
  work: ReactNode
  /** What the Shift Content team delivered. */
  delivered: ReactNode
}

export const CLIENT_WORK = {
  meta: ['Creative Strategy and Client Solutions Intern · Shift Content, London', 'January to May 2026 · Three client films'],
  summary: (
    <p>
      I worked directly with the founder on client films, from <strong>lighting and camera work on set</strong> to editing.
    </p>
  ),
  /** The one evidence distinction (brief-v8 section 8): the finished films are the team's work. */
  status: 'Agency films produced by the Shift Content team',
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      kind: 'Interview film',
      video: 'nickleby',
      work: (
        <p>
          For a one-day interview shoot, I set up lighting and audio and <strong>filmed B-roll during the interviews</strong>.
        </p>
      ),
      delivered: (
        <p>From that day, Shift Content delivered five testimonials, nine FAQ responses, and a 60&#8209;second social edit for the client’s content calendar.</p>
      ),
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy',
      kind: 'Campaign film',
      video: 'aristocracy',
      work: (
        <p>
          I helped run a two-day shoot for Aristocracy London’s spring and summer campaign. I handled <strong>lighting, setup, and on-set coordination</strong>{' '}
          and filmed behind-the-scenes footage for the agency’s marketing.
        </p>
      ),
      delivered: <p>Shift Content delivered the campaign video, e-commerce imagery, and social assets ahead of the brand’s Manchester store opening.</p>,
    },
    {
      id: 'night-club',
      name: 'The Night Club Global Tour',
      kind: 'Event film',
      video: 'heck',
      work: (
        <p>
          The tour, powered by Gymshark, brought women together to run after dark. I <strong>filmed the participants</strong> and supported the production team at
          the event.
        </p>
      ),
      delivered: <p>Shift Content delivered the final event film.</p>,
    },
  ] satisfies ClientFilm[],
}

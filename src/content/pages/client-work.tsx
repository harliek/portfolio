import type { ReactNode } from 'react'
import type { VideoId } from '../media'

/**
 * Creative Production (route /work/creative-production; the files keep the
 * older client-work name). Three stacked project sections, each pairing its
 * own description with its own film (brief-v8 section 13).
 *
 * Copy (Harlie's brief of 2026-09-28): one short sentence per film, with no subject, each naming Harlie's part with
 * the most precise verb the journal supports ("helped set up", "filmed", "worked on", "documented"). "Supported" is
 * gone, and with it "supported end-to-end", which contradicted itself. The Shift Content team's production is never
 * read as Harlie's alone. The non-breaking hyphens keep the compound words (B-roll, on-set, two-day,
 * Gymshark-powered) whole at a line end.
 *
 * Evidence (docs/content-provenance.md, Shift Content)
 * - Harlie's weekly journals and Data 197 report (Shift Content/Shift
 *   journals.pdf, text checked with pdftotext): the agency is "led by the
 *   founder", Liam Wilson, whom Harlie "assisted in various content productions";
 *   "helping with camera setup, lighting, and being on set"; "putting together
 *   behind-the-scenes content to represent the brand"; "editing footage in
 *   Adobe Premiere Pro, taking b-roll and turning it into sequences"; on "a
 *   shoot filming interviews for an investment firm" they helped "with all the
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
 * visitor copy. No captions under the films (brief-v8 section 8); the
 * page's meta names the agency, and each film's sentence states Harlie's
 * part in the agency's production.
 */

export interface ClientFilm {
  /** Section id and URL hash (/work/creative-production#aristocracy). */
  id: 'nickleby' | 'aristocracy' | 'night-club'
  /** Section heading and anchor link label. */
  name: string
  video: VideoId
  /** Harlie's part, in one short sentence (Harlie's brief, 2026-09-28). */
  work: ReactNode
  /**
   * The moving frame on the page (a short muted excerpt; the full film opens with sound on request). `fill` crops it to
   * fill the 16:9 frame.
   */
  clip: { src: string; poster: string; width: number; height: number; fill?: boolean }
}

export const CLIENT_WORK = {
  title: 'Creative Production',
  meta: ['Creative Strategy and Client Solutions Intern', 'Shift Content · 2026'],
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      video: 'nickleby',
      // The loop starts on the wide shot (Harlie's brief, 2026-09-28): it was cut 7 frames (0.23s) early and opened on
      // a flash of a close-up with another line's subtitle, on arrival and every 6s. Re-cut from the wide shot
      // (5.77s); its poster is the loop's first frame.
      clip: { src: '/media/video/nickleby-loop-trim-1138.mp4', poster: '/media/img/nickleby-loop-poster.jpg', width: 1138, height: 640 },
      work: (
        <p>
          Helped set up lighting and equipment, and filmed B&#8209;roll during the interviews.
        </p>
      ),
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy London',
      video: 'aristocracy',
      // Cropped to fill the 16:9 frame (Harlie's request: no black borders).
      clip: { src: '/media/video/aristocracy-loop-854.mp4', poster: '/media/img/aristocracy-loop-poster.jpg', width: 854, height: 640, fill: true },
      work: (
        <p>
          Worked on lighting and on&#8209;set coordination, and documented the two&#8209;day shoot behind the scenes.
        </p>
      ),
    },
    {
      id: 'night-club',
      name: 'The Night Club Global Tour',
      video: 'heck',
      // The whole 16:9 frame (14.6s to 21.5s of the film).
      clip: { src: '/media/video/heck-loop-1138.mp4', poster: '/media/img/heck-loop-poster.jpg', width: 1138, height: 640 },
      work: (
        <p>
          Filmed participants at a Gymshark&#8209;powered night run.
        </p>
      ),
    },
  ] satisfies ClientFilm[],
}

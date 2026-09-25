import type { ReactNode } from 'react'
import type { VideoId } from '../media'

/**
 * Creative Production (route /work/creative-production; the files keep the
 * older client-work name). Copy from Harlie's editorial pass (v23); the
 * Nickleby line keeps the conservative wording (lighting and equipment, no
 * audio), as the sources support. Three stacked project sections, each pairing its
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
  video: VideoId
  /** Harlie's part, first person. */
  work: ReactNode
  /** The moving frame on the page (a short muted excerpt; the full film opens with sound on request). `fill` crops it to fill the 16:9 frame. */
  clip: { src: string; poster: string; width: number; height: number; fill?: boolean }
}

export const CLIENT_WORK = {
  title: 'Creative Production',
  meta: ['Creative Strategy and Client Solutions Intern', 'Shift Content – 2026'],
  summary: (
    <p>At Shift Content, I supported client film production through lighting, camera setup, on&#8209;set coordination, B&#8209;roll capture, and editing.</p>
  ),
  films: [
    {
      id: 'nickleby',
      name: 'Nickleby Capital',
      video: 'nickleby',
      clip: { src: '/media/video/nickleby-loop-trim-1138.mp4', poster: '/media/img/nickleby-loop-poster.jpg', width: 1138, height: 640 },
      work: (
        <p>
          I supported lighting and equipment setup and filmed B&#8209;roll during a one&#8209;day interview shoot for Nickleby Capital. Five senior
          team members drew question cards and answered on camera without a script, a game&#8209;show format that kept the testimonials and FAQ answers
          spontaneous.
        </p>
      ),
    },
    {
      id: 'aristocracy',
      name: 'Aristocracy',
      video: 'aristocracy',
      // Cropped to fill the 16:9 frame (Harlie's request: no black borders).
      clip: { src: '/media/video/aristocracy-loop-854.mp4', poster: '/media/img/aristocracy-loop-poster.jpg', width: 854, height: 640, fill: true },
      work: (
        <p>
          I supported lighting, setup, and on-set coordination for Aristocracy London’s two&#8209;day spring/summer campaign shoot. I also filmed
          behind&#8209;the&#8209;scenes content for the agency’s marketing.
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
          I filmed participants and supported event production for The Night Club Global Tour, powered by Gymshark.
        </p>
      ),
    },
  ] satisfies ClientFilm[],
}

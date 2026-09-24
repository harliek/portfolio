import type { ReactNode } from 'react'
import type { VideoId } from './media'

/**
 * Film transcripts. Only transcripts that were actually produced and checked
 * are listed; a missing entry means no Transcript disclosure is shown.
 * Method, tools, confidence and every source disagreement are in docs/transcripts.md.
 * Speaker names are rendered as small block labels (no colons in visitor copy).
 *
 * Words come from each film's burned-in subtitles where they exist (the
 * agency's own captions), checked against the soundtrack with automatic
 * speech recognition. Lines with no subtitle were transcribed from the audio
 * only where several recognition runs agreed. Speakers are named only when the
 * film names them on screen.
 *
 * No methodology note opens a transcript (round 5, R5-06): the bracketed stage
 * directions and the one [inaudible] marker explain themselves, and the
 * per-film method is recorded in docs/transcripts.md.
 */
export const TRANSCRIPTS: Partial<Record<VideoId, ReactNode>> = {
  aristocracy: (
    <>
      <p>
        <strong>Off-screen voice</strong> Turning over. Lights!
      </p>
      <p>
        <strong>Announcement</strong> Welcome aboard this West Coast railway service from London to Manchester.
      </p>
      <p>
        <strong>Off-screen voice</strong> Action!
      </p>
      <p>
        <em>[Music begins and plays under most of the voiceover.]</em>
      </p>
      <p>
        <strong>Voiceover</strong>
        A start, a seat, a chosen pose,
        <br />
        a narrow room with outward goals.
        <br />
        Two figures settled, pressed and still,
        <br />
        prepared for miles, prepared for will.
      </p>
      <p>
        The light dips low,
        <br />
        one thought becomes another view.
      </p>
      <p>
        Promises pass in borrowed white.
        <br />
        Some futures rush. Some futures glide.
        <br />
        Some simply travel side by side.
      </p>
      <p>Time shifts shape learns when to pause.</p>
      <p>
        Leisure laid with careful aim
        <br />
        a country knowing when to stop
        <br />
        before it runs.
      </p>
      <p>
        Darkness hums, the world resets.
        <br />
        Progress falters. Vapor climbs.
        <br />
        A roadside argues with the time.
      </p>
      <p>
        This is effort, dressed as doubt.
        <br />
        Then light returns with something to declare.
      </p>
      <p>
        Evening enters slow and sure.
        <br />
        Waiting dressed as grace, style that knows its place.
      </p>
      <p>And in the longest fade the journey shows its hand.</p>
      <p>
        This was never just a ride somewhere new.
        <br />
        Something grand, a wider step, a firmer stand.
      </p>
      <p>
        <em>[Music ends.]</em>
      </p>
    </>
  ),
  nickleby: (
    <>
      <p>
        <em>[Music plays under most of the film. Opening title card.]</em>
      </p>
      <p>
        <strong>Unnamed speaker</strong> This is a stitch up.
      </p>
      <p>
        <strong>Unnamed speaker</strong> Get that on camera.
      </p>
      <p>
        <strong>Unnamed speaker</strong> Okay, let’s go with the first question.
      </p>
      <p>
        <em>[Title card reading “Meet the Makers”.]</em>
      </p>
      <p>
        <strong>Robin Sherry, CEO &amp; Co-founder, Seat Unique</strong> <em>(as captioned on screen)</em>
        <strong></strong> I’m Robin Sherry, CEO and founder of Seat Unique.
      </p>
      <p>
        <strong>Question</strong> What is the best live event you have ever been to?
      </p>
      <p>
        <strong>Robin Sherry</strong> Very hard to see past the opening night of Oasis, when they got back
        together in Cardiff. We were there in the Seat Unique lounge.
      </p>
      <p>
        <strong>Question</strong> In one sentence, what are you building and why does it matter?
      </p>
      <p>
        <strong>Robin Sherry</strong> At Seat Unique, we’re building Europe’s number one destination for
        premium live events.
      </p>
      <p>
        <strong>Question</strong> What has changed in your business since Nickleby invested?
      </p>
      <p>
        <strong>Robin Sherry</strong> Well, when we first met Nickleby in 2022, they really believed in where
        our market would go. And it has absolutely exploded since then. The experience economy has boomed.
        People want live events over material possessions, and the premium section of our market is expanding
        rapidly. And Nickleby have really helped our business go grab that market as quickly as possible and
        made us a real powerhouse in our industry now.
      </p>
      <p>
        <strong>Question</strong> What has been Nickleby’s value-add?
      </p>
      <p>
        <strong>Robin Sherry</strong> Well I guess you can look at this across three areas. Firstly, the most
        important, the governance of the business. Then secondly, Nickleby have a brilliant investor base
        which have really helped us go win more partnerships and deals across live music and sport. And then
        thirdly, they actually spend a lot of time with the team understanding their challenges and helping
        empower them to go win.
      </p>
      <p>
        <strong>Question</strong> What sort of relationship do you have with Nickleby?
      </p>
      <p>
        <strong>Robin Sherry</strong> We actually like Nickleby, professionally and personally. It’s been a
        partnership and not just money. And it does sound a bit cheesy, but Seat Unique simply wouldn’t be
        where we are today without them.
      </p>
      <p>
        <em>[End card with the Nickleby Capital logo and “See more at nicklebycapital.com”.]</em>
      </p>
    </>
  ),
  heck: (
    <>
      <p>
        <em>[Music.]</em>
      </p>
      <p>
        <strong>Unnamed speaker</strong> Welcome to the Night Club Global Tour, powered by Gymshark.
      </p>
      <p>
        <strong>Unnamed speaker</strong> Thank you to HECK for [inaudible] us, but enjoy yourselves and have fun!
      </p>
      <p>
        <em>[Music continues to the end. No further spoken dialogue.]</em>
      </p>
      <p>
        <em>
          [On screen, Gymshark and Night Club branding, HECK food packaging and “Run Sausage Run” signs. The
          film ends on the HECK logo.]
        </em>
      </p>
    </>
  ),
}

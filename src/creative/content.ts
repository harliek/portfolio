/**
 * The restored creative portfolio's content (/creative, /creative/art,
 * /creative/film).
 *
 * Verbatim from Harlie's original creative portfolio
 * (old portfolio copy/src/app/content/creative.ts): titles, roles, notes,
 * awards, series, series note, order and wall sizes are exactly as they were
 * there. Nothing here adds a medium or a year (the original has none).
 *
 * Only two things are new: each work records its image's pixel size (so the
 * wall reserves the right proportions before an image loads) and each series
 * has an anchor id for the series links. The ids match the anchors the
 * interim /art page used, so /art#she-is-her still lands on the same series.
 *
 * Images are copies of the original files, in public/creative/ (optimized
 * JPG + WebP derivatives at the original proportions; the largest width is
 * the original's full size).
 */

export interface Img {
  /** Path stem under public/creative, e.g. 'art/oldwoman'. Files are `${stem}-${width}.{jpg,webp}`. */
  stem: string
  /** Full pixel size of the original. */
  w: number
  h: number
  /** Available derivative widths (the last is the original's full width). */
  widths: number[]
}

export type Film = {
  id: string
  title: string
  /** the role, stated plainly and first */
  role: string
  note: string
  yt?: string
  poster: Img
  awards?: string[]
  /** how much of the 12-column grid this one takes */
  span: 12 | 7 | 6 | 5 | 4
  ratio: string
  pos?: string
}

const poster = (name: string, w: number, h: number, widths: number[]): Img => ({ stem: `posters/${name}`, w, h, widths })

export const FILMS: Film[] = [
  {
    id: 'artistic-end',
    title: 'An Artistic End',
    role: 'Writer · Director · Cinematographer · Editor',
    note: 'An experimental short on self-objectification, artistic identity and existential isolation.',
    yt: 'a2Vm1LFB_68',
    poster: poster('art', 1536, 895, [800, 1536]),
    awards: ['All American Film Festival', 'Jewish Film Festival'],
    span: 12,
    ratio: '21 / 9',
    pos: '50% 42%',
  },
  {
    id: 'wilt',
    title: 'Before I Wilt',
    role: 'Director · Cinematographer · Editor',
    note: 'A narrative short on mortality, impermanence and the acceptance of time.',
    yt: 'vTHlWiKE-Pk',
    poster: poster('wilt', 1536, 1024, [800, 1536]),
    span: 7,
    ratio: '16 / 10',
  },
  {
    id: 'alex',
    title: 'Alex',
    role: 'Writer · Director · Cinematographer',
    note: 'A narrative short on sexuality, vulnerability and the fear of rejection.',
    yt: 'mWz0WUNkB-E',
    poster: poster('shana', 1536, 1024, [800, 1536]),
    awards: ['Younger Directors’ Film Festival'],
    span: 5,
    ratio: '4 / 3',
    pos: '50% 30%',
  },
  {
    id: 'my-world',
    title: 'My World',
    role: 'Writer · Director · Editor',
    note: 'A narrative short on grief, memory and enduring love. Dedicated to Leonard Goldenberg.',
    yt: 'MWRcrSRHsbQ',
    poster: poster('world', 1536, 1024, [800, 1536]),
    span: 5,
    ratio: '4 / 3',
    pos: '50% 34%',
  },
  {
    id: 'velvet',
    title: 'Velvet is Her Blood',
    role: 'Assistant editor',
    note: 'An experimental short following a detective and a seductive serial killer.',
    yt: 'Rp-lu6UEQoY',
    poster: poster('blood', 2924, 1630, [800, 1600, 2924]),
    span: 7,
    ratio: '16 / 10',
  },
]

export const CLIENT_FILMS: Film[] = [
  {
    id: 'aristocracy',
    title: 'Aristocracy London',
    role: 'On-set production · behind the scenes',
    note: "Aristocracy London's Manchester store launch campaign, with Shift Content.",
    poster: poster('aristo', 2926, 1632, [800, 1600, 2926]),
    span: 6,
    ratio: '16 / 10',
  },
  {
    id: 'heck',
    title: 'The Night Club Global Tour',
    role: 'Videographer · production assistant',
    note: 'The Night Club Global Tour, with Gymshark. Shot for Shift Content.',
    yt: '1zFdBhnlXpc',
    poster: poster('heck', 2144, 1228, [800, 1600, 2144]),
    span: 6,
    ratio: '16 / 10',
  },
  {
    id: 'first-edition',
    title: 'First Edition',
    role: 'Director · Editor',
    note: 'A documentary client project on the world’s first solar-electric catamaran.',
    yt: 'W4bSTrXk25A',
    poster: poster('peter', 1774, 1232, [800, 1774]),
    span: 7,
    ratio: '16 / 10',
  },
  {
    id: 'relay',
    title: 'Relay for Life',
    role: 'Interviewer · Producer',
    note: 'Interviews with cancer survivors, cut into a film to raise funds for the American Cancer Society.',
    yt: 'jFiozBBbywc',
    poster: poster('hope', 2144, 1226, [800, 1600, 2144]),
    span: 5,
    ratio: '4 / 3',
  },
]

/** Shown in place of a player for a production that has no film of Harlie's own to publish (verbatim). */
export const STILL_NOTE = 'This one is on-set and behind-the-scenes work rather than a film of my own to publish.'

/* ---- art ---------------------------------------------------------------
   Sizes are the composition, not the file: a gallery wall hangs a large
   work next to a small one, and nothing is cropped to make a grid work. */

export type Work = { img: Img; title: string; w: 2 | 3 | 4 | 5 | 6; note?: string }

export type Series = { id: string; name: string; note?: string; works: Work[] }

const art = (name: string, w: number, h: number, widths: number[]): Img => ({ stem: `art/${name}`, w, h, widths })

export const SERIES: Series[] = [
  {
    id: 'the-art-of-aging',
    name: 'The Art of Aging',
    note: 'Five drawings on ageing. The slow withering of the body and the fading of the mind, moved with rather than resisted.',
    works: [
      { img: art('oldwoman', 1440, 1796, [640, 1200, 1440]), title: 'A Life, Beautifully Worn', w: 5 },
      { img: art('oldman', 1705, 2131, [640, 1200, 1705]), title: 'Time Unspoken', w: 4 },
      { img: art('oldman2', 1440, 1799, [640, 1200, 1440]), title: 'Written by Time', w: 3 },
      { img: art('eye', 2446, 1668, [640, 1200, 1800, 2446]), title: 'Etched in Iris', w: 6, note: 'Published in BSB Magazine' },
      { img: art('hands', 1179, 964, [640, 1179]), title: 'The Inevitable', w: 6 },
    ],
  },
  {
    id: 'a-portrait-in-ash',
    name: 'A Portrait in Ash',
    works: [
      { img: art('draw', 1130, 1468, [640, 1130]), title: 'Written Under Glass', w: 4 },
      { img: art('smoke', 1679, 2098, [640, 1200, 1679]), title: 'Illusion of Control', w: 5 },
      { img: art('bite', 1816, 2271, [640, 1200, 1816]), title: 'Ember Kiss', w: 3 },
    ],
  },
  {
    id: 'she-is-her',
    name: 'She is Her',
    works: [
      { img: art('nyu', 861, 1202, [640, 861]), title: 'She Is Art', w: 5 },
      { img: art('close', 1920, 2400, [640, 1200, 1920]), title: 'Soaked in Silence', w: 3 },
      { img: art('body', 1179, 1447, [640, 1179]), title: 'The Body’s Burden', w: 4 },
      { img: art('baby', 1179, 1446, [640, 1179]), title: 'In Her Arms', w: 4 },
      { img: art('two', 1179, 1340, [640, 1179]), title: 'Two Truths and 100 Lies', w: 5 },
      { img: art('long', 2249, 2547, [640, 1200, 1800, 2249]), title: 'Lingering Ache', w: 3 },
    ],
  },
  {
    id: 'lines-of-loss',
    name: 'Lines of Loss',
    works: [
      { img: art('sex', 2661, 3253, [640, 1200, 1800, 2661]), title: 'Sex Over Morals', w: 4 },
      { img: art('scribble', 1179, 1458, [640, 1179]), title: 'White Noise', w: 3 },
      { img: art('square', 1179, 1433, [640, 1179]), title: 'Blind Spot', w: 5 },
      { img: art('tree', 1179, 1456, [640, 1179]), title: 'Deluge', w: 4 },
      { img: art('blur', 1179, 1468, [640, 1179]), title: 'Diminished Self', w: 3 },
      { img: art('drip', 1179, 1460, [640, 1179]), title: 'Slipping Mind', w: 5 },
    ],
  },
]

/** The hub's two rooms: silent looping tiles, as in the original. */
export const TILES = {
  film: { video: '/creative/video/film-tile.mp4', poster: '/creative/posters/film-tile.jpg' },
  art: { video: '/creative/video/art-tile.mp4', poster: '/creative/posters/art-tile.jpg' },
}

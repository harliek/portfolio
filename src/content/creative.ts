import type { ImageId } from './media'

/**
 * Films, shared by the Film page (/film) and About's featured short film.
 *
 * Source: Harlie's previous portfolio (old portfolio copy/src/app/content/
 * creative.ts) for titles, roles and her one-line notes, and her YouTube
 * channel “Harlie Jade Katz” for every video id and upload date (checked
 * against each watch page's publishDate on 2026-09-23; the YouTube
 * descriptions are empty, so the notes are Harlie's own wording).
 *
 * `published` is the YouTube upload date, not necessarily when the film was
 * made. Roles are as the previous portfolio lists them and are not
 * independently verified, so About shows none (see docs/content-provenance.md).
 * The festival selections the old site listed are not shown (unverified).
 * First Edition's old note called the boat “the world’s first” solar-electric
 * catamaran; that superlative is unverified and left out.
 */

export interface Film {
  id: string
  title: string
  role: string
  note: string
  youtubeId: string
  /** YouTube upload date (verified); not necessarily when the film was made. */
  published: string
  still: ImageId
  kind: 'own' | 'client'
}

export const FEATURED_FILM_ID = 'an-artistic-end'

export const FILMS: Film[] = [
  {
    id: 'an-artistic-end',
    title: 'An Artistic End',
    role: 'Writer · Director · Cinematographer · Editor',
    note: 'An experimental short film about self-objectification, artistic identity, and existential isolation.',
    youtubeId: 'a2Vm1LFB_68',
    published: '2026-01-25',
    still: 'film-artistic-end',
    kind: 'own',
  },
  {
    id: 'before-i-wilt',
    title: 'Before I Wilt',
    role: 'Director · Cinematographer · Editor',
    note: 'A narrative short on mortality, impermanence, and the acceptance of time.',
    youtubeId: 'vTHlWiKE-Pk',
    published: '2026-01-25',
    still: 'film-before-i-wilt',
    kind: 'own',
  },
  {
    id: 'alex',
    title: 'Alex',
    role: 'Writer · Director · Cinematographer',
    note: 'A narrative short on sexuality, vulnerability, and the fear of rejection.',
    youtubeId: 'mWz0WUNkB-E',
    published: '2026-02-13',
    still: 'film-alex',
    kind: 'own',
  },
  {
    id: 'my-world',
    title: 'My World',
    role: 'Writer · Director · Editor',
    note: 'A narrative short on grief, memory, and enduring love. Dedicated to Leonard Goldenberg.',
    youtubeId: 'MWRcrSRHsbQ',
    published: '2026-02-13',
    still: 'film-my-world',
    kind: 'own',
  },
  {
    id: 'velvet-is-her-blood',
    title: 'Velvet is Her Blood',
    role: 'Assistant editor',
    note: 'An experimental short following a detective and a seductive serial killer.',
    youtubeId: 'Rp-lu6UEQoY',
    published: '2026-01-25',
    still: 'film-velvet',
    kind: 'own',
  },
  {
    id: 'first-edition',
    title: 'First Edition',
    role: 'Director · Editor',
    note: 'A documentary client project about a solar-electric catamaran.',
    youtubeId: 'W4bSTrXk25A',
    published: '2026-02-15',
    still: 'film-first-edition',
    kind: 'client',
  },
  {
    id: 'relay-for-life',
    title: 'Relay for Life',
    role: 'Interviewer · Producer',
    note: 'Interviews with cancer survivors, cut into a film to raise funds for the American Cancer Society.',
    youtubeId: 'jFiozBBbywc',
    published: '2026-02-15',
    still: 'film-relay',
    kind: 'client',
  },
]

export const filmById = (id: string) => FILMS.find((f) => f.id === id) ?? FILMS[0]

/** “Published on YouTube, January 2026” (the upload month, never presented as the production date). */
export const publishedLabel = (f: Film) =>
  `Published on YouTube, ${new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${f.published}T00:00:00Z`))}`

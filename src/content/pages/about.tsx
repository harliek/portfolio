import type { ImageId } from '../media'
import type { ProjectId } from '../projects'

/**
 * About: the biography is the client's wording, verbatim (revision-brief.md,
 * About page); it is personal positioning, not a claim of professional AI
 * research expertise. Organizations, role titles and dates are exactly as on
 * the résumé (public/resume/harlie-katz-resume.pdf); Jumpstart Finance is
 * listed there under Projects with the same title and dates.
 */

export interface Role {
  org: string
  role: string
  dates: string
  /** The related case study, where there is one. PlanetArt links only to the internship work (CafePress UK). */
  project?: ProjectId
}

export const ABOUT = {
  hello: 'Hi, welcome to my portfolio.',
  bio: [
    'I am deeply invested in the future of applied AI. My background in cognitive science and data science informs how I evaluate technology, understand user behavior, and develop product ideas.',
    'I believe useful AI depends on understanding how people think, how information is represented, and how decisions are made. I want to apply that understanding to products people can use with confidence.',
  ],
  experience: [
    { org: 'PlanetArt', role: 'Product Operations & Merchandising Intern', dates: 'Jun–Aug 2026', project: 'cafepress-uk' },
    { org: 'Shift Content', role: 'Creative Strategy & Client Solutions Intern', dates: 'Jan–May 2026', project: 'client-work' },
    { org: 'The Artesian Network', role: 'Enterprise AI Research Associate', dates: 'Jun 2025–Jan 2026' },
    { org: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'Oct 2024–Jun 2025', project: 'ai-leasing-agent' },
    { org: 'Jumpstart Finance', role: 'Founder & Product Lead', dates: 'Jun–Jul 2024', project: 'jumpstart-finance' },
  ] satisfies Role[],
  education: {
    school: 'University of California, Berkeley',
    degree: 'B.A. in Cognitive Science, Minor in Data Science',
    dates: 'Aug 2023–May 2026',
  },
  art: {
    title: 'My art portfolio',
    text: 'Drawings, films, and earlier creative work.',
    cta: 'View drawings and films',
    /**
     * A small composition of actual drawings, shown whole (never cropped) at
     * relative heights. Never the two explicit pieces (drawing-sex, drawing-body).
     */
    drawings: [
      { id: 'drawing-oldwoman', height: 1 },
      { id: 'drawing-hands', height: 0.66 },
      { id: 'drawing-drip', height: 0.86 },
    ] satisfies { id: ImageId; height: number }[],
  },
  film: {
    eyebrow: 'Short film',
    more: 'All films',
  },
}

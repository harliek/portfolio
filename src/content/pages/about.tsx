import type { ReactNode } from 'react'
import type { ProjectId } from '../projects'

/**
 * About content, shared by the homepage section below the carousel (#about)
 * and the /about page (src/components/about/AboutContent.tsx).
 *
 * The greeting and the two biography paragraphs are the client's wording,
 * verbatim (latest brief, "Put About directly below the carousel"); only the
 * bold emphasis is added. Organizations, role titles and dates are exactly as
 * on the résumé (public/resume/harlie-katz-resume.pdf), written out in full
 * ("June to August 2026"). Jumpstart Finance is listed on the résumé under
 * Projects with the same title and dates. The education lines are the
 * résumé's (GPA and coursework are left out on purpose).
 */

export interface Role {
  org: string
  role: string
  dates: string
  /** The related case study, where there is one. PlanetArt links only to the internship work (CafePress UK). */
  project?: ProjectId
}

export const ABOUT = {
  label: 'About',
  greeting: 'Hi, welcome to my portfolio.',
  bio: [
    <>
      My background is in <strong>cognitive science and data science</strong>, and my work focuses on{' '}
      <strong>applied AI and product development</strong>. I am interested in how people interpret information, make
      decisions, and use software in their work.
    </>,
    <>
      I believe understanding human cognition is essential to developing useful AI. Across my projects, I have explored
      that connection through <strong>research, workflow requirements, and interactive prototypes</strong>.
    </>,
  ] satisfies ReactNode[],
  resumeLabel: 'View résumé',
  experienceTitle: 'Experience',
  experience: [
    { org: 'PlanetArt', role: 'Product Operations & Merchandising Intern', dates: 'June to August 2026', project: 'cafepress-uk' },
    { org: 'Shift Content', role: 'Creative Strategy & Client Solutions Intern', dates: 'January to May 2026', project: 'client-work' },
    { org: 'The Artesian Network', role: 'Enterprise AI Research Associate', dates: 'June 2025 to January 2026' },
    { org: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'October 2024 to June 2025', project: 'ai-leasing-agent' },
    { org: 'Jumpstart Finance', role: 'Founder & Product Lead', dates: 'June to July 2024', project: 'jumpstart-finance' },
  ] satisfies Role[],
  educationTitle: 'Education',
  education: {
    school: 'University of California, Berkeley',
    degree: 'B.A. in Cognitive Science, Minor in Data Science',
    certificate: 'Certificate in Entrepreneurship & Technology, Sutardja Center',
    dates: 'August 2023 to May 2026',
  },
  art: {
    title: 'My art portfolio',
    text: 'Drawings and short films, shown in my original creative portfolio.',
    cta: 'Open art portfolio',
    href: '/creative',
  },
  film: {
    label: 'Short film',
    cta: 'Watch An Artistic End',
    youtube: 'Open on YouTube',
  },
}

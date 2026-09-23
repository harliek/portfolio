/** Public identity and verified contact links. No phone number, no GitHub. */
export const SITE = {
  name: 'Harlie Katz',
  descriptor: 'AI product, strategy & operations.',
  titleSuffix: 'Harlie Katz',
  description:
    'Portfolio of Harlie Katz: merchandising research and prototypes, AI leasing requirements, an independent spreadsheet prototype, a financial-learning venture, and agency creative production.',
  email: 'harliekatz@berkeley.edu',
  emailHref: 'mailto:harliekatz@berkeley.edu',
  linkedin: 'https://www.linkedin.com/in/harliekatz/',
  resume: '/resume/harlie-katz-resume.pdf',
  resumeDownloadName: 'Harlie-Katz-Resume.pdf',
} as const

export const pageTitle = (title?: string) => (title ? `${title} — ${SITE.titleSuffix}` : `${SITE.name} — AI product, strategy & operations`)

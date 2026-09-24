/** Public identity and verified contact links. No phone number, no GitHub. */
export const SITE = {
  name: 'Harlie Katz',
  titleSuffix: 'Harlie Katz',
  description: 'Portfolio of Harlie Katz. Selected work in applied AI, product development, and creative production.',
  email: 'harliekatz@berkeley.edu',
  emailHref: 'mailto:harliekatz@berkeley.edu',
  linkedin: 'https://www.linkedin.com/in/harliekatz/',
  resume: '/resume/harlie-katz-resume.pdf',
  resumeDownloadName: 'Harlie-Katz-Resume.pdf',
} as const

/** Document titles use a middle dot (no em dashes or colons in visitor-facing copy). */
export const pageTitle = (title?: string) => (title ? `${title} · ${SITE.titleSuffix}` : `${SITE.name} · Portfolio`)

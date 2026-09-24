import type { ImageId } from '../media'
import type { ProjectId } from '../projects'

/**
 * Copy of the /about page (src/components/about/AboutContent.tsx).
 *
 * Sources (see docs/content-provenance.md):
 * - Greeting and the two opening paragraphs: Harlie's wording, verbatim
 *   (brief v5, section 25).
 * - Education: the résumé (public/resume/harlie-katz-resume.pdf). School,
 *   degree, minor, certificate and Sutardja Center, "Aug 2023 - May 2026",
 *   "Completed in 3 years", and the coursework list exactly as the résumé
 *   names it (topic labels, not official course titles). GPA is left out on
 *   purpose. The paragraph is the brief's suggested wording (section 26).
 * - Experience: organizations, titles and dates exactly as on the résumé
 *   ("&" written as "and"; Jumpstart is "Founder and Product Lead" per the
 *   brief). One contribution sentence each, drawn from the résumé and the
 *   brief's own case-study copy, with no metrics:
 *   PlanetArt: résumé "Led UK pricing, competitor, and vendor research to
 *   shape CafePress's launch strategy and prototype e-commerce site" and
 *   brief section 23 ("coded a localized CafePress storefront prototype").
 *   Shift Content: brief section 22 (lighting, interview audio, camera,
 *   B-roll, editing, working directly with the founder).
 *   The Artesian Network: the brief's sentence (section 27); the résumé's
 *   "Produced 4 executive white papers" supports "wrote" (no number used).
 *   Valiance Capital: brief section 20 (proposed the agent, wrote its
 *   requirements, developed test cases for its rollout).
 *   Jumpstart Finance: résumé "Led a 5-person international team from
 *   customer discovery to prototype and pitch" (the sign-up figure is left
 *   out here; it is on the case study with its qualification).
 *   PlanetArt links only to its internship work (CafePress UK); the
 *   Merchandising Platform is an independent project.
 * - Creative work: the original creative portfolio has Film and Art (charcoal
 *   drawings) sections; An Artistic End's poster, YouTube id, description and
 *   upload month come from the original portfolio and YouTube (the same data
 *   as src/content/creative.ts, kept here so About does not depend on it).
 *   Role credits are not shown (unverified).
 *
 * Authored copy uses no colons and no em dashes.
 */

export interface Role {
  org: string
  role: string
  dates: string
  /** One concise contribution sentence. */
  contribution: string
  /** The related case study, where there is one. */
  project?: ProjectId
}

/** The film's authentic poster (the original portfolio's thumbnail, pinks untouched). */
const FILM_POSTER: ImageId = 'film-artistic-end'

export const ABOUT = {
  greeting: 'Hi, I’m Harlie.',
  bio: [
    'I studied cognitive science and data science at UC Berkeley. My work connects research, product development, and applied AI. I’m interested in how people make decisions and how software can support them.',
    'I have worked across product operations, enterprise AI research, leasing, and creative production. Those experiences shape how I approach problems and test ideas.',
  ],
  portraitLabel: 'Portrait of Harlie Katz',

  educationTitle: 'Education',
  education: {
    school: 'University of California, Berkeley',
    credentials: ['B.A. in Cognitive Science', 'Minor in Data Science'],
    certificate: 'Certificate in Entrepreneurship and Technology',
    certificateSource: 'Sutardja Center',
    dates: 'August 2023 to May 2026',
    pace: 'Completed in three years',
    text: 'Cognitive science informs how I think about attention, learning, and decision-making. Data science gives me methods for examining evidence and testing ideas.',
    courseworkTitle: 'Relevant coursework',
    coursework: [
      'Artificial Intelligence',
      'Large Language Models',
      'Machine Learning',
      'Computational Cognitive Modeling',
      'Data Analytics',
      'AI Governance',
      'Human Behavior',
      'Computer Science',
      'User Experience',
      'Economic Systems',
    ],
  },

  experienceTitle: 'Experience',
  experience: [
    {
      org: 'PlanetArt',
      role: 'Product Operations and Merchandising Intern',
      dates: 'June to August 2026',
      contribution: 'Led UK pricing, competitor, and vendor research for CafePress and coded a localized storefront prototype.',
      project: 'cafepress-uk',
    },
    {
      org: 'Shift Content',
      role: 'Creative Strategy and Client Solutions Intern',
      dates: 'January to May 2026',
      contribution: 'Produced client films with the founder, from lighting and interview audio to camera work and editing.',
      project: 'client-work',
    },
    {
      org: 'The Artesian Network',
      role: 'Enterprise AI Research Associate',
      dates: 'June 2025 to January 2026',
      contribution: 'Researched enterprise AI applications and wrote white papers on adoption and implementation.',
    },
    {
      org: 'Valiance Capital',
      role: 'Leasing and Operations Associate',
      dates: 'October 2024 to June 2025',
      contribution: 'Proposed an AI leasing agent, wrote its requirements, and developed test cases for its rollout.',
      project: 'ai-leasing-agent',
    },
    {
      org: 'Jumpstart Finance',
      role: 'Founder and Product Lead',
      dates: 'June to July 2024',
      contribution: 'Led a five-person team at the European Innovation Academy in Porto from customer discovery to prototype and pitch.',
      project: 'jumpstart-finance',
    },
  ] satisfies Role[],
  caseLink: (name: string) => `${name} case study`,

  creativeTitle: 'Creative work',
  portfolio: {
    /** The restored original creative homepage (a separate static build, outside the router). */
    href: '/creative/',
    cta: 'Open creative portfolio',
    text: 'Short films and charcoal drawings in my original creative portfolio.',
  },
  film: {
    title: 'An Artistic End',
    note: 'An experimental short film about self-objectification, artistic identity, and existential isolation.',
    meta: 'Short film · Published on YouTube, January 2026',
    youtubeId: 'a2Vm1LFB_68',
    poster: FILM_POSTER,
    play: 'Play film',
    youtube: 'Watch on YouTube',
  },

  links: {
    label: 'Email and LinkedIn',
    linkedin: 'LinkedIn',
  },
}

import type { ReactNode } from 'react'
import type { ImageId } from '../media'
import type { ProjectId } from '../projects'

/**
 * Copy of the /about page (src/components/about/AboutContent.tsx).
 *
 * Sources (see docs/content-provenance.md):
 * - Greeting and the two opening paragraphs: Harlie's draft (brief v8,
 *   section 15), kept almost word for word; it already reads naturally and
 *   claims nothing beyond her degree and her roles.
 * - Education: the résumé (public/resume/harlie-katz-resume.pdf). School,
 *   degree, minor, certificate and Sutardja Center, "Aug 2023 - May 2026"
 *   and "Completed in 3 years". GPA is left out on purpose. The two
 *   paragraphs are Harlie's (brief v8, section 15) with one accuracy edit:
 *   "psychology" is dropped from the subjects, because the résumé's
 *   coursework (Artificial Intelligence, Large Language Models, Machine
 *   Learning, Computational Cognitive Modeling, Data Analytics, AI
 *   Governance, Human Behavior, Computer Science, User Experience, Economic
 *   Systems) does not name it. Machine learning, data science (the minor and
 *   Data Analytics), computer science, user experience and human cognition
 *   (the Cognitive Science degree, Computational Cognitive Modeling) are all
 *   supported. The separate coursework list is gone (brief v8: no duplicate
 *   list of the same subjects).
 * - Experience: organizations, titles and dates exactly as on the résumé
 *   ("&" written as "and"; Jumpstart is "Founder and Product Lead" per the
 *   brief). One first-person contribution, drawn from the résumé and the
 *   case-study copy:
 *   PlanetArt: résumé "Led UK pricing, competitor, and vendor research to
 *   shape CafePress's launch strategy and prototype e-commerce site".
 *   Shift Content: the Creative Production case study (lighting, interview
 *   audio, camera, B-roll, editing, working directly with the founder).
 *   The Artesian Network: the brief's sentence (v5 section 27, v8 section
 *   15); the résumé's "Produced 4 executive white papers" supports "wrote"
 *   (no number used).
 *   Valiance Capital: the AI Leasing Agent case study (proposed the agent,
 *   wrote its requirements, developed test cases for its rollout) and the
 *   résumé ("AI leasing agent adopted across 18 properties"), the one
 *   verified outcome, in bold.
 *   Jumpstart Finance: résumé "Led a 5-person international team from
 *   customer discovery to prototype and pitch" (the sign-up figure stays on
 *   the case study with its qualification).
 *   PlanetArt links only to its internship work (CafePress UK); the
 *   Merchandising Platform is an independent project.
 * - Creative work: the original creative portfolio (/creative/) and An
 *   Artistic End, with its authentic poster and YouTube id from the
 *   original portfolio. Titles and actions only (brief v8, section 16: no
 *   publication metadata or repetitive captions).
 *
 * Authored copy uses no colons and no em dashes.
 */

export interface Role {
  org: string
  role: string
  dates: string
  /** One concise first-person contribution (a verified outcome may be bold). */
  contribution: ReactNode
  /** The related case study, where there is one. */
  project?: ProjectId
}

/** The film's authentic poster (the original portfolio's thumbnail, pinks untouched). */
const FILM_POSTER: ImageId = 'film-artistic-end'

export const ABOUT = {
  greeting: 'Hi, I’m Harlie.',
  /** The first paragraph is set as the lead. */
  /** The larger introductory paragraph and its one concrete follow-up (about three lines at desktop width). */
  lead: 'I turn fragmented workflows into tools people can understand and control.',
  leadDetail:
    'Recently that has meant a merchandising console that explains its reorder quantities, a spreadsheet agent that shows its plan before it builds, and the requirements for an AI leasing assistant.',
  /** What I build; how cognitive science informs it; the work I want next. */
  bio: [
    'I work on the everyday systems that decisions depend on, such as spreadsheets, handoffs, and lookups. I start from the workflow as it really runs and build the tool around it, as a working prototype or a clear set of requirements.',
    'Studying cognitive science at Berkeley, with a minor in data science, taught me to ask how people interpret, trust, and use a technical system. That is why my tools show their reasoning and leave the decision with the person using them.',
    'I’m interested in product and AI implementation work that connects research, prototyping, and day-to-day operations.',
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
    /** Harlie's two paragraphs (brief v8, section 15), restored word for word from the earlier About (brief v19). */
    text: [
      'I studied intelligence across cognitive and computational systems, with coursework spanning machine learning, data science, computer science, user experience, and human cognition.',
      'This gave me an interdisciplinary foundation for understanding how people think, how intelligent systems are built, and how technology can be designed around human behavior.',
    ],
  },

  experienceTitle: 'Experience',
  experience: [
    {
      org: 'PlanetArt',
      role: 'Product Operations and Merchandising Intern',
      dates: 'June to August 2026',
      contribution: 'I led UK pricing, competitor, and vendor research for CafePress and coded a localized storefront prototype.',
      project: 'cafepress-uk',
    },
    {
      org: 'Shift Content',
      role: 'Creative Strategy and Client Solutions Intern',
      dates: 'January to May 2026',
      contribution: 'I worked with the founder on client films, from lighting and interview audio to camera work and editing.',
      project: 'client-work',
    },
    {
      org: 'The Artesian Network',
      role: 'Enterprise AI Research Associate',
      dates: 'June 2025 to January 2026',
      contribution: 'I researched enterprise AI applications and wrote white papers on adoption and implementation.',
    },
    {
      org: 'Valiance Capital',
      role: 'Leasing and Operations Associate',
      dates: 'October 2024 to June 2025',
      contribution: (
        <>
          I proposed an AI leasing agent, wrote its requirements, and developed test cases for its rollout. The agent was <strong>adopted across 18 properties</strong>.
        </>
      ),
      project: 'ai-leasing-agent',
    },
    {
      org: 'Jumpstart Finance',
      role: 'Founder and Product Lead',
      dates: 'June to July 2024',
      contribution: 'I led a five-person team at the European Innovation Academy in Porto from customer discovery to prototype and pitch.',
      project: 'jumpstart-finance',
    },
  ] satisfies Role[],
  caseLink: (name: string) => `${name} case study`,

  creativeTitle: 'Creative work',
  portfolio: {
    /** The restored original creative homepage (a separate static build, outside the router). */
    href: '/creative/',
    title: 'Creative Portfolio',
    /** Medium and contribution, beneath the title (brief v17). */
    line: 'Drawing and short film · Artist and filmmaker',
    action: 'Open portfolio',
  },
  film: {
    title: 'An Artistic End',
    /** Medium, role (as credited on the creative site) and runtime (4:54 on YouTube). */
    line: 'Short film · Writer, director, cinematographer, and editor · 4:54',
    youtubeId: 'a2Vm1LFB_68',
    poster: FILM_POSTER,
    action: 'Play film',
    /** A fallback once the player is mounted (in case the embed is blocked). */
    youtube: 'Watch on YouTube',
  },

  links: {
    label: 'Email and LinkedIn',
    linkedin: 'LinkedIn',
  },
}

import type { ImageId } from '../media'

/**
 * Copy of the /about page (src/components/about/AboutContent.tsx).
 *
 * Sources (see docs/content-provenance.md):
 * - Introduction (brief v21; copy from Harlie's editorial pass, v23): the
 *   label, name, descriptor and three short paragraphs (ABOUT.intro).
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
 * - Experience is no longer on this page (brief v21); the roles are in the
 *   résumé and the case studies.
 * - Creative work: the original creative portfolio (/creative/) and An
 *   Artistic End, with its authentic poster and YouTube id from the
 *   original portfolio. Titles and actions only (brief v8, section 16: no
 *   publication metadata or repetitive captions).
 *
 * Authored copy uses no colons and no em dashes.
 */

/** The film's authentic poster (the original portfolio's thumbnail, pinks untouched). */
const FILM_POSTER: ImageId = 'film-artistic-end'

export const ABOUT = {
  /** Brief v21: the old creative portfolio's About format (a small label, the name, a descriptor, short paragraphs, the portrait at the right). */
  label: 'About',
  name: 'Harlie Katz',
  /** Harlie's own wording (the résumé header, AI IMPLEMENTATION | PRODUCT STRATEGY & OPERATIONS). */
  descriptor: 'AI implementation · Product strategy and operations',
  /** Harlie's editorial pass (v23): the name heading introduces Harlie, and the education detail is not repeated from Education. */
  intro: [
    'My experience spans AI implementation, product strategy, and software development, including leasing operations, merchandising research, and independent software prototypes.',
    'I graduated from UC Berkeley in three years with a B.A. in Cognitive Science and a minor in Data Science.',
    'My creative work includes filmmaking and charcoal drawing.',
  ],
  portraitLabel: 'Portrait of Harlie Katz',

  educationTitle: 'Education',
  education: {
    school: 'University of California, Berkeley',
    credentials: ['B.A. in Cognitive Science', 'Minor in Data Science'],
    certificate: 'Certificate in Entrepreneurship and Technology',
    certificateSource: 'Sutardja Center',
    dates: '2023 to 2026',
    /** Harlie's editorial pass (v23); the subjects are the résumé's coursework and the degree. */
    text: [
      'My coursework covered machine learning, computational cognitive modeling, data analytics, computer science, user experience, and human cognition.',
      'This interdisciplinary training combined the study of human behavior with computational approaches to intelligence and system design.',
    ],
  },

  creativeTitle: 'Creative work',
  portfolio: {
    /** The restored original creative homepage (a separate static build, outside the router). */
    href: '/creative/',
    title: 'Creative Portfolio',
    /** Beneath the title (Harlie's editorial pass, v23). */
    line: 'Film and visual art',
    action: 'Open portfolio',
  },
  /** The creative portfolio's Charcoal Art page (a separate static build: a plain link, full page load). */
  art: {
    href: '/creative/art',
    title: 'Art',
    line: 'Charcoal drawings',
    action: 'View art',
    /** Three portrait drawings from the Charcoal Art page, side by side in the one link (Harlie's request, v23). */
    images: ['about-art', 'about-art-deluge', 'about-art-soaked'] as ImageId[],
  },
  film: {
    title: 'An Artistic End',
    /** Medium and contribution (Harlie's editorial pass, v23); the runtime (4:54 on YouTube) shows separately, on the play badge. */
    line: 'Short film · Writing, direction, cinematography, and editing',
    runtime: '4:54',
    runtimeLabel: '4 minutes 54 seconds',
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

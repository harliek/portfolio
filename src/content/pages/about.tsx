import type { ImageId } from '../media'

/**
 * Copy of the /about page (src/components/about/AboutContent.tsx).
 *
 * Sources (see docs/content-provenance.md):
 * - Introduction (Harlie's brief of 2026-09-28, which replaces the bio Harlie supplied earlier): the label, the name,
 *   a three-part descriptor and two short paragraphs (ABOUT.intro), in that order of weight, then the portrait. The
 *   paragraphs say how Harlie works (notice where a system breaks down, study how the work is done and what the data
 *   shows, then build the fix or define it for engineering), which is what the case studies show. No employers,
 *   metrics or list of projects: the work below and the case studies carry those.
 * - Education: the résumé (public/resume/harlie-katz-resume.pdf). School, degree, minor, certificate and Sutardja
 *   Center, "Aug 2023 - May 2026" (years only on the site). GPA is left out on purpose. The certificate keeps the
 *   résumé's own name, "Certificate in Entrepreneurship & Technology", with Harlie's "Berkeley’s Sutardja Center"
 *   (2026-09-28). The coursework line names four course titles from Harlie's transcript (DATA C100, INDENG 115,
 *   SOCIOL 150 and PHILOS 132), written out in full; titles only, nothing else from that document. The thesis is
 *   the brief's: Cognitive Science for human intelligence and behavior, Data Science for a computational view of
 *   them, as a perspective, not a list of subjects.
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
  /**
   * The page's meta description (About.tsx): the identity line the homepage and the site description share, then the
   * page's sections (Harlie's brief, 2026-09-28; it was "Harlie Katz builds AI-enabled products and operational
   * tools", a phrase the brief retires).
   */
  description: 'Harlie Katz works in AI product, implementation, and product operations. Education at UC Berkeley, creative work, and contact.',
  /** Brief v21: the old creative portfolio's About format (a small label, the name, a descriptor, short paragraphs, the portrait at the right). */
  label: 'About',
  name: 'Harlie Katz',
  /**
   * Three concrete categories the work shown supports (Harlie's brief, 2026-09-28: at most three; it was "AI
   * implementation · Product strategy and operations", from the résumé header). AI product first: the leasing
   * assistant, and the two builds that grew from the AI tool concept Harlie presented at PlanetArt (both run on rules,
   * as their pages say); implementation for the leasing requirements, testing and rollout; product operations for the
   * PlanetArt work. AboutContent.tsx splits it at each " · ".
   */
  descriptor: 'AI product · Implementation · Product operations',
  /**
   * Harlie's brief of 2026-09-28: two short paragraphs, 59 words, in Harlie's register rather than the brief's own
   * sentence. The first names what Harlie notices; the second how Harlie works from there, joining the cognitive
   * science (how the work is actually done), the data science (what the data shows), and the product, AI and
   * operations work (where automation should help, where a person stays in control, and building or defining the fix)
   * without listing disciplines. The project list and the early-career paragraph are gone at Harlie's request.
   */
  intro: [
    'I’m drawn to the point where a system stops working and people start working around it.',
    'From there, I study how the work is actually done and what the data shows. Then I map where automation should help and where a person should stay in control, and either build the fix or define it for an engineering team.',
  ],
  portraitLabel: 'Portrait of Harlie Katz',

  educationTitle: 'Education',
  education: {
    /** Harlie's wording (v26): three lines, the school with its years, then the degree and the certificate. */
    school: 'University of California, Berkeley',
    /** Years only, with the en dash the case studies' meta uses (2026-09-28; was "2023 to 2026"). */
    dates: '2023–2026',
    // The certificate's name as the résumé has it ("&", not "and"), with Harlie's "Berkeley’s Sutardja Center".
    lines: ['B.A. in Cognitive Science – Data Science minor', 'Certificate in Entrepreneurship & Technology – Berkeley’s Sutardja Center'],
    /**
     * Four actual course titles from Harlie's transcript, written out (Harlie's brief, 2026-09-28: real course names
     * or no line). It was a list of subjects, one of which ("machine learning") is not a course title.
     */
    coursework: 'Courses include Principles and Techniques of Data Science, Industrial and Commercial Data Systems, Social Psychology, and Philosophy of Mind.',
    /**
     * The perspective the two fields gave Harlie, secondary to the degree lines (Harlie's brief, 2026-09-28; it was
     * "I studied intelligence across cognitive and computational systems, learning how people think ...", which the
     * brief asked to replace).
     */
    text: [
      'Cognitive Science taught me to start with human intelligence and behavior, and Data Science gave me a computational way to model them. I\u00a0rarely use one without the other.',
    ],
  },

  /** Get in touch (Harlie's request, 2026-09-27): a name, an email address and a message (ContactForm.tsx). */
  contactTitle: 'Get in touch',
  contact: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send message',
    sent: 'Thank you. Your message was sent.',
    /**
     * Followed by the site's email address as a mailto link and a full stop (ContactForm.tsx builds it from SITE, so
     * the address is never typed twice): "Your message could not be sent. Please email harliekatz@berkeley.edu."
     */
    failed: 'Your message could not be sent. Please email',
  },

  creativeTitle: 'Creative work',
  portfolio: {
    /** The restored original creative homepage (a separate static build, outside the router). */
    href: '/creative/',
    title: 'Creative Portfolio',
    /**
     * Each card's line is kind · scope or role (Harlie's brief, 2026-09-28: one taxonomy for the three cards, where
     * a collection, a category and a single work had mixed scope, medium and role).
     */
    line: 'Full portfolio · Film and visual art',
    action: 'Open portfolio',
  },
  /**
   * The creative portfolio's Charcoal Art page (a separate static build: a plain link, full page load). The title is
   * that page's own name (it was "Art"); the three drawings are portraits and figures.
   */
  art: {
    href: '/creative/art',
    title: 'Charcoal Art',
    line: 'Drawings · Portraits and figures',
    action: 'View art',
    /** Harlie's three portrait drawings (A Life, Beautifully Worn; Time Unspoken; Written by Time), side by side in the one link. */
    images: ['about-art', 'about-art-time-unspoken', 'about-art-written-by-time'] as ImageId[],
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

  /**
   * The direct ways to reach Harlie, beside "Send message" (Harlie's request, 2026-09-28: email, LinkedIn and the
   * résumé "clearly visible near the contact section", not only in the footer). The address and links are the
   * site's own (src/content/site.ts), as the footer shows them; no phone number and no GitHub.
   */
  links: {
    label: 'Email, LinkedIn, and résumé',
    linkedin: 'LinkedIn',
    resume: 'Résumé',
  },
}

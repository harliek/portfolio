import type { ImageId } from '../media'

/**
 * Copy of the /about page (src/components/about/AboutContent.tsx).
 *
 * Sources (see docs/content-provenance.md):
 * - Introduction (brief v21): the label, name, descriptor and two short
 *   paragraphs (ABOUT.intro), Harlie's own text from the copy brief of
 *   2026-09-29 (perspective and direction; no project recap, no employers).
 * - Education: the résumé (public/resume/harlie-katz-resume.pdf). School,
 *   degree, minor, certificate and Sutardja Center, "Aug 2023 - May 2026"
 *   (years only on the site). GPA is left out on purpose. The three lines and
 *   the coursework line are Harlie's wording (v26). The coursework line names
 *   "psychology", which the résumé's coursework (Artificial Intelligence,
 *   Large Language Models, Machine Learning, Computational Cognitive
 *   Modeling, Data Analytics, AI Governance, Human Behavior, Computer
 *   Science, User Experience, Economic Systems) does not; it stays as Harlie
 *   wrote it, flagged for Harlie (2026-09-28). The one sentence is
 *   Harlie's (copy brief of 2026-09-29): the three-year degree (registrar
 *   record) and the fields it combined.
 * - Experience is no longer on this page (brief v21); the roles are in the
 *   résumé and the case studies.
 * - Creative work: the original creative portfolio (/creative/) and An
 *   Artistic End, with its authentic poster and YouTube id from the
 *   original portfolio. Titles, one short line and an action each (copy
 *   brief of 2026-09-28); no publication metadata.
 *
 * Authored copy uses no colons and no em dashes.
 */

/** The film's authentic poster (the original portfolio's thumbnail, pinks untouched). */
const FILM_POSTER: ImageId = 'film-artistic-end'

export const ABOUT = {
  /**
   * The page's meta description (About.tsx), from the bio's first sentence and the page's sections (2026-09-28; it
   * was "About Harlie Katz, with education, creative work, and a short film.", which left out the contact section and
   * set the film apart from the creative work).
   */
  description: 'Harlie Katz on applied AI, with education at UC Berkeley, creative work, and contact details.',
  /** Brief v21: the old creative portfolio's About format (a small label, the name, a descriptor, short paragraphs, the portrait at the right). */
  label: 'About',
  name: 'Harlie Katz',
  /**
   * Harlie's professional descriptor from the brief of 2026-09-28 ("AI Product Strategy & Implementation", the
   * homepage line), in this page's sentence case; it was the résumé header, AI IMPLEMENTATION | PRODUCT STRATEGY &
   * OPERATIONS.
   */
  descriptor: 'AI product strategy and implementation',
  /** Harlie's editorial pass (v23): the name heading introduces Harlie, and the education detail is not repeated from Education. */
  intro: [
    'I’m deeply invested in the future of applied AI and its potential to expand what people can learn, create, and pursue independently. Making specialized knowledge more accessible opens opportunities for people to develop ideas and take on work that once required resources beyond their reach. I’m driven to turn that potential into products that people can put to use.',
    'My focus is on identifying where new capabilities can make a meaningful difference and developing the ideas into working applications. I bring research, technical curiosity, and hands-on prototyping to that process, with a commitment to understanding the problem and carrying the work through. As AI advances, I’m motivated by the opportunity to take on greater responsibility for what gets built and how it serves the people using it.',
  ],
  portraitLabel: 'Portrait of Harlie Katz',

  educationTitle: 'Education',
  education: {
    /** Harlie's wording (v26): three lines, the school with its years, then the degree and the certificate. */
    school: 'University of California, Berkeley',
    /** Years only, with the en dash the case studies' meta uses (2026-09-28; was "2023 to 2026"). */
    dates: '2023–2026',
    lines: ['B.A. in Cognitive Science – Data Science minor', 'Certificate in Entrepreneurship and Technology – Berkeley’s Sutardja Center'],
    /** Under the three lines, Harlie's wording (v26), without the colon (copy brief of 2026-09-29: no colons in authored copy). */
    coursework: 'Coursework in machine learning, data science, user experience, computer science, psychology, and human cognition',
    /**
     * Harlie's sentence, verbatim (copy brief of 2026-09-29): the three-year degree (registrar record: Fall 2023 to May
     * 2026) and what it combined. No further explanation of cognition and AI.
     */
    text: ['I completed my Berkeley degree in three years, studying intelligence from human and computational perspectives. Cognitive science and data science gave me a foundation for examining how minds and machines represent information, learn from experience, and draw conclusions. That understanding informs how I evaluate AI’s capacity to extend human reasoning and the judgment required to apply it effectively.'],
  },

  /** Get in touch (Harlie's request, 2026-09-27): a name, an email address and a message (ContactForm.tsx). */
  contactTitle: 'Get in touch',
  contact: {
    /**
     * Harlie's one-line invitation, verbatim (copy brief of 2026-09-29), above the form in the section's own grid
     * (ContactForm.tsx), in the Education paragraph's existing text style. Stated here only: not in the About
     * paragraphs, the page endings or the footer.
     */
    intro: 'I bring experience translating research and workflow requirements into interactive prototypes, with the initiative to carry ideas into execution. I’m looking for a company developing useful AI products where I can take responsibility, contribute to its direction, and grow with the team.',
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
    /**
     * The line is Harlie's sentence (copy brief of 2026-09-29); the title is the portfolio's name as the homepage tile
     * gives it, so the line does not repeat "My creative portfolio" under a heading of the same words. The badge adds
     * its ↗.
     */
    title: 'Creative Portfolio',
    line: 'My creative portfolio brings together films, drawings, and earlier work.',
    action: 'Open creative portfolio',
  },
  /**
   * The creative portfolio's Charcoal Art page (a separate static build: a plain link, full page load). The line names
   * the verified medium: that page is titled "Charcoal Art", and the three drawings shown are charcoal portraits.
   */
  art: {
    href: '/creative/art',
    title: 'Selected drawings and studies',
    line: 'Drawn in charcoal.',
    action: 'View drawings',
    /** Harlie's three portrait drawings (A Life, Beautifully Worn; Time Unspoken; Written by Time), side by side in the one link. */
    images: ['about-art', 'about-art-time-unspoken', 'about-art-written-by-time'] as ImageId[],
  },
  film: {
    title: 'An Artistic End',
    /**
     * Harlie's "A short film." (copy brief of 2026-09-28) with the documented credits kept (writer, director,
     * cinematographer, editor: Harlie's original portfolio); the runtime (4:54 on YouTube) shows on the badge.
     */
    line: 'A short film I wrote, directed, filmed, and edited.',
    runtime: '4:54',
    runtimeLabel: '4 minutes 54 seconds',
    youtubeId: 'a2Vm1LFB_68',
    poster: FILM_POSTER,
    /** The site-wide action label (copy brief of 2026-09-29); the button's accessible name adds the title and length. */
    action: 'Watch film',
    /** A fallback once the player is mounted (in case the embed is blocked). */
    youtube: 'Watch on YouTube',
  },

  /**
   * The direct ways to reach Harlie, beside "Send message" (Harlie's request, 2026-09-28: email, LinkedIn and the
   * résumé "clearly visible near the contact section", not only in the footer). The address and links are the
   * site's own (src/content/site.ts), as the footer shows them; no phone number and no GitHub.
   */
  links: {
    label: 'Email, LinkedIn and résumé',
    /** Harlie's labels (copy brief of 2026-09-28); the email link still opens the site's address (SITE.emailHref). */
    email: 'Email me',
    linkedin: 'LinkedIn',
    resume: 'View résumé',
  },
}


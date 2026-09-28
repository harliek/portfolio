import type { ImageId } from './media'

/**
 * The six work entries, in the homepage field's order (field.ts, Harlie's order of 2026-09-28; About me and Creative
 * Portfolio, tiles there, are not case studies): Creative Production, Spreadsheet Agent, Merchandising Dashboard,
 * Jumpstart Finance, AI Leasing Agent, CafePress UK. The Work menu and the next-project sequence follow it (CafePress
 * UK loops back to Creative Production).
 * Page copy lives in src/content/pages/<id>.ts(x).
 *
 * Verified facts only (résumé and project sources; see
 * docs/content-provenance.md). CafePress UK and Merchandising Dashboard are
 * separate: the first is PlanetArt internship work, the second an
 * independent prototype with synthetic data.
 */

export type ProjectId =
  | 'cafepress-uk'
  | 'merchandising-platform'
  | 'spreadsheet-agent'
  | 'ai-leasing-agent'
  | 'jumpstart-finance'
  | 'client-work'

/**
 * An image a case study shows first beside its heading, with the `sizes` its
 * component passes, so the route transition fetches and decodes the very
 * file the page will pick. `media` limits it to the viewports where the page
 * shows it (a phone crop replaces a wide one below 600px).
 */
export interface OpeningImage {
  image: ImageId
  sizes: string
  media?: string
}

export interface Project {
  id: ProjectId
  /** Route segment under /work/. */
  slug: string
  order: number
  /** Case study name (the case H1 and document title; accurate project naming). */
  name: string
  /**
   * The project's name in the Work shelf and the mobile menu: the same
   * identity the homepage field uses (brief v16: Jumpstart Finance, never
   * the role; CafePress UK; Creative Production).
   */
  displayName: string
  /** Display subtitle matching the cover PNG's embedded subtitle (read nowhere since the homepage carousel was removed). */
  displaySubtitle: string
  /** Supporting label (carousel caption, case subtitle when none is given). */
  label: string
  /**
   * The Work shelf's and the menu's line under the name: the homepage tile's own caption, "type · context" (field.ts;
   * Harlie's brief, 2026-09-28), so the metadata reads the same across the site.
   */
  category: string
  /** One short factual sentence for the Selected work index. */
  summary: string
  /** Year or timeframe for lists. */
  year: string
  dateRange: string
  role: string
  org: string
  status: string
  /** Exact carousel description (revealed on hover/focus; always visible on touch). */
  description: string
  /** Compact case metadata ("Company:", "Role:", "Dates:", "Project status:"). */
  meta: { company: string; role: string; dates: string; status: string }
  /** Transparent PNG object from `final png tiles/`: the project's thumbnail in the Work shelf and the small-screen menu. */
  cover: ImageId
  /**
   * What the case study shows first in its media stage, beside the heading
   * (the storefront, the three prototype phones, the listing), with the
   * `sizes` its component passes; empty when that is a video poster (a plain
   * URL, not a registered image). The route transition fetches and decodes
   * these while the page being left stays (on hover or focus of a project
   * link, at the latest on the click), so the heading and its media arrive
   * together (src/components/transition/warm.ts). Keep in step
   * with the page's media and its `sizes`: a mismatch costs a short wait
   * before the change starts (capped by TRANSITION.mediaWaitMs), and the
   * page's picture may still be decoding as it arrives.
   */
  hero: readonly OpeningImage[]
  next: ProjectId
  seo: { title: string; description: string }
}

/**
 * The `sizes` a told case study's pictures use (CaseStory reads them from here), and so the `sizes` the route
 * transition warms them with: one definition for both, so the files fetched ahead are the files the page picks
 * (Harlie's QA pass, 2026-09-28: the phones were warmed at 290px and 50vw, and a phone waited for, then did not use,
 * the 901px files). Screens: the whole stage, about 810px at its widest, 58% of the window beside the words (on wide
 * screens and landscape phones), the full width in the phones' band. Phones: a third of the stage each.
 */
export const STAGE_SIZES = '(min-width: 1296px) 810px, (min-width: 900px) 58vw, (orientation: landscape) and (max-height: 540px) 58vw, 100vw'
export const PHONE_SIZES = '(min-width: 1100px) 250px, (min-width: 900px) 20vw, (orientation: landscape) and (max-height: 540px) 20vw, 30vw'

export const PROJECTS: Project[] = [
  {
    id: 'client-work',
    slug: 'creative-production',
    order: 1,
    name: 'Creative Production',
    displayName: 'Creative Production',
    displaySubtitle: 'Client film production at Shift Content',
    label: 'Client film production at Shift Content',
    category: 'Client films · Shift Content',
    summary: 'Production support on client films and related agency work during an internship at Shift Content in London.',
    year: '2026',
    dateRange: 'Jan–May 2026',
    role: 'Creative Strategy and Client Solutions Intern',
    org: 'Shift Content, London',
    status: 'Agency client work',
    description: 'Production and campaign support at Shift Content.',
    meta: { company: 'Shift Content, London', role: 'Creative Strategy & Client Solutions Intern', dates: 'January to May 2026', status: 'Three completed client films' },
    cover: 'obj-creative-production',
    // The opening is a moving frame (a video poster, not a registered image): nothing to warm.
    hero: [],
    next: 'spreadsheet-agent',
    seo: {
      title: 'Creative Production',
      description: 'Client film production at Shift Content in London.',
    },
  },
  {
    id: 'spreadsheet-agent',
    slug: 'spreadsheet-agent',
    order: 2,
    name: 'Spreadsheet Agent',
    displayName: 'Spreadsheet Agent',
    displaySubtitle: 'A rules-based prototype for generating editable spreadsheets from written requests',
    label: 'Rules-based spreadsheet prototype',
    category: 'Data tool · Rules-based prototype',
    summary: 'A rules-based prototype for generating editable spreadsheets from written requests, using synthetic data.',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    org: 'Independent',
    status: 'Independent prototype',
    description: 'A request, a reviewable plan, and an editable spreadsheet.',
    meta: { company: 'Independent project', role: 'Designed and built the prototype', dates: '2026', status: 'Rules-based prototype using synthetic data' },
    cover: 'obj-spreadsheet-agent',
    // The opening is the recording's poster (a plain URL, not a registered image): nothing to warm.
    hero: [],
    next: 'merchandising-platform',
    seo: {
      title: 'Spreadsheet Agent',
      description: 'A rules-based prototype for generating editable spreadsheets from written requests, using synthetic data.',
    },
  },
  {
    id: 'merchandising-platform',
    slug: 'merchandising-platform',
    order: 3,
    name: 'Merchandising Dashboard',
    displayName: 'Merchandising Dashboard',
    displaySubtitle: 'An independent prototype for product analysis and replenishment planning',
    label: 'Independent merchandising application prototype',
    category: 'Product operations · Independent prototype',
    summary: 'An independent application prototype for reviewing product, pricing, inventory, and vendor information with synthetic data.',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    org: 'Independent',
    status: 'Independent prototype',
    description: 'Product, inventory, and replenishment information in one prototype.',
    meta: { company: 'Independent project', role: 'Designed and built the prototype', dates: '2026', status: 'Working prototype' },
    cover: 'obj-merchandising-platform',
    // The walkthrough's poster is a plain video poster URL (not a registered image): nothing to warm.
    hero: [],
    next: 'jumpstart-finance',
    seo: {
      title: 'Merchandising Dashboard',
      description: 'An independent prototype for product analysis and replenishment planning, using synthetic data.',
    },
  },
  {
    id: 'jumpstart-finance',
    slug: 'jumpstart',
    order: 4,
    name: 'Jumpstart Finance',
    displayName: 'Jumpstart Finance',
    displaySubtitle: 'Product development for a financial education app concept',
    label: 'Financial education startup developed during a student venture program',
    category: 'App concept · Student venture',
    summary: 'A financial education concept and mobile prototype developed at the European Innovation Academy in Porto.',
    year: '2024',
    dateRange: 'Jun–Jul 2024',
    role: 'Founder & Product Lead',
    org: 'European Innovation Academy, Porto',
    status: 'Venture concept and prototype',
    description: 'A student venture exploring mobile financial education.',
    meta: { company: 'Jumpstart Finance (student venture)', role: 'Founder & Product Lead', dates: 'June to July 2024', status: 'Program concept and prototype' },
    cover: 'obj-jumpstart-finance',
    // The three original prototype screens beside the introduction (Profile, Home, Community).
    hero: [
      { image: 'jf-tile-profile', sizes: PHONE_SIZES },
      { image: 'jf-tile-home', sizes: PHONE_SIZES },
      { image: 'jf-tile-third', sizes: PHONE_SIZES },
    ],
    next: 'ai-leasing-agent',
    seo: {
      title: 'Jumpstart Finance',
      description: 'Product development for a financial education app concept at the European Innovation Academy in Porto, 2024.',
    },
  },
  {
    id: 'ai-leasing-agent',
    slug: 'valiance',
    order: 5,
    name: 'AI Leasing Agent',
    displayName: 'AI Leasing Agent',
    displaySubtitle: 'Requirements, workflow design, and testing for an AI leasing assistant',
    label: 'Workflow requirements and testing at Valiance Capital',
    category: 'AI implementation · Valiance Capital',
    summary: 'Workflow requirements and testing for a third-party leasing assistant adopted across 18 properties.',
    year: '2024–2025',
    dateRange: 'Oct 2024–Jun 2025',
    role: 'Leasing & Operations Associate',
    org: 'Valiance Capital',
    status: 'Adopted across 18 properties',
    description: 'Requirements and testing for recurring leasing questions.',
    meta: { company: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'October 2024 to June 2025', status: 'Adopted across 18 properties' },
    cover: 'obj-ai-leasing-agent',
    // The listing with its assistant, the first of the three pictures beside the introduction.
    hero: [{ image: 'valiance-listing', sizes: STAGE_SIZES }],
    next: 'cafepress-uk',
    seo: {
      title: 'AI Leasing Agent',
      description: 'Requirements, workflow design, and testing for an AI leasing assistant at Valiance Capital, deployed across 18 properties.',
    },
  },  {
    id: 'cafepress-uk',
    slug: 'cafepress-uk',
    order: 6,
    name: 'CafePress UK',
    displayName: 'CafePress UK',
    displaySubtitle: 'Market research, assortment planning, and early UK storefront prototyping',
    label: 'UK market research and storefront prototype',
    category: 'Market entry · PlanetArt',
    summary: 'UK market research and a localized storefront prototype during a PlanetArt internship.',
    year: '2026',
    dateRange: 'Jun–Aug 2026',
    role: 'Product Operations & Merchandising Intern',
    org: 'PlanetArt',
    status: 'Research and prototype',
    description: 'UK market research and a localized storefront prototype.',
    meta: { company: 'PlanetArt (CafePress)', role: 'Product Operations & Merchandising Intern', dates: 'June to August 2026', status: 'Research and prototype, not launched' },
    cover: 'obj-cafepress-uk',
    // The storefront prototype beside the introduction.
    hero: [{ image: 'cp-storefront', sizes: STAGE_SIZES }],
    next: 'client-work',
    seo: {
      title: 'CafePress UK',
      // The case study's question (Harlie's brief, 2026-09-28), in place of a list of activities.
      description: 'Whether CafePress’s US B2B model could be adapted for the UK, assessed during a PlanetArt internship.',
    },
  },

]

export const projectById = (id: ProjectId): Project => {
  const p = PROJECTS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown project ${id}`)
  return p
}

export const projectPath = (p: Pick<Project, 'slug'>) => `/work/${p.slug}`

export const projectBySlug = (slug: string | undefined) => PROJECTS.find((p) => p.slug === slug)

/** Legacy slugs that redirect to a current case study. */
const LEGACY_SLUGS: Record<string, string> = { planetart: 'cafepress-uk', shift: 'creative-production' }

/** The project whose case study is at `pathname` (legacy /work/planetart and /work/shift count too). */
export const projectForPath = (pathname: string) => {
  const slug = pathname.replace(/\/+$/, '').split('/')[2]
  if (!pathname.startsWith('/work/')) return undefined
  return projectBySlug(LEGACY_SLUGS[slug] ?? slug)
}

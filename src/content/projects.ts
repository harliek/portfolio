import type { AccentId } from './accents'
import type { ImageId } from './media'

/**
 * The six work entries, in the homepage carousel's order (after About Me):
 * Merchandising Platform, CafePress UK, Spreadsheet Agent, AI Leasing Agent,
 * Creative Production, Jumpstart Finance. The Work shelf and the next-project
 * sequence follow it (Jumpstart Finance loops back to Merchandising Platform).
 * Page copy lives in src/content/pages/<id>.ts(x).
 *
 * Verified facts only (résumé and project sources; see
 * docs/content-provenance.md). CafePress UK and Merchandising Platform are
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

/** Each project's accent (src/content/accents.ts). */
export type ProjectAccent = AccentId

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
   * Display title matching the embedded title of the project's cover PNG
   * (Harlie's label table, brief v8 section 4): the homepage's foremost
   * label, the Work shelf, the mobile menu and next-project links.
   */
  displayName: string
  /** Display subtitle matching the cover PNG's embedded subtitle (homepage foremost label only). */
  displaySubtitle: string
  /** Supporting label (carousel caption, case subtitle when none is given). */
  label: string
  /** Very short context for the Work shelf and menu, as on the case page (employer or internship, or independent work). */
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
  /** Transparent PNG cover object from `final png tiles/` (carousel, case opening, Work shelf and next-project thumbnails). */
  cover: ImageId
  /**
   * What the case study shows first in its media stage, beside the heading
   * (the video's poster, the opening state, the conversation, the first
   * film's poster, the three prototype phones), with the `sizes` its
   * component passes. The route transition fetches and decodes these with
   * the cover object while the page being left stays (on hover or focus of a
   * project link, at the latest on the click), so the heading and its media
   * arrive together (src/components/transition/projectTransition.ts). Keep in
   * step with the page's media and its `sizes`: a mismatch costs a short,
   * capped wait inside the change, and the development transition log
   * (window.__pageTransitionLog) records "opening not warmed".
   */
  hero: readonly OpeningImage[]
  accent: ProjectAccent
  next: ProjectId
  seo: { title: string; description: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'merchandising-platform',
    slug: 'merchandising-platform',
    order: 1,
    name: 'Merchandising Platform',
    displayName: 'Merchandising Platform',
    displaySubtitle: 'Prototype: a centralized internal tool connecting product data, inventory, and workflows for merchandising team',
    label: 'Independent merchandising application prototype',
    category: 'Independent prototype',
    summary: 'An independent application prototype for reviewing product, pricing, inventory, and vendor information with synthetic data.',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    org: 'Independent',
    status: 'Independent prototype',
    description: 'Product, inventory, and replenishment information in one prototype.',
    meta: { company: 'Independent project', role: 'Designed and built the prototype', dates: '2026', status: 'Working prototype' },
    cover: 'obj-merchandising-platform',
    // The edited preview's poster (the Canyon Pouch drawer with its quantity), until the preview plays over it.
    hero: [{ image: 'merch-overview', sizes: '(min-width: 1100px) 66vw, 100vw' }],
    accent: 'merchandising-platform',
    next: 'cafepress-uk',
    seo: {
      title: 'Merchandising Platform',
      description: 'An independent merchandising prototype on synthetic data, where each reorder quantity shows its working before export.',
    },
  },
  {
    id: 'cafepress-uk',
    slug: 'cafepress-uk',
    order: 2,
    name: 'CafePress UK',
    displayName: 'CafePress UK Launch',
    displaySubtitle: 'UK market research and storefront prototyping',
    label: 'UK market research and storefront prototype',
    category: 'PlanetArt internship',
    summary: 'UK market research and a localized storefront prototype during a PlanetArt internship.',
    year: '2026',
    dateRange: 'Jun–Aug 2026',
    role: 'Product Operations & Merchandising Intern',
    org: 'PlanetArt',
    status: 'Research and prototype',
    description: 'UK market research and a localized storefront prototype.',
    meta: { company: 'PlanetArt (CafePress)', role: 'Product Operations & Merchandising Intern', dates: 'June to August 2026', status: 'Research and prototype, not launched' },
    cover: 'obj-cafepress-uk',
    // The opening composition's storefront (brief v16).
    hero: [{ image: 'cp-storefront', sizes: '(min-width: 1100px) 56vw, 100vw' }],
    accent: 'cafepress-uk',
    next: 'spreadsheet-agent',
    seo: {
      title: 'CafePress UK',
      description: 'UK promotional products market research and a localized CafePress storefront prototype, developed during a PlanetArt internship.',
    },
  },
  {
    id: 'spreadsheet-agent',
    slug: 'spreadsheet-agent',
    order: 3,
    name: 'Spreadsheet Agent',
    displayName: 'Spreadsheet Agent',
    displaySubtitle: 'Built an agent that retrieves data and generates spreadsheets',
    label: 'Spreadsheet interaction prototype with simulated AI responses',
    category: 'Independent prototype',
    summary: 'An independent prototype that takes a typed request to a reviewed plan and an editable sheet, with simulated AI responses.',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    org: 'Independent',
    status: 'Independent prototype',
    description: 'A request, a reviewable plan, and an editable spreadsheet.',
    meta: { company: 'Independent project', role: 'Designed and built the prototype', dates: '2026', status: 'Prototype with simulated AI responses' },
    cover: 'obj-spreadsheet-agent',
    // The edited preview's poster (the build plan under review), until the preview plays over it.
    hero: [],
    accent: 'spreadsheet-agent',
    next: 'ai-leasing-agent',
    seo: {
      title: 'Spreadsheet Agent',
      description: 'A spreadsheet agent prototype that shows a reviewable plan before building a sheet, with simulated AI responses.',
    },
  },
  {
    id: 'ai-leasing-agent',
    slug: 'valiance',
    order: 4,
    name: 'AI Leasing Agent',
    displayName: 'AI Leasing Agent',
    displaySubtitle: 'Defined workflow and development requirements for an AI agent',
    label: 'Workflow requirements and testing at Valiance Capital',
    category: 'Valiance Capital',
    summary: 'Workflow requirements and testing for a third-party leasing assistant adopted across 18 properties.',
    year: '2024–2025',
    dateRange: 'Oct 2024–Jun 2025',
    role: 'Leasing & Operations Associate',
    org: 'Valiance Capital',
    status: 'Adopted across 18 properties',
    description: 'Requirements and testing for recurring leasing questions.',
    meta: { company: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'October 2024 to June 2025', status: 'Adopted across 18 properties' },
    cover: 'obj-ai-leasing-agent',
    // The conversation (ConversationStage); phones read it as three message strips further down the page.
    hero: [{ image: 'valiance-messages', sizes: '(min-width: 1100px) 58vw, 100vw' }],
    accent: 'ai-leasing-agent',
    next: 'client-work',
    seo: {
      title: 'AI Leasing Agent',
      description: 'Requirements, workflow documentation, and testing for a third-party AI leasing assistant adopted across 18 Valiance Capital properties.',
    },
  },
  {
    id: 'client-work',
    slug: 'creative-production',
    order: 5,
    name: 'Creative Production',
    displayName: 'Film and Campaign Work',
    displaySubtitle: 'Creative strategy, production, and client support at Shift Content',
    label: 'Client film production at Shift Content',
    category: 'Shift Content internship',
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
    accent: 'creative-production',
    next: 'jumpstart-finance',
    seo: {
      title: 'Creative Production',
      description: 'Lighting, camera work, B-roll, and editing on three client films at Shift Content in London.',
    },
  },
  {
    id: 'jumpstart-finance',
    slug: 'jumpstart',
    order: 6,
    name: 'Jumpstart Finance',
    displayName: 'Student Founder of Fintech Venture',
    displaySubtitle: 'CEO of gamified financial education platform concept and prototype',
    label: 'Financial education startup developed during a student venture program',
    category: 'Student venture',
    summary: 'A financial education concept and mobile prototype developed at the European Innovation Academy in Porto.',
    year: '2024',
    dateRange: 'Jun–Jul 2024',
    role: 'Founder & Product Lead',
    org: 'European Innovation Academy, Porto',
    status: 'Venture concept and prototype',
    description: 'A student venture exploring mobile financial education.',
    meta: { company: 'Jumpstart Finance (student venture)', role: 'Founder & Product Lead', dates: 'June to July 2024', status: 'Program concept and prototype' },
    cover: 'obj-jumpstart-finance',
    // The three original prototype screens of the phone group (PhoneGroup).
    hero: [
      { image: 'jf-screen-lessons', sizes: '(min-width: 1100px) 17vw, 34vw' },
      { image: 'jf-screen-progress', sizes: '(min-width: 1100px) 17vw, 34vw' },
      { image: 'jf-screen-community', sizes: '(min-width: 1100px) 17vw, 34vw' },
    ],
    accent: 'jumpstart-finance',
    next: 'merchandising-platform',
    seo: {
      title: 'Jumpstart Finance',
      description: 'A financial education startup concept and mobile prototype developed by a five-person team at the European Innovation Academy in 2024.',
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

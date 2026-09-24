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
 * `sizes` of the case studies' sticky media frame (CaseScroll's default and
 * Client Work's POSTER_SIZES use the same literal).
 */
const FRAME_SIZES = '(min-width: 960px) 620px, calc(100vw - 32px)'

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
   * The image the case study opens on (the `opening` visual in
   * src/content/pages/<page>.tsx, shown in [data-case-hero]) with the same
   * `sizes` as that frame, so the route transition can fetch and decode it
   * ahead of time (on hover or focus of a project link). Keep in step with
   * the page's opening and its frame `sizes`.
   */
  hero: { image: ImageId; sizes: string }
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
    hero: { image: 'mp-overview', sizes: FRAME_SIZES },
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
    hero: { image: 'cafepress-monitor', sizes: FRAME_SIZES },
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
    hero: { image: 'sa-overview', sizes: FRAME_SIZES },
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
    hero: { image: 'valiance-messages', sizes: FRAME_SIZES },
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
    hero: { image: 'nickleby-poster', sizes: FRAME_SIZES },
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
    hero: { image: 'jf-screen-home', sizes: '(min-width: 960px) 360px, 300px' },
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

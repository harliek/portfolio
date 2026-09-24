import type { ImageId } from './media'

/**
 * The six work entries, in the order used everywhere the work appears as a
 * sequence (carousel, Work shelf, Selected work index, next project).
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

export type ProjectAccent = 'violet' | 'green' | 'warm'

/** `sizes` of the wide opening images (the hero components use the same literal). */
const HERO_SIZES = '(min-width: 1320px) 690px, (min-width: 960px) 55vw, calc(100vw - 40px)'

export interface Project {
  id: ProjectId
  /** Route segment under /work/. */
  slug: string
  order: number
  /** Short project name (always visible under a carousel tile; the case H1). */
  name: string
  /** Supporting label (carousel caption, case subtitle when none is given). */
  label: string
  /** Very short category for the Work shelf. */
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
  /** Transparent PNG phone mockup for the homepage carousel (presentation artwork). */
  phone: ImageId
  /** 3:4 cover composition (carousel tile, shelf thumbnail, next project). */
  cover: ImageId
  /**
   * The first image inside the case opening's [data-case-hero], with the
   * same `sizes`, so the route transition can fetch it ahead of time (on
   * hover or focus of a project link). Keep in step with the hero component.
   */
  hero: { image: ImageId; sizes: string }
  accent: ProjectAccent
  next: ProjectId
  seo: { title: string; description: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'cafepress-uk',
    slug: 'cafepress-uk',
    order: 1,
    name: 'CafePress UK',
    label: 'UK market research and storefront prototype',
    category: 'Internship research',
    summary: 'UK market research and a localized storefront prototype during a PlanetArt internship.',
    year: '2026',
    dateRange: 'Jun–Aug 2026',
    role: 'Product Operations & Merchandising Intern',
    org: 'PlanetArt',
    status: 'Research and prototype',
    description: 'UK market research and a localized storefront prototype.',
    meta: { company: 'PlanetArt (CafePress)', role: 'Product Operations & Merchandising Intern', dates: 'June to August 2026', status: 'Research and prototype, not launched' },
    phone: 'phone-cafepress-uk',
    cover: 'cover-cafepress-uk',
    hero: { image: 'planetart-uk', sizes: HERO_SIZES },
    accent: 'violet',
    next: 'merchandising-platform',
    seo: {
      title: 'CafePress UK',
      description: 'UK promotional products market research and a localized CafePress storefront prototype, developed during a PlanetArt internship.',
    },
  },
  {
    id: 'merchandising-platform',
    slug: 'merchandising-platform',
    order: 2,
    name: 'Merchandising Platform',
    label: 'Independent merchandising application prototype',
    category: 'Independent prototype',
    summary: 'An independent application prototype for reviewing product, pricing, inventory, and vendor information with synthetic data.',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    org: 'Independent',
    status: 'Independent prototype',
    description: 'Product, inventory, and replenishment information in one prototype.',
    meta: { company: 'Independent project', role: 'Designed and built the prototype', dates: '2026', status: 'Prototype with synthetic data' },
    phone: 'phone-merchandising-platform',
    cover: 'cover-merchandising-platform',
    hero: { image: 'merch-overview', sizes: HERO_SIZES },
    accent: 'violet',
    next: 'spreadsheet-agent',
    seo: {
      title: 'Merchandising Platform',
      description: 'An independent merchandising application prototype that uses synthetic data, separate from PlanetArt systems.',
    },
  },
  {
    id: 'spreadsheet-agent',
    slug: 'spreadsheet-agent',
    order: 3,
    name: 'Spreadsheet Agent',
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
    phone: 'phone-spreadsheet-agent',
    cover: 'cover-spreadsheet-agent',
    hero: { image: 'sheet-returned', sizes: HERO_SIZES },
    accent: 'violet',
    next: 'ai-leasing-agent',
    seo: {
      title: 'Spreadsheet Agent',
      description: 'An independent spreadsheet workflow prototype with simulated AI responses and no live model connection.',
    },
  },
  {
    id: 'ai-leasing-agent',
    slug: 'valiance',
    order: 4,
    name: 'AI Leasing Agent',
    label: 'Workflow requirements and testing at Valiance Capital',
    category: 'Workflow requirements',
    summary: 'Workflow requirements and testing for a third-party leasing assistant adopted across 18 properties.',
    year: '2024–2025',
    dateRange: 'Oct 2024–Jun 2025',
    role: 'Leasing & Operations Associate',
    org: 'Valiance Capital',
    status: 'Adopted across 18 properties',
    description: 'Requirements and testing for recurring leasing questions.',
    meta: { company: 'Valiance Capital', role: 'Leasing & Operations Associate', dates: 'October 2024 to June 2025', status: 'Adopted across 18 properties' },
    phone: 'phone-ai-leasing-agent',
    cover: 'cover-ai-leasing-agent',
    hero: { image: 'valiance-messages', sizes: HERO_SIZES },
    accent: 'violet',
    next: 'jumpstart-finance',
    seo: {
      title: 'AI Leasing Agent',
      description: 'Workflow requirements and testing for an AI leasing assistant at Valiance Capital. The production assistant was supplied by a third-party platform.',
    },
  },
  {
    id: 'jumpstart-finance',
    slug: 'jumpstart',
    order: 5,
    name: 'Jumpstart Finance',
    label: 'Financial education startup developed during a student venture program',
    category: 'Student venture',
    summary: 'A financial education concept and mobile prototype developed at the European Innovation Academy in Porto.',
    year: '2024',
    dateRange: 'Jun–Jul 2024',
    role: 'Founder & Product Lead',
    org: 'European Innovation Academy, Porto',
    status: 'Venture concept and prototype',
    description: 'A student venture exploring mobile financial education.',
    meta: { company: 'European Innovation Academy, Porto', role: 'Founder & Product Lead', dates: 'June to July 2024', status: 'Program concept and prototype' },
    phone: 'phone-jumpstart-finance',
    cover: 'cover-jumpstart-finance',
    hero: { image: 'jumpstart-proto-3', sizes: '(min-width: 960px) 190px, 26vw' },
    accent: 'green',
    next: 'client-work',
    seo: {
      title: 'Jumpstart Finance',
      description: 'A financial education startup concept and mobile prototype developed by a five-person team at the European Innovation Academy in 2024.',
    },
  },
  {
    id: 'client-work',
    slug: 'shift',
    order: 6,
    name: 'Client Work',
    label: 'Creative strategy and production support at Shift Content',
    category: 'Agency production',
    summary: 'Production support on client films and related agency work during an internship at Shift Content in London.',
    year: '2026',
    dateRange: 'Jan–May 2026',
    role: 'Creative Strategy and Client Solutions Intern',
    org: 'Shift Content, London',
    status: 'Agency client work',
    description: 'Production and campaign support at Shift Content.',
    meta: { company: 'Shift Content, London', role: 'Creative Strategy & Client Solutions Intern', dates: 'January to May 2026', status: 'Agency productions with a team' },
    phone: 'phone-client-work',
    cover: 'cover-client-work',
    hero: { image: 'nickleby-poster', sizes: '(min-width: 1320px) 720px, (min-width: 960px) 58vw, calc(100vw - 40px)' },
    accent: 'warm',
    next: 'cafepress-uk',
    seo: {
      title: 'Client Work',
      description: 'Production preparation, coordination, and related agency work on client films at Shift Content in London.',
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

/** The project whose case study is at `pathname` (legacy /work/planetart counts as CafePress UK). */
export const projectForPath = (pathname: string) => {
  const slug = pathname.replace(/\/+$/, '').split('/')[2]
  if (!pathname.startsWith('/work/')) return undefined
  return projectBySlug(slug === 'planetart' ? 'cafepress-uk' : slug)
}

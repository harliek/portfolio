import type { ImageId, VideoId } from './media'

/**
 * Shared navigation data for the five primary work entries.
 * Detailed case-study copy lives with each page in src/pages/work/.
 * Order here is the order used everywhere the work appears as a sequence.
 */

export type ProjectId = 'planetart' | 'valiance' | 'spreadsheet-agent' | 'jumpstart' | 'shift'

export interface Project {
  id: ProjectId
  slug: string
  order: number
  /** Descriptive title (the case-study H1). */
  title: string
  /** Organization or context line. */
  org: string
  /** Year label for lists and cards. */
  year: string
  dateRange: string
  role: string
  /** Homepage summary (exact supplied copy). */
  summary: string
  /** Case-study summary (exact supplied copy; may differ from the card summary). */
  caseSummary: string
  status: string
  cover: ImageId
  hero: ImageId
  ownership?: string
  related: Array<ImageId | VideoId>
  next: ProjectId
  seo: { title: string; description: string }
  /** Where the evidence for this project's claims is recorded. */
  provenance: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'planetart',
    slug: 'planetart',
    order: 1,
    title: 'Merchandising & UK launch',
    org: 'PlanetArt / CafePress',
    year: '2026',
    dateRange: 'Jun–Aug 2026',
    role: 'Product Operations & Merchandising Intern',
    summary: 'UK market research, a localized storefront prototype, and a centralized merchandising concept.',
    caseSummary: 'UK market research, a localized storefront prototype, and a concept for organizing merchandising information.',
    status: 'Research and prototypes',
    cover: 'cover-planetart',
    hero: 'cover-planetart',
    ownership: 'The internship work is shown first. A later independent Merch Console rebuild appears below and uses synthetic data.',
    related: ['planetart-competitors', 'planetart-assortment', 'planetart-uk', 'planetart-concept-dashboard', 'planetart-concept-workflow', 'merch-console', 'merch-catalog', 'merch-vendors', 'merch-drawer'],
    next: 'valiance',
    seo: {
      title: 'Merchandising & UK launch',
      description: 'UK market research, a localized storefront prototype, and a concept for organizing merchandising information.',
    },
    provenance: ['docs/content-provenance.md#planetart', 'docs/asset-audit.md#planetart'],
  },
  {
    id: 'valiance',
    slug: 'valiance',
    order: 2,
    title: 'AI leasing requirements',
    org: 'Valiance Capital',
    year: '2024–2025',
    dateRange: 'Oct 2024–Jun 2025',
    role: 'Leasing & Operations Associate',
    summary: 'Frontline leasing workflows translated into requirements, boundaries, and testing for an AI assistant.',
    caseSummary: 'Translating frontline leasing work into requirements, boundaries, and testing for an AI assistant.',
    status: 'Product definition and workflow testing',
    cover: 'cover-valiance',
    hero: 'cover-valiance',
    ownership: 'I proposed the opportunity and helped define and test the workflows. The production assistant was provided by a third-party platform.',
    related: ['valiance-messages'],
    next: 'spreadsheet-agent',
    seo: {
      title: 'AI leasing requirements',
      description: 'Translating frontline leasing work into requirements, boundaries, and testing for an AI assistant.',
    },
    provenance: ['docs/content-provenance.md#valiance', 'docs/asset-audit.md#valiance'],
  },
  {
    id: 'spreadsheet-agent',
    slug: 'spreadsheet-agent',
    order: 3,
    title: 'Spreadsheet Agent',
    org: 'Independent prototype',
    year: '2026',
    dateRange: '2026',
    role: 'Independent project',
    summary: 'A prompt-to-spreadsheet interaction prototype with simulated AI responses.',
    caseSummary: 'A prompt-to-spreadsheet interaction prototype for turning a request into an editable sheet.',
    status: 'Simulated AI responses',
    cover: 'cover-spreadsheet',
    hero: 'cover-spreadsheet',
    ownership: 'The demonstrated prototype did not have a live LLM/API connection.',
    related: ['spreadsheet-agent', 'sheet-request', 'sheet-returned', 'sheet-list'],
    next: 'jumpstart',
    seo: {
      title: 'Spreadsheet Agent',
      description: 'A prompt-to-spreadsheet interaction prototype for turning a request into an editable sheet.',
    },
    provenance: ['docs/content-provenance.md#spreadsheet-agent', 'docs/asset-audit.md#spreadsheet-agent'],
  },
  {
    id: 'jumpstart',
    slug: 'jumpstart',
    order: 4,
    title: 'Financial learning prototype',
    org: 'Jumpstart Finance',
    year: '2024',
    dateRange: 'Jun–Jul 2024',
    role: 'Founder & Product Lead',
    summary: 'A student venture combining financial education, product prototyping, and business-model exploration.',
    caseSummary: 'A student venture exploring financial education through a mobile product, built with a five-person international team.',
    status: 'Venture concept and prototype',
    cover: 'cover-jumpstart',
    hero: 'cover-jumpstart',
    related: ['jumpstart-competitors', 'jumpstart-proto-1', 'jumpstart-proto-2', 'jumpstart-proto-3', 'jumpstart-proto-4', 'jumpstart-business-model'],
    next: 'shift',
    seo: {
      title: 'Financial learning prototype',
      description: 'A student venture exploring financial education through a mobile product, built with a five-person international team.',
    },
    provenance: ['docs/content-provenance.md#jumpstart', 'docs/asset-audit.md#jumpstart'],
  },
  {
    id: 'shift',
    slug: 'shift',
    order: 5,
    title: 'Creative production',
    org: 'Shift Content',
    year: '2026',
    dateRange: 'Jan–May 2026',
    role: 'Creative Strategy & Client Solutions Intern',
    summary: 'Fashion, interview, and event films supported through agency production work.',
    caseSummary: 'Fashion, interview, and event films supported through agency production work.',
    status: 'Agency production',
    cover: 'cover-shift',
    hero: 'cover-shift',
    ownership: 'These are agency films. My contribution included production support and related client and creative work; I am not claiming sole authorship of the finished films.',
    related: ['aristocracy', 'aristocracy-photo-234', 'aristocracy-photo-103', 'aristocracy-photo-077', 'nickleby', 'heck'],
    next: 'planetart',
    seo: {
      title: 'Creative production',
      description: 'Fashion, interview, and event films supported through agency production work.',
    },
    provenance: ['docs/content-provenance.md#shift', 'docs/asset-audit.md#shift'],
  },
]

export const projectById = (id: ProjectId): Project => {
  const p = PROJECTS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown project ${id}`)
  return p
}

export const projectPath = (p: Pick<Project, 'slug'>) => `/work/${p.slug}`

export const projectBySlug = (slug: string | undefined) => PROJECTS.find((p) => p.slug === slug)

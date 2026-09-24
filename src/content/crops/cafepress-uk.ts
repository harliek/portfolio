import type { ImageAsset } from '../media'

/**
 * Focused evidence crops for this page (scripts/crops/cafepress-uk.json →
 * node scripts/prepare-media.mjs crops cafepress-uk). Keys are image ids; each entry
 * is a full ImageAsset (type: 'image') with the dimensions the task prints.
 *
 * Sources (all original internship artifacts):
 * - PlanetArt/cafepress uk/uk web.png (1672×941), the storefront prototype.
 *   The two header details are 712×401 (the 16:9 case frame), cropped at full
 *   resolution: about 13px interface text in a 620px frame.
 * - PlanetArt/planetart presentation.pdf, rendered at 300dpi with
 *   `pdftoppm -r 300 -f N -l N -png … .media-cache/pdf/cp300-p` (3000×1688):
 *   PDF page 4 (slide 5, Competitor Findings) and page 9 (slide 8, UK Launch
 *   Recommendations).
 */
const crop = (a: Omit<ImageAsset, 'type' | 'file' | 'fallback' | 'provenance' | 'synthetic'>): ImageAsset => ({
  type: 'image',
  file: a.id,
  fallback: 'jpg',
  provenance: 'original-artifact',
  synthetic: false,
  ...a,
})

export const CAFEPRESS_UK_CROPS = {
  'cp-competitors': crop({
    id: 'cp-competitors',
    width: 2820,
    height: 1586,
    widths: [640, 960, 1280, 1600],
    alt: 'Internship slide titled Competitor Findings, listing the competitors reviewed (Printful, Prodigi, Printify, Vistaprint and 4imprint) and the key patterns observed. Sites were generally clear, category-led and easy to browse; recognizable brands were featured prominently; eco-friendly products appeared as a recurring product theme; UK offerings often mirrored US-style merchandising approaches rather than introducing a fundamentally different model.',
    caption: 'Competitor Findings slide from my internship presentation.',
    source: 'PlanetArt/planetart presentation.pdf, page 4 (slide 5)',
    role: 'CafePress UK case frame (competitor review)',
    crop: 'x 120–2940, y 60–1646 of the page rendered at 300dpi (3000×1688); the slide number is left out',
  }),
  'cp-header-brand': crop({
    id: 'cp-header-brand',
    width: 712,
    height: 401,
    widths: [640, 712],
    alt: 'Detail of the storefront prototype, showing a Fast UK Delivery notice, the CafePress Business UK logo, the first product categories (Clothing & Workwear, Drinkware, Bags) and the headline Branded Promotional Products for UK Businesses.',
    caption: 'The CafePress Business UK name and headline in the storefront prototype.',
    source: 'PlanetArt/cafepress uk/uk web.png',
    role: 'CafePress UK case frame (UK positioning)',
    crop: 'x 0–712, y 10–411 of the 1672×941 screenshot',
  }),
  'cp-header-nav': crop({
    id: 'cp-header-nav',
    width: 712,
    height: 401,
    widths: [640, 712],
    alt: 'Detail of the storefront prototype, showing a No Setup Fees notice with a pound sign, the UK phone number 020 3946 0018 with hours Monday to Friday 9am to 5pm, Sign in and Basket, and the categories Tech, Eco-Friendly, Events & Gifts and Industries above the hero photograph.',
    caption: 'The right side of the storefront prototype’s header and the category row.',
    source: 'PlanetArt/cafepress uk/uk web.png',
    role: 'CafePress UK case frame (category row; UK wording and contact details)',
    crop: 'x 960–1672, y 10–411 of the 1672×941 screenshot',
  }),
  'cp-storefront': crop({
    id: 'cp-storefront',
    width: 1672,
    height: 941,
    widths: [640, 960, 1280, 1672],
    alt: 'The complete CafePress Business UK storefront prototype, with notices for fast UK delivery, volume discounts and no setup fees; the logo, search, a UK phone number, Sign in and Basket; the category row from Clothing & Workwear to Industries with Eco-Friendly; the headline Branded Promotional Products for UK Businesses; service points including UK-based support; and Shop Popular Categories.',
    caption: 'The complete storefront prototype.',
    source: 'PlanetArt/cafepress uk/uk web.png',
    role: 'CafePress UK case frame (completed prototype) and enlargement of the opening mockup',
    crop: 'The whole 1672×941 screenshot (this page’s own caption; same pixels as planetart-uk)',
  }),
  'cp-recommendations': crop({
    id: 'cp-recommendations',
    width: 2700,
    height: 1380,
    widths: [640, 960, 1280, 1600],
    alt: 'Internship slide titled UK Launch Recommendations, with three recommendations. Adapt the existing US B2B model; localize the assortment selectively by prioritizing UK-relevant brands and eco-friendly product options; support launch with operational readiness through strong product data, vendor coordination and merchandising workflows.',
    caption: 'Recommendations slide from my internship presentation.',
    source: 'PlanetArt/planetart presentation.pdf, page 9 (slide 8)',
    role: 'CafePress UK Results evidence',
    crop: 'x 150–2850, y 90–1470 of the page rendered at 300dpi (3000×1688); the footer is left out',
  }),
} satisfies Record<string, ImageAsset>

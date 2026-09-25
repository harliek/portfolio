import type { Chapter } from '../../components/case/ChapterDemo'
import type { ImageId } from '../media'

/**
 * Merchandising Platform (brief v17): the decision process is the story.
 * Hero, the problem, three design decisions with their exact evidence, the
 * demonstration, and what the prototype does and does not yet show.
 *
 * Facts (checked against the recording, PlanetArt/Merchandising Dashboard/
 * Dashboard Video.mov; footer: "Portfolio project. Synthetic catalog, no
 * backend, nothing leaves your browser."):
 *  - Independent prototype with synthetic data, built after the internship
 *    (Harlie, brief v5). Metadata stays "Independent project".
 *  - Canyon Pouch (BAG-1021, Kestrel Goods): list price $70.91, 1,003 on
 *    hand, 903 available, 11.71 units a day over 28 days, a 45 day quoted
 *    lead time, a 200 unit minimum order, a suggestion of 200 units
 *    (197.1 rounded up to the minimum); the drawer: "This is a calculation
 *    and a CSV export. The console does not place orders."
 *  - Inventory (21.6s): safety stock for a 95% service level, rows ranked by
 *    margin at risk, an "Export order sheet" button (never clicked in the
 *    recording). Ask (39.4s): fixed query shapes, "There is no language
 *    model involved."
 *  - The problem copy is Harlie's (brief v17); no count of tools is claimed.
 * Not claimed: PlanetArt data or use, production use, savings, a model
 * connection, an export being run, any user testing.
 */
export const MERCH = {
  title: 'Merchandising Platform',
  meta: ['Independent project', 'Product design and build', '2026'],
  status: 'Working prototype with synthetic data',
  summary: (
    <p>
      After my PlanetArt internship, I built a merchandising platform that brings catalog, stock, sales, and replenishment information into{' '}
      <strong>one workspace</strong>, so a merchandiser can see what to reorder and why.
    </p>
  ),
  hero: 'merch-cover' as ImageId,

  problem: {
    heading: 'One decision, several disconnected sources.',
    body: 'Product, inventory, vendor, and sales information had to be brought together before a reorder could be reviewed.',
    sources: [
      { name: 'Product', fields: [['SKU', 'BAG-1021'], ['List price', '$70.91']] },
      { name: 'Inventory', fields: [['On hand', '1,003 units'], ['Available', '903 units']] },
      { name: 'Vendor', fields: [['Supplier', 'Kestrel Goods'], ['Lead time', '45 days']] },
      { name: 'Sales', fields: [['28 days', '11.71 units a day']] },
    ],
    record: {
      title: 'Canyon Pouch',
      sub: 'BAG-1021 · Kestrel Goods',
      rows: [
        ['On hand', '1,003 units'],
        ['Sales velocity', '11.71 units a day'],
        ['Vendor lead time', '45 days'],
        ['Minimum order', '200 units'],
        ['Suggested order', '200 units'],
      ],
    },
    before: 'Separate sources',
    after: 'One reviewable product record',
    note: 'Values from the prototype’s synthetic catalog.',
  },

  decisions: [
    {
      id: 'together',
      heading: 'Bring product information together',
      why: 'A reorder needs the product, its stock, its supplier, and its recent sales at the same moment. I joined them on one catalog row and in one detail panel, so nothing has to be looked up elsewhere.',
      image: 'merch-drawer' as ImageId,
      proof: 'Selecting a product opens one panel with its unit economics, costs, and trailing 28-day sales, beside the catalog it came from.',
    },
    {
      id: 'reasoning',
      heading: 'Explain the suggested quantity',
      why: 'A number without its working asks the merchandiser to trust it. Each recommendation shows its inputs, each step, and the supplier minimum that shaped it.',
      image: 'merch-working' as ImageId,
      notes: [
        { label: 'Suggested quantity', text: '197.1 units, rounded up to the 200 unit minimum', y: 17 },
        { label: 'Inputs', text: 'Sales velocity, its variability, and the quoted lead time', y: 46.5 },
      ],
      proof: 'Every input and step behind the 200 unit suggestion is on screen, including the minimum order that set it.',
    },
    {
      id: 'control',
      heading: 'Keep the decision with the merchandiser',
      why: 'Ordering stays a person’s call. The prototype ranks what needs replenishment and prepares an order sheet; it stops before placing an order.',
      image: 'merch-export' as ImageId,
      proof: 'Inventory ends in an Export order sheet action, and the product panel states its scope as a calculation and a CSV export, never an order.',
    },
  ],

  demo: {
    heading: 'The prototype in use',
    chapters: [
      {
        label: 'Bring product information together',
        caption: 'The overview and catalog show every SKU with its vendor, stock position, and trailing sales on one row.',
        start: 0,
        end: 11.5,
        still: 7.5,
      },
      {
        label: 'Explain the suggested quantity',
        caption: 'A product panel recommends 200 units and opens its working, down to the supplier minimum.',
        start: 11.5,
        end: 20.4,
        still: 15.2,
      },
      {
        label: 'Keep the decision with the merchandiser',
        caption: 'Inventory ranks what needs replenishment by margin at risk and ends in an order sheet export.',
        start: 20.4,
        end: 25.5,
        still: 21.6,
      },
    ] satisfies Chapter[],
    also: 'Also in the recording: an Ask screen that matches a question to fixed query shapes and shows the query it ran. No language model is involved.',
  },

  closing: {
    heading: 'What the prototype demonstrates',
    demonstrated: [
      'A catalog that joins product, vendor, stock, and 28-day sales on one row and in one panel.',
      'A suggested quantity with its full working, from safety stock and reorder point to the supplier minimum.',
      'An Inventory view ranked by margin at risk, ending in an order sheet export.',
      'An Ask screen that shows the query behind each answer.',
    ],
    toValidate: [
      'Whether merchandisers can read the working and act on it without help.',
      'How the suggestions compare with real sales, lead times, and supplier terms; the catalog is synthetic.',
      'The assumptions behind a 95% service level and quoted lead times.',
      'The export inside a real purchasing workflow; the recording shows the action but does not run it.',
    ],
  },
}

import type { ImageId } from '../media'

/**
 * Spreadsheet Agent (brief v18): a compact page. The introduction with its
 * scope, the walkthrough beside it (request, plan, generated sheet, the
 * source detail of one value; four authentic screenshots of the same build,
 * captured 2026-09-25 from spreadsheetagent.netlify.app with a request its
 * plan answers exactly), and three short decisions.
 *
 * Facts: the plan for “Create a sheet of B2B products with vendor, cost,
 * retail price, and margin” lists the Northwind product catalog (1,200
 * synthetic records), no filters, SKU, Product Name, Vendor, Cost, Retail
 * Price and Margin Percent, sorted by product name; the built sheet has 1,200
 * rows and six columns; selecting Atlas Goods (C3) and opening Detail shows
 * the field, dataset, record, definition and why the column was chosen. The
 * responses come from rules (a deterministic rule engine), not a model. The
 * earlier recording (a comparison request its plan did not answer) is not
 * shown.
 */
export const SHEET = {
  title: 'Spreadsheet Agent',
  meta: ['Independent project', 'Product design and build', '2026'],
  lede: (
    <p>
      I built a prototype spreadsheet agent that turns a written request into a structured, editable sheet. It adds matching rows from a product catalog and
      shows a plan to review before it builds anything.
    </p>
  ),
  status: 'Working prototype, synthetic catalog. Its responses come from rules, not a live model.',
  request: 'Create a sheet of B2B products with vendor, cost, retail price, and margin.',
  stages: [
    { label: 'Request', image: 'sa-stage-request' as ImageId, caption: 'The request is written in plain language in the assistant panel.' },
    { label: 'Plan', image: 'sa-stage-plan' as ImageId, caption: 'The plan names the source, filters, six columns, and sort, and waits for review.' },
    { label: 'Sheet', image: 'sa-stage-sheet' as ImageId, caption: 'Building fills 1,200 rows and six columns, and the reply confirms what was built.' },
    { label: 'Source detail', image: 'sa-stage-detail' as ImageId, caption: 'Selecting a value opens the catalog field and record behind it.' },
  ],
  decisions: [
    {
      title: 'Review the plan first',
      text: 'A written request can be read more than one way, so the agent shows the source, columns, filters, and sort before building, and lists any words it could not use.',
    },
    {
      title: 'Keep values traceable',
      text: 'Any cell opens the dataset, record, and field behind it, with the reason its column was included.',
    },
    {
      title: 'Rules instead of a model',
      text: 'Rules are predictable and easy to inspect but narrow. A request outside their vocabulary is flagged in the plan rather than guessed.',
    },
  ],
}

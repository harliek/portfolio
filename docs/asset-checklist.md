# Private asset checklist

Not published: this file lives in the repository only. It lists artwork corrections and assets Harlie should supply, so the public pages never carry large placeholders.

## 1. Embedded wording in the carousel PNGs (`final png tiles/`)

The PNGs are flattened artwork: their text cannot be edited from any source in this repository, so **none of the embedded wording below has been changed**. The site uses the files as supplied and gives every link its accurate name in live HTML. Replace the artwork with the corrected wording when convenient; keep the same filename, canvas and transparent background so the pipeline (`node scripts/prepare-media.mjs objects`) picks it up.

| File | Embedded text now | Issue | Replacement wording |
|---|---|---|---|
| `cafepress uk.png` (mug) | "CafePress UK Launch" / "UK market research and storefront prototyping" | No launch is documented; the work is research and a storefront prototype for a potential launch. | Title: **CafePress UK**. Subtitle: **UK market research and storefront prototyping** (unchanged). |
| `spreadsheet agent.png` (laptop) | "Spreadsheet Agent" / "Built an agent that retrieves data and generates spreadsheets" | The case study describes simulated AI responses and no live data retrieval. | Subtitle: **Prototyped a spreadsheet assistant with a reviewable build plan** |
| `merch dash.png` (monitor) | "Merchandising Platform" / "Prototyped a centralized internal tool connecting product data, inventory, and workflows for merchandising team." The screen shows a different catalog scale and an AI Assistant panel. | "Internal tool ... for merchandising team" reads as an employer system; the page presents an independent prototype with synthetic data. The screen is concept artwork, not the implemented application. | Subtitle: **Independent prototype for catalog and replenishment decisions**. Optionally replace the screen with a frame from the real recording. |
| `ai leasing.png` (tablet) | "THE BERKELEY GROUP" branding, "AI Leasing Agent" / "Defined workflow and development requirements for an AI agent" | The case study names Valiance Capital. The Berkeley Group's relationship to Valiance is not documented (its logo sits in the Valiance Capital folder). | Confirm the relationship. If it is not Valiance's own brand, replace the branding with a neutral property name or remove it. |
| `jumpstart.png` (phone) | "Student Founder of Fintech Venture" / "CEO of gamified financial education platform concept and prototype" | The site uses the résumé title Founder and Product Lead consistently. | Title: **Jumpstart Finance**. Subtitle: **Founder and Product Lead of a financial education concept and prototype** |
| `creative production.png` (camera) | "Film & Campaign Work" / "Creative strategy, production, and client support at Shift Content" | The page and navigation are named Creative Production. | Title: **Creative Production** (subtitle can stay). |
| `about me.png` (headshot) | No embedded title | Needs a visible label; the site adds the live text label "About me". | None needed. |

## 2. Assets to supply

(Filled in from the build agents' reports at the end of this revision.)

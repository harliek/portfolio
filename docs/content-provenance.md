# Content provenance

This file traces every public factual claim on the site to its source, lists claims that were deliberately left out, and records open questions for Harlie. The public copy is the exact copy from the page briefs (`src/content/projects.ts` plus the page components). Media are covered in [`asset-audit.md`](asset-audit.md) and [`media-plan.md`](media-plan.md). Reviewed 2026-09-24. Rows from earlier builds that the current site no longer follows are marked **Superseded** and point to the [revision section](#revision-six-projects), which records the current decisions.

## Source hierarchy

When sources disagree, the higher-ranked source wins, and the disagreement is recorded here.

| Code | Source | Files used |
|---|---|---|
| **S1** | Build brief and user instructions | Session page briefs (common, home/about, per-project) |
| **S2** | Project evidence and assets | `PlanetArt/planetart presentation.pdf` (17 pp., dated 08/20/2026), `PlanetArt/cafepress uk/uk web.png`, both screen recordings, `JumpStart Finance/jumpstart presentation.pdf.pdf` (12 pp.), Jumpstart PNGs, `Valiance Capital/messages.png`, the three Shift films and three photos, `Shift Content/Film case studies.pdf`, `Shift Content/shift content deck.pdf` |
| **S3** | Résumé and personal materials | `personal assets/Harlie Katz Resume PDF copy.pdf`; `Shift Content/Shift journals.pdf` (weekly journals plus a “Data 197 Report” dated 17 May 2026); headshot |
| **S4** | `DESIGN_RULES.md` | No factual claims; layout and motion rules only |
| **S5** | Research PDFs (`design:portfolio rules/*.pdf`) | No factual claims used |
| **S6** | Old portfolio (`~/Desktop/old portfolio copy`) | Drawing image files only |
| **S7** | External sites | Not consulted. No URL was opened or verified. |

**Status terms.**
- *Supported*: an S2 or S3 document says it.
- *S1 only*: rests on Harlie's instruction alone; no file in the project folder says it.
- *Interpretive*: an explanatory framing consistent with the sources.
- *Qualified*: published only with a stated limit.
- *Not supported*: the cited source does not show it (listed in [Findings](#findings)).

PDF page numbers below are PDF pages, not printed slide numbers.

---

<a id="site"></a>

## Site-wide and homepage

| Public claim | Where | Source | Status |
|---|---|---|---|
| Name “Harlie Katz” | Header, homepage H1, footer, metadata | S3 résumé | Supported |
| “AI product, strategy & operations.” | (formerly homepage, page titles, social image) | S1 | **Superseded** (see [Revision](#revision-six-projects)). The homepage shows “Harlie Katz”, “Portfolio” and “Selected work in applied AI, product development, and creative production.” (latest brief); the social image was re-rendered with the same text. |
| “Portfolio of Harlie Katz: merchandising research…” | (former meta description) | S1 | **Superseded** (see [Revision](#revision-six-projects)). |
| “Selected work in AI product definition, product operations, prototyping, and creative production.” | (former `og:description`) | S1 | **Superseded** (see [Revision](#revision-six-projects)). |
| `harliekatz@berkeley.edu` | Contact block, footer, About, `<noscript>` | S3 résumé | Supported |
| LinkedIn `https://www.linkedin.com/in/harliekatz/` | Contact block, footer, About | S3 résumé (“linkedin.com/in/harliekatz”) | Supported. The URL was not opened. |
| Résumé download | Footer (every page), About, `<noscript>` | S3 file, as a portfolio copy (`scripts/portfolio-resume.py`) | The copy removes only the phone number and “, reducing response time by 95%”. Other résumé wording the site does not use is still in it (**Q1**). |
| No phone number, no GitHub | Whole UI and the résumé download | S1 | Holds. The portfolio copy of the résumé has no phone number and no telephone link. |
| Project cards: title, organization, year, summary | Homepage rail, “All projects”, next-project links | S1 via `projects.ts` | Per-project rows below |

---

<a id="planetart"></a>

## PlanetArt / CafePress

| Public claim | Source | Status |
|---|---|---|
| Organization “PlanetArt / CafePress” | S2 deck p. 1 (“PlanetArt / CafePress B2B”); S3 résumé | Supported |
| Role “Product Operations & Merchandising Intern” | S3 résumé | Supported. The deck title slide says “CPB Merchandising Intern” (Q8). |
| “Jun–Aug 2026”; card year “2026” | S3 résumé; S2 deck dated 08/20/2026 | Supported |
| Context “B2B e-commerce” | S3 (“Global B2B E-Commerce”); S2 (“CafePress UK B2B Launch”) | Supported |
| Status “Research and prototypes” | S1; S2 deck pp. 2, 8, 11–12 | Supported |
| Summary “UK market research, a localized storefront prototype, and a concept for organizing merchandising information.” The card variant ends “…a centralized merchandising concept.” | S2 deck pp. 3–12 | Supported |
| Hero caption “CafePress UK website prototype created during the internship.” | S2 deck p. 8 “UK Site Prototype Exploration” shows the same storefront; `uk web.png` | Supported (the PNG itself is undated) |
| “I researched competitors, suppliers, product categories, and the changes needed to adapt CafePress’s existing offer for a UK audience.” | S2 deck pp. 3–7; S3 résumé | Supported |
| “The work connected market research with practical merchandising and website decisions.” | S2 deck pp. 2, 8–9 | Interpretive |
| Group caption “Research from the internship presentation, covering the competitive landscape and potential UK suppliers.” | S2 deck pp. 4–5 (PF Concept, Ralawise) | Supported |
| “Use the existing foundation — Adapt the existing US approach rather than define an unrelated storefront.” | S2 deck p. 9 rec. 1; p. 5 takeaway | Supported |
| “Localize the details — Account for UK language, GBP pricing, and relevant assortment choices.” | S2 deck p. 7 (language shifts, GBP), p. 9 rec. 2 | Supported |
| “Check operational readiness — Connect the proposed offer to available vendors and product information.” | S2 deck p. 3 (area 4), p. 9 rec. 3 | Supported |
| “I translated the research into a UK website prototype…” (Chapter 2) | S2 deck p. 8 | Supported |
| “Prototype view. This shows a proposed experience, not evidence of a completed UK launch.” | S1 | Qualified. No launch evidence exists in the materials. |
| “Product, vendor, inventory, and promotional information was spread across spreadsheets and other tools. Repeated lookups and disconnected information…” | S2 deck p. 10 (“highly manual and often repeated across spreadsheets and systems”; “fragmented across multiple disconnected tools”), p. 11 (problem statement) | Supported |
| Diagram: Vendors / Products / Inventory / Promotions / Sales information → Centralized merchandising view → Review and decisions. Caption: “Retrospective explanation… not a deployed-system architecture.” | S2 deck p. 12 concept features; S1 | Supported as a retrospective explanation |
| “I developed an early prototype to bring these information needs into one place and make the idea easier to discuss with engineering.” | S2 deck pp. 11–12; S3 résumé (“Prototyped a centralized merchandising platform … for engineering”) | Supported |
| “The concept focused on a shared merchandising view and possible support for alerts and recommendations.” | S2 deck p. 12 (unified data, inventory alerts, recommendations) | Supported. The deck's LLM wording is omitted (see Not published). |
| “Original concept from the internship presentation. Proposed capabilities are not evidence of production deployment.” | S2 deck pp. 11–12; S1 | Supported |
| “Later independent work”; “After the internship, I revisited the workflow as an independent Merch Console prototype.” | S1. S2 recording: in-app footer “Portfolio project. Synthetic catalog, no backend, nothing leaves your browser.”; overview “Figures cover the trailing 28 days to 2026-09-01”; file created 2026-09-23. | Supported |
| “The recording shows a catalog, vendor information, promotion views, and an assistant-style interface in a synthetic demo environment.” | S2 recording (Catalog, Vendors, Promotions and Ask views; “240 SKUs · demo data”) | Supported. The Ask view itself says “There is no language model involved.” |
| “Independent reconstruction. Synthetic data. Not PlanetArt’s internal production system.” | S1; S2 footer | Supported |
| Video and still captions | S2 | Supported |
| “The internship produced UK research and recommendations, a storefront prototype, and an early merchandising-platform concept. The later rebuild … does not establish a production rollout or measured business impact.” | S2; S1 | Supported |
| (Optional) “The main product decision was to connect market recommendations to the information and workflows needed to support them.” | S1, drawing on deck p. 9 rec. 3 | Interpretive |

<a id="valiance"></a>

## Valiance Capital

The only Valiance files are two logos and one synthetic illustration. No document in the project folder describes the assistant, the requirements, the testing or the rollout. Claims below therefore rest on S1 and the résumé.

| Public claim | Source | Status |
|---|---|---|
| Organization, “Leasing & Operations Associate”, “Oct 2024–Jun 2025”; card year “2024–2025” | S3 résumé | Supported |
| Context “Residential leasing” | S1. S3 mentions a “tenant portfolio” and “leasing operations”, not “residential”. | Inferred |
| Scope / status “Product definition and workflow testing” | S1 | S1 only |
| Summary “Translating frontline leasing work into requirements, boundaries, and testing for an AI assistant.” The card variant reads “Frontline leasing workflows translated into…”. | S1; S3 (“Defined development requirements for AI leasing agent”) | Requirements: supported. Testing: S1 only. |
| “I proposed the opportunity and helped define and test the workflows. The production assistant was provided by a third-party platform.” | S1 | S1 only. The résumé mentions no proposal, testing or third-party platform, and no material names the platform. |
| Hero diagram and caption “A summary of the response boundaries explored in the leasing workflow.” | S1 | Retrospective diagram made for this portfolio |
| “Working in leasing gave me direct exposure to recurring questions, property-specific information, and situations that needed staff judgment. I proposed an AI assistant around those workflows, then translated them into requirements and test scenarios.” | S3 (role); S1 | Role: supported. Proposal and test scenarios: S1 only. |
| Recurring request types (four rows) | S1 | Illustrative categories; no frequencies |
| “Separate information from decisions” copy, routing diagram, caption “Retrospective workflow explanation… not a diagram of the third-party platform’s internal architecture.” | S1 | Retrospective. No requirements document is supplied. |
| “Requirements covered current-data needs, policy limits, approval boundaries, and human escalation.” | S1 | S1 only |
| `valiance-messages` with “Illustrative leasing scenario. Synthetic conversation; not a production screenshot.” | S2 (synthetic image; its own footer reads “Reconstruction · Invented data”) | Qualified |
| Rows: Current information / Approval boundaries / Human handoff | S1 | Principles |
| “I tested workflows against the requirements, including situations involving changing information, policy boundaries, and escalation.” | S1 | S1 only |
| “The available materials support that testing role; they do not provide a complete test log or an independently measured accuracy rate.” | S1 | **First clause not supported by files** (see [Findings](#findings)). The second clause is accurate. |
| Matrix “Illustrative checks derived from the requirements” | S1 | Illustrative; no pass marks or counts |
| “Adopted across 18 properties” / “The assistant was later adopted across 18 properties.” | S1 (direct user instruction); S3 résumé (“adopted across 18 properties”) | Supported by S1 and S3. There is no rollout document and no adoption date. |
| “My contribution was the opportunity proposal, workflow translation, requirements, and testing—not engineering the third-party production platform.” | S1; S3 (requirements) | Mixed: S3 supports requirements; the rest is S1 only |
| “The available materials do not establish a separately verified response-time or conversion improvement.” | S1 | Accurate |

<a id="spreadsheet-agent"></a>

## Spreadsheet Agent

| Public claim | Source | Status |
|---|---|---|
| “Independent prototype”, role “Independent project”, “2026” | S1; S3 résumé (“Independent”; dated “2026 - Present”); S2 recording created 2026-09-23 | Supported. Independence rests on S1 (see Q3). |
| Focus “Interaction and workflow prototyping” | S1 | S1 only |
| Status “Simulated AI responses”; card summary “A prompt-to-spreadsheet interaction prototype with simulated AI responses.” | S1; S2 build plan (“Not used: compare, across. These words did not map to a field or filter”) | Supported |
| Summary “A prompt-to-spreadsheet interaction prototype for turning a request into an editable sheet.” | S1; S2 | Supported. The sheet UI has editing controls, but no edit is shown. |
| “The demonstrated prototype did not have a live LLM/API connection.” | S1; consistent with S2 | Supported |
| Hero caption “A recorded prototype state using demo data.” | S2 (“Northwind product catalog · 1,200 synthetic records”) | Supported |
| “…start with a request, review the resulting spreadsheet, **make changes**, and return to the sheet list. The recording demonstrates that interaction sequence.” | S1; S2 | **“Make changes” not shown** (see [Findings](#findings)) |
| Video caption “Recorded walkthrough. The AI response is simulated…” | S1 | Supported |
| Step 1 “Describe the task — Enter a request such as comparing vendor prices across products.” (12.9 s) | S2 | Supported |
| Step 2 “Review the sheet — Move from the request into a structured spreadsheet view.” (25.3 s) | S2 | Supported |
| Step 3 “Continue working — **Edit the sheet** and return to the collection of sheets.” (35.5 s) | S2 | The return to the list is supported. No edit is shown. |
| Demonstrated: “Prompt-entry interface”; “A simulated request-to-sheet sequence”; “Spreadsheet views and **visible edits**”; “Navigation between sheets” | S2 | The first two are supported. Views are supported, but no edits are visible. Navigation goes from a sheet to the All Sheets list; opening a second sheet is not shown. |
| Not demonstrated (four items) | S1 | Accurate |
| “What a live version would need…” and the future outline | S1 | Labeled as proposed future work |
| Ending “…the clarity of what was simulated.” | S1 | Interpretive |

<a id="jumpstart"></a>

## Jumpstart Finance

| Public claim | Source | Status |
|---|---|---|
| “Jumpstart Finance” | S3 résumé. The pitch and folder spell it “JumpStart”. | Supported; the site uses the résumé capitalization |
| Role “Founder & Product Lead” | S3 résumé | Supported. The pitch p. 2 lists Harlie as “CEO”; the site uses the résumé title per S1. |
| “Jun–Jul 2024”; card year “2024” | S3 résumé | Supported (pitch PDF metadata: created 2024-08-01) |
| Program “European Innovation Academy, Porto” | S3 résumé | Supported by S3 only. The pitch never names the program, though its Instagram link reads “jumpstarteia.webflow.io”. |
| Status “Venture concept and prototype” | S1; S2 | Supported |
| “A student venture exploring financial education through a mobile product, built with a five-person international team.” | S3 (“5-person international team”); S2 pitch p. 2 (five members, flags of three countries) | Supported |
| Card “A student venture combining financial education, product prototyping, and business-model exploration.” | S2 pitch | Supported |
| Hero caption “Prototype screens developed for the student venture.” | S2 (screens also on pitch pp. 5–6) | Supported |
| “Jumpstart explored a mobile approach to financial education. I worked with the team on the product concept, positioning, prototype, and business model during the European Innovation Academy program.” | S2 pitch; S3 | Supported |
| Competitor caption “…a record of the team’s positioning assumptions at the time.” | S2 pitch p. 4 | Supported |
| “The comparison helped frame a product combining structured learning, visible progression, and a community component.” | S2 pitch pp. 4–6 (gamified learning, personalized education, forums) | Interpretive |
| “The prototype organized financial learning into a visible path, with short lessons and a community space alongside individual progress.” plus the four phone captions | S2 prototype screens | Supported |
| “The pitch proposed free access alongside paid options… not evidence of paying customers or revenue.” plus the caption | S2 pitch p. 7 | Supported |
| “150 sign-ups in 24 hours” / “Reported in the program pitch.” | S2 pitch p. 10 “Traction & Validation”; S3 résumé | Qualified. The pitch does not say what people signed up for or how the sign-ups were counted. The same slide's Instagram screenshot (35 followers) measures something else and neither confirms nor contradicts the figure. |
| “That response was an early interest signal… It did not establish retention, revenue, or product-market fit.” | S1 | Conservative framing |
| Ending “…My role was to help turn those parts into a coherent product direction with the team.” | S1; S3 | Supported |

<a id="shift"></a>

## Shift Content

| Public claim | Source | Status |
|---|---|---|
| “Shift Content” | S3 résumé; S2 agency deck | Supported |
| Role “Creative Strategy & Client Solutions Intern” | S3 résumé | Supported by the résumé. Harlie's own course report calls the role “Creative Production Intern” (and “Creation Production Intern” in its header) (Q10). |
| “Jan–May 2026”; card year “2026” | S3 résumé; report (“Spring 2026”, “four months”, dated 17 May 2026) | Supported |
| Location “London” | S3 résumé and report; S2 deck (“London-based”) | Supported |
| Context “Agency production” | S1; S3 | Supported |
| Ownership note “These are agency films… I am not claiming sole authorship of the finished films.” | S1 | Conservative framing |
| Summary “Fashion, interview, and event films supported through agency production work.” | S2 (three films); S3 | Supported |
| Aristocracy: “Fashion campaign”; “A fashion campaign combining film and still imagery.” | S2 Film case studies (“fashion campaign”; “campaign video, e-commerce imagery, and social assets”); supplied film and photos | Supported |
| “I supported production through setup, lighting, coordination, and behind-the-scenes work.” | S3 report (“helped with the setup, lighting, coordinating and behind-the-scenes documentation”); journal | Supported |
| Aristocracy captions: film, and photo group “Selected campaign imagery from the supplied project materials.” | S1; S2 | Supported. The photographer is unknown and not claimed. |
| Nickleby: “Interview-led client content”; “An interview-led project for an investment firm.” | S2 film (interviews, “nickleby capital” logo) and Film case studies; S3 journal (“filming interviews for an investment firm”) | Supported. The journal does not name the firm, so linking it to Nickleby is an inference. The report says “venture capitalist firm”. |
| “My production support included equipment and lighting setup and interview B-roll.” | S3 journal | Supported for that shoot. Whether Harlie's B-roll appears in this cut is unknown. |
| “One film from the supplied Nickleby Capital project materials.” | S2 | Accurate. The site does not say which deliverable this is. |
| HECK: “Event film”; “An event edit from the supplied Shift materials, with running, community, and HECK branding.” | S2 film (Night Club × Gymshark banners, Gymshark storefront, HECK packaging and end card) | Supported by what is visible |
| “I supported the agency’s production work around the event.” | S3 report (“a branded Run Club event”, “live event coverage”) | Supported, but the link to this particular film is inferred. No S3 document names The Night Club, Gymshark or HECK. |
| HECK caption “…The title follows the project context and branding visible in the supplied materials.” | S1; S2 (Film case studies names “The Night Club Global Tour” with Gymshark; HECK is not mentioned) | Qualified. The commissioning relationship is unknown. |
| “I also worked on pitch decks, Google Ads campaigns, and CSS changes to the agency’s Squarespace website.” | S3 journals (pitch decks; Google Ads; Squarespace layout and code) and report (“edit its CSS”) | Supported |
| Ending “The films show the visual output of the agency projects. My role sat within the production and client-work process…” | S1 | Conservative framing |

<a id="about"></a>

## About

| Public claim | Source | Status |
|---|---|---|
| “I studied Cognitive Science at UC Berkeley…”, “My work has included…”, “Across these projects…”, “I’m interested in early-career roles…” (earlier About copy) | S1; S3 | **Superseded** (see [Revision](#revision-six-projects)). About now uses the latest brief's biography verbatim. |
| “University of California, Berkeley”; “B.A. Cognitive Science · Minor in Data Science”; “Aug 2023–May 2026”; “Certificate in Entrepreneurship & Technology, Sutardja Center”; “Completed in three years.” | S3 résumé (“Completed in 3 years”) | Supported. GPA omitted per S1. |
| Experience: PlanetArt (Jun–Aug 2026), Shift Content (Jan–May 2026), Artesian Network, “Enterprise AI Research Associate” (Jun 2025–Jan 2026), Valiance Capital (Oct 2024–Jun 2025), Jumpstart Finance (Jun–Jul 2024) | S3 résumé | Supported. The résumé names “The Artesian Network”. |
| “A small selection of personal drawing work.”; captions “Portrait study.” ×2, “Hand study.” | S1; images from S6 | **Superseded** (see [Revision](#revision-six-projects)). About now has the “My art portfolio” link with a small composition of drawings; /art uses Harlie's own titles. |
| Portrait, alt “Harlie Katz.” | S3 | Supported |
| Contact copy and links | S1; S3 | Supported. About no longer repeats a contact row: the site footer (email, LinkedIn, Download resume) directly follows the film section. |

---

<a id="not-published"></a>

## Claims deliberately not published

| Project | Claim (source) | Reason |
|---|---|---|
| PlanetArt | Title “CPB Merchandising Intern” (deck p. 1) | Site uses the résumé title, per S1 |
| PlanetArt | Exchange rates “$1.00 = £0.73; £1.00 = $1.36” and “London avg. high ~59°F” (deck p. 7) | Dated figures; not to be shown as current facts |
| PlanetArt | Prototype built “using large language model capabilities”; “AI agent support: generate spreadsheets” (deck pp. 11–12) | Not shown working in any material; not presented as implemented |
| PlanetArt | Internal and external AI opportunities and AI implementation recommendations (deck pp. 13–15) | Proposals, not delivered work |
| PlanetArt | “Led UK pricing, competitor, and vendor research to shape CafePress’s launch strategy”; “Analyzed product, vendor, inventory, competitor, and website data…” (résumé) | “Led” and the effect on launch strategy have no evidence beyond the résumé. The site says “I researched”. |
| PlanetArt | Merch Console figures (“240 SKUs”, net revenue, alert counts) | Synthetic demo data, not employer impact |
| PlanetArt | Any UK launch or rollout | No evidence |
| Valiance | “reducing response time by 95%” (résumé) | No measurement method or evidence; never publish |
| Valiance | “Managed CRM and leasing operations for a 1,000+ tenant portfolio, tracking occupancy, pricing, and conversion” (résumé) | Not needed and not evidenced |
| Valiance | Third-party platform name | Not stated in any material |
| Spreadsheet Agent | “Built a spreadsheet AI agent that retrieves data and generates, structures, and populates editable sheets through chat” (résumé) | The recording shows a simulated response and no data retrieval |
| Spreadsheet Agent | Résumé project name “AI Spreadsheet Workspace” and URL `spreadsheetagent.netlify.app` | Site uses the in-app name. The URL was not verified and is not linked (Q2). |
| Spreadsheet Agent | CSV export (button visible in stills) | Never used in the recording |
| Jumpstart | “CEO” (pitch p. 2) | Site uses the résumé title |
| Jumpstart | Team names, photos and nationality flags (pitch p. 2) | Privacy; not needed |
| Jumpstart | “77% of American adults report feeling anxious about their financial situation.” (pitch p. 3, credited on the slide to “Capital One, 2024”) | The underlying source was not verified |
| Jumpstart | TAM/SAM/SOM ($10B / $1B / $50M, pitch p. 8) | Market-size projection |
| Jumpstart | Three-month milestones (pitch p. 9) | Roadmap, not results |
| Jumpstart | Funding ask (four budget lines totalling $19,000, pitch p. 11) | Excluded per S1 |
| Jumpstart | “Encouraging customer interviews” (pitch p. 10); “customer discovery” and “user research” (résumé) | No counts or evidence |
| Jumpstart | “Led a 5-person international team … driving 150 sign-ups” (résumé) | The causal link to Harlie is not published; the figure appears only with its qualification |
| Shift | “Managed clients for film and marketing content, leading projects from brief through production and final delivery.” (résumé) | The materials show a support role |
| Shift | “Increased qualified inquiries by rebuilding paid search and landing pages across 100+ keywords and 6 client domains.” (résumé) | No evidence |
| Shift | “Built six Google Ads campaigns”; “Google Ads Search Certification” (journals) | **Superseded** (see [Revision](#revision-six-projects)). Client Work now lists both under Other agency work (latest brief: “other agency work … when supported by the source”). |
| Shift | LinkedIn posts for the founder, editing footage in Premiere Pro, a voiceover script, BTS content, asset organization (journals and report) | **Superseded** (see [Revision](#revision-six-projects)). LinkedIn posts and “Edited B-roll into sequences in Premiere Pro” are now listed under Other agency work. Editing is still not claimed for the three published films. The voiceover script and asset organization remain unpublished. |
| Shift | Nickleby's “five testimonials, nine FAQ responses, and a 60 second social mashup” and its “game show format”; Aristocracy's “over two days”, “Spring/Summer campaign” and “Manchester store launch” (Film case studies) | **Superseded** (see [Revision](#revision-six-projects)). These now appear as each film's client context and deliverable (the agency's descriptions, stated as the deliverable, not as Harlie's output). The “game show format” is still not used. |
| Shift | Nickleby Capital Video 2 | Editorial choice: one film per client |
| Shift | Director, camera, editor or photographer credits | Unknown |
| Shift | Agency deck client list and case study (`shift content deck.pdf`) | Agency claims unrelated to Harlie's work |
| About | GPA 3.7; coursework; skills lists; location “San Francisco, CA”; phone number; `harliekatz.netlify.app` (résumé) | Omitted per S1 (phone never in the UI) |
| About | “Produced 4 executive white papers…”; “Evaluated LLM, RAG, and agent platforms…” (résumé, Artesian); `Olympus.io Projects.pdf` | Not one of the published projects; no evidence reviewed for public use |
| About | Old-portfolio titles and series (“A Life, Beautifully Worn”, “Time Unspoken”, “The Inevitable”; series “The Art of Aging”); film-festival awards and a magazine credit attached to other works | **Superseded** (see [Revision](#revision-six-projects)). /art now shows all 23 drawings in Harlie's four series with her own titles (latest brief: preserve the available work). Awards and the magazine credit are still not shown. |

## Naming decisions

| Item | Variants in sources | Site uses | Basis |
|---|---|---|---|
| Nickleby | Logo “nickleby capital”; video title card “NICKELBY PRESENTS”; Film case studies “NICKELBY CAPTIAL” / “Nickelby” | “Nickleby Capital” | Logo in the film; S1 |
| Jumpstart | “JumpStart” (pitch, folder); “Jumpstart Finance” (résumé) | “Jumpstart Finance” | S3; S1 |
| Jumpstart role | “CEO” (pitch); “Founder & Product Lead” (résumé) | Founder & Product Lead | S1, per the brief |
| PlanetArt role | “CPB Merchandising Intern” (deck); “Product Operations & Merchandising Intern” (résumé) | Résumé title | S1, per the brief |
| Shift role | “Creative Strategy & Client Solutions Intern” (résumé); “Creative Production Intern” (report) | Résumé title | S1, per the brief |
| Artesian | “The Artesian Network” (résumé) | “Artesian Network” | S1 (minor) |
| Aristocracy film | On-screen title “The Theatre of the Train Journey”; brand “Aristocracy London” | “Aristocracy” | S1 |
| Competitor | “Acorn” (pitch slide; the company is usually styled “Acorns”) | “Acorn” in alt text, matching the artifact | Artifact wording |

---

<a id="findings"></a>

## Findings: site copy the sources do not fully support

1. **Spreadsheet Agent “make changes” / “Edit the sheet” / “visible edits”.** The recording shows no edit to any cell. This was checked at 2 fps from 24 to 34 s and across the whole file at 2.5 s intervals; cell A2 stays “B2B-1596” throughout. After the build, the only interactions are scrolling, returning to All Sheets, and starring the new sheet. The brief's exact copy was kept, and the decision on it is left open (Q4).
2. **Valiance “The available materials support that testing role.”** No file in the project folder mentions testing. The résumé says only “Defined development requirements”. The testing role, the proposal and the third-party platform all rest on Harlie's instruction (S1).
3. **The résumé download** now serves a portfolio copy without the phone number and the response-time claim. Other résumé lines the site does not use remain (Q1).

---

<a id="editorial"></a>

## Build-time editorial decisions

| Decision | Reason |
|---|---|
| Shift hero caption is “Still from the Aristocracy campaign film.” rather than the manifest caption | The automatic “Agency work” provenance label already carries the agency context. Repeating “Agency” in the caption read awkwardly. |
| Valiance diagram adds structural labels (“How a leasing question is routed”, Yes/No/Then, “Continue to question 2”, “All answer routes end with”) and the list label “Recurring request types” | The brief requires every diagram to have a visible title. The labels make no factual claims. |
| The Spreadsheet Agent step text keeps the brief's exact copy (“make changes”, “Edit the sheet”, “visible edits”) | The brief is the highest authority and describes the 31.4s frame as the “edited sheet”. The frames show scrolling, row hover and starring but no visible cell edit (see Findings 1 and Q4). |
| About drawings hide the “Personal work” provenance label on the page. The enlargement dialog still shows it. | The section intro already says the drawings are personal work. |
| Transcripts follow the burned-in subtitles wherever subtitles and speech recognition disagree. Points where they disagree: Nickleby “in/at Cardiff”; Aristocracy “will/wind”; the Seat Unique title “CEO & Co-founder” (on-screen caption) vs “CEO and founder” (spoken); one inaudible HECK word. | See `docs/transcripts.md`. No one has listened to the soundtracks; a single listening pass by Harlie is recommended. |
| Screen recordings end at 56.3s and 36.4s | The macOS screen-capture toolbar appears in the final ~1s of both recordings. |
| Posters do not repeat hero frames. Spreadsheet Agent uses its 1.5s opening sheet list; Aristocracy uses 30.5s. | The hero, poster and step still previously showed the same frame. |

---

<a id="working-model"></a>

## Working Model redesign: evidence decisions

| Decision | Reason |
|---|---|
| The homepage stage and case heroes use only real project media from `src/content/media.ts` (screens, PDF excerpts, recorded frames, film stills, and a 6s muted crop of the Aristocracy film). | The redesign brief says to use actual project imagery, not invented imagery or interfaces, and not fake numbers or generated labels. |
| **Not used:** `inspiration/working-model-assets/tiles-v3-concept/*` (the asset pack's own README calls them fictional concept artwork), `tiles-v2/*` (AI-restyled covers with re-rendered text and figures), and `planetart tile final.jpeg`. | The last file is a 1344×768 image with invented vendor names (for example “Bromothvill.com”, “Khausake”) and invented stock statuses. It reads as generated, not project evidence. It stays in `inspiration/` untouched. |
| **Not used as project imagery:** `direction-reference.png`, `stage-desktop.png`, `stage-mobile.png`, `tile-back.png`. | The reference is an AI mockup with invented interfaces, used for atmosphere only. The homepage room is the supplied background video with frame-0 posters. |
| The background video is decorative, muted, looping, has a visible pause control, and is not loaded under reduced motion. | It is a room, not content. Its audio track was removed. |
| Positioning line: “Turning complex ideas into clear product systems.”, with “AI product · strategy · operations” as the secondary line. | This is a refinement of the brief's suggested “Product designer building clear systems from complex ideas.” It keeps the brief's idea without claiming a “product designer” job title, which would conflict with the About page and the target roles. **Harlie may prefer the original wording (Q13).** |
| **Superseded:** Merch Console is now labelled “Independent prototype · Synthetic data” wherever it appears (see the final revision table). Earlier builds said “independent rebuild”. | The recording's Ask screen itself states: “There is no language model involved.” This supports the no-live-AI boundary. |
| Relationship-diagram labels Assortment, Pricing, Inventory, Vendors → Product decisions. | Supplied by the brief. Each is grounded in the internship deck (assortment and vendor research, GBP pricing and localization, inventory and operational readiness). |

## Additional audit notes

- **PlanetArt H1 “Merchandising & UK launch”.** **Superseded** (see [Revision](#revision-six-projects)): the page is now “CafePress UK”, and no page or caption says “UK launch”.
- **`valiance-messages`** shows “Typically replies in a few minutes” inside the synthetic illustration. It is part of the invented scenario, not a response-time claim, and the image is labelled illustrative and synthetic at every use.
- **Spreadsheet Agent “Navigation between sheets”** (brief copy). The recording shows only a return from a sheet to the All Sheets list.

---

<a id="presentation-frame"></a>

## Presentation-frame redesign: copy decisions (latest brief)

| Item | Decision | Basis |
|---|---|---|
| Positioning line | “Product designer building clear systems from complex ideas.” | Harlie specified this wording in two consecutive briefs. This replaces the lead's earlier refinement and resolves Q13. |
| Project index years | Valiance **2024–2025** and Shift **2026**. The brief listed 2026 and 2023. | The résumé and case evidence give Oct 2024–Jun 2025 and Jan–May 2026. The brief's figures read as placeholders. |
| Case pages | Each page is now at most five scenes, using the brief's copy. Earlier long chapters are removed from the pages; the facts they established are kept in this document. | Latest brief. |
| PlanetArt opening, “A localized storefront and merchandising system…” | Kept (client copy). The opening also shows the status (“Research and prototypes”), and the Merch Console is labelled an independent rebuild with synthetic data wherever it appears. | No production system is claimed. |
| PlanetArt decision, “Make the boundaries visible before adding more automation.” | Kept (client copy). | Consistent with the deck's AI implementation recommendations: “build structure around AI before continuing to expand disconnected tools”. |
| PlanetArt before/after | Before: the product spreadsheet embedded in the deck (681×217, `planetart-concept-table`). After: the original concept dashboard (808×514). | Both are original internship artifacts. |
| Valiance opening, “…find the right information and handoff faster.” | Kept as a statement of purpose. The result scene states only adoption across 18 properties, plus the ownership line. No response-time figure appears anywhere. | The 95% claim remains excluded. |
| Spreadsheet Agent, “The assistant reduces setup work while keeping the result inspectable.” | Kept (client copy). The opening scene states “Simulated AI responses; no live LLM/API connection.” | The recording shows a simulated response. |
| Shift, “Concept → Production → Final film” | Concept is a live-text card quoting the agency's supplied project summary, labelled as such. Production is a behind-the-scenes frame. Final film is a graded frame from the preview. | No concept artwork exists in the supplied materials. |
| About, “Currently: Product design, AI-assisted workflows, and operational tools.” | Kept (client copy, Harlie's self-description). “Previously” lists the résumé roles with their real dates. | Résumé. |

---

<a id="creative"></a>

## Art and Film pages; recruiter-critique copy (latest)

| Item | Decision | Basis |
|---|---|---|
| Film list and roles | Five own films: *An Artistic End*, *Before I Wilt*, *Alex*, *My World*, *Velvet is Her Blood* (assistant editor). Two client or production films: *First Edition* and *Relay for Life*. Roles and one-line notes are as given on Harlie's previous portfolio. | Titles, video ids and channel (“Harlie Jade Katz”) were verified through YouTube oEmbed on 2026-09-23. The roles were **not** independently verified (Q16). |
| Film years | **Superseded** (see [Revision](#revision-six-projects)). Shown as “Published on YouTube, January 2026” (the upload month, verified through oEmbed). | Production years are still unknown; upload dates are not presented as release years (Q16). |
| Awards and festival selections from the old site (All American Film Festival, Jewish Film Festival, Younger Directors’ Film Festival) and “Published in BSB Magazine” | **Not shown.** | Unverified. |
| Film descriptions | “First Edition” no longer says “the world’s first solar-electric catamaran” (the client’s claim, unverified). “Relay for Life” is described as made for a fundraising event, without a fundraising-result claim. | Conservative wording. |
| Embeds | Nothing loads from YouTube until the visitor presses play (youtube-nocookie). | Privacy and performance. |
| Drawings on /art | **Superseded** (see [Revision](#revision-six-projects)). All 23 drawings, including `sex.jpg` and `body.jpg` (only in their series on /art, never on the homepage or About), with the old site's titles. | Latest brief: “Preserve the available work and its internal navigation.” Q17 is closed. |
| Positioning | **Superseded** (see [Revision](#revision-six-projects)). No positioning line is shown; the homepage uses the latest brief's “Portfolio” and one sentence. | Latest brief: “Do not display another large positioning slogan.” |
| Project descriptions | Rewritten per the critique (for example, Spreadsheet Agent: “A prototype exploring how an AI assistant can turn an ambiguous request into an editable, inspectable spreadsheet.”). “Simulated AI” moves to the metadata and disclosure line, and stays visible on the first case scene. | Latest critique. The boundaries are unchanged. |
| Shift role line | “Production support, lighting and setup, coordination, and B-roll”. The critique suggested “visual development”, which was **not** used. | The Shift journal and the report evidence the tasks used. Nothing in the materials shows visual development. |
| Generated diagrams | All removed: the Valiance route diagrams and generated cover, the PlanetArt relationship diagrams, the Spreadsheet future outline. Labelled slots (`DiagramSlot` / `PropSlot`) mark where Harlie’s own diagrams and art-directed props will go. Empty slots render nothing on the public site. | The critique: “Do not let AI invent the logic of the case study.” |
| Valiance card | The illustrative synthetic conversation (`cover-valiance-scenario`). It shows the handoff moment, where a leasing team member takes over, and is labelled synthetic wherever shown. | The critique asks for a visible handoff moment. |

---

<a id="clearance"></a>

## Publication clearance

All media were supplied by Harlie for this portfolio. Publication rights for third-party material were **not** independently cleared.

| Material | Rights holders and people shown | Status |
|---|---|---|
| PlanetArt deck excerpts, UK storefront prototype, concept dashboard and map | PlanetArt/CafePress (employer); competitor and brand logos; storefront photography of unknown origin | Employer permission not confirmed. Dashboard figures may be internal (Q8). |
| Merch Console and Spreadsheet Agent recordings | Harlie (independent); synthetic data | Low risk; confirm no employer IP (Q3) |
| `messages.png` | Harlie; “Oski” persona (UC Berkeley mascot name); building photo | Photo origin unknown (Q7) |
| Jumpstart pitch excerpts and prototype screens | Five-person team; named competitors | Team consent not documented (Q9) |
| Aristocracy film and three photographs | Shift Content; Aristocracy London; models; unknown photographer; soundtrack | Not cleared (Q10) |
| Nickleby Capital film | Shift Content; Nickleby Capital; named interviewees; soundtrack | Not cleared (Q10) |
| The Night Club / HECK film | Shift Content; The Night Club; Gymshark; HECK; event participants; soundtrack | Not cleared; client unknown (Q10) |
| Drawings, headshot | Harlie | Own material |

---

<a id="questions"></a>

## Unresolved questions for Harlie

1. **Résumé PDF (high priority).** The public résumé (`/resume/harlie-katz-resume.pdf`, linked from About and every footer) is now a portfolio copy made by `scripts/portfolio-resume.py`. It removes exactly two things the site's standing rules exclude: the phone number (and its telephone link) and “, reducing response time by 95%” (the Valiance line now ends “adopted across 18 properties.”). The original in `personal assets/` is unchanged. Still in the copy, in Harlie's own words, and not used on the site:
   - “Led UK pricing, competitor, and vendor research to shape CafePress’s launch strategy”;
   - “Built a spreadsheet AI agent that retrieves data and generates, structures, and populates editable sheets through chat” and the `spreadsheetagent.netlify.app` link (the site says simulated AI responses, no live model connection);
   - “Increased qualified inquiries … 100+ keywords and 6 client domains”;
   - “Managed CRM and leasing operations for a 1,000+ tenant portfolio”;
   - “driving 150 sign-ups in 24 hours” and “Translated user research into …”;
   - “Managed clients … leading projects from brief through production and final delivery”;
   - GPA 3.7; “4 executive white papers”.

   Please confirm the portfolio copy, or supply a portfolio version with your preferred wording (the review suggested, for example, “Defined development requirements for an AI leasing agent adopted across 18 properties.”, “Researched UK pricing, competitors, and vendors and prototyped a localized storefront.” and “Built a spreadsheet workflow prototype with simulated AI responses.”).
2. **Spreadsheet Agent demo link.** Should `spreadsheetagent.netlify.app` ever be linked? Is the live build the same as the recording, and does it have any model or data connection?
3. **Spreadsheet Agent independence.** The recording is stored under `PlanetArt/`. The internship deck proposed “AI agent support: generate spreadsheets”, and the demo uses a B2B merchandising theme. Can you confirm it was built outside the internship and contains no PlanetArt data?
4. **Spreadsheet Agent edits.** Should the recording be replaced with one that shows an edit, or should the copy be changed (“make changes”, “Edit the sheet”, “visible edits”)?
5. **Valiance testing and proposal.** Does any document (scenarios, notes, email) support the proposal and testing role?
6. **Valiance platform and adoption.** Should the third-party platform be named? When was the assistant adopted across the 18 properties, and is that number current?
7. **Valiance illustration.** Is “Oski” the real assistant's name, or an invention? Where did the building photograph in `messages.png` come from?
8. **PlanetArt.**
   - Does PlanetArt/CafePress permit publishing the deck excerpts, the storefront prototype and the concept images?
   - Are the concept-dashboard figures ($155,930.20 net sales and others) placeholders or real internal data?
   - Is the storefront phone number (“020 3946 0018”) a placeholder, and where did the storefront photography come from?
   - Which job title do you prefer?
   - Did a UK B2B site launch? The site currently claims no launch.
9. **Jumpstart.**
   - What were the 150 sign-ups for (waitlist, app, Instagram), and how were they counted?
   - Do the teammates consent to the prototype screens being shown?
   - Should the competitor be spelled “Acorn” or “Acorns”, and the brand “JumpStart” or “Jumpstart”?
10. **Shift.**
    - Which role title is correct?
    - Do the agency and its clients (Aristocracy London, Nickleby Capital, The Night Club/Gymshark/HECK) consent to publication?
    - Who photographed the Aristocracy stills?
    - Who commissioned the HECK film?
    - Is the “investment firm” shoot in the journal the Nickleby shoot, and is your B-roll in this cut?
    - Is the “branded Run Club event” the Night Club/HECK event?
    - Is the music in all three films cleared for re-publication?
    - Are talent releases available for the people shown?
11. **About.**
    - Should the site use “Artesian Network” or “The Artesian Network”?
    - `Olympus.io Projects.pdf` sits in the Shift folder but reads as Artesian-era research. Is it misfiled, and should that work ever appear?
    - Were any drawings made from third-party reference photos?
12. **Transcripts.** The Nickleby film shows interviewee names on screen. If transcripts use those names (see `docs/transcripts.md`), confirm that is acceptable.
13. **Positioning line.** Resolved: Harlie's wording, “Product designer building clear systems from complex ideas.”, is used.
15. **Project index dates.** The latest brief listed Valiance as 2026 and Shift as 2023. The site uses 2024–2025 and 2026, matching the résumé. Confirm.
14. **`planetart tile final.jpeg`.** Was this image generated? It contains invented vendor names, so it was not used. If it is a real artifact, say where it came from.
16. **Film credits and years.** Confirm the roles for each film, taken from the previous portfolio, and give the production years to replace “Published online 2026”. Should any festival selections be shown, with a source?
17. **Art selection.** Closed: /art shows all 23 drawings with Harlie's own titles, per the latest brief.
18. **Props and diagrams.** When you have created your own diagrams and art-directed prop images, add them through the slot registry (see `docs/site-structure.md`).

<a id="revision-six-projects"></a>

## Revision: six projects and the shared case layout (latest brief)

Sources as above (S1 Harlie's instructions, S2 project files and recordings, S3 résumé and course documents). This revision supersedes the scene copy of the presentation-frame build.

| Public claim or decision | Source | Status |
|---|---|---|
| Six entries: CafePress UK, Merchandising Platform, Spreadsheet Agent, AI Leasing Agent, Jumpstart Finance, Client Work, with the brief's supporting labels | S1 (latest brief) | Supported |
| CafePress UK is internship research plus a storefront prototype; "not a production launch, and measured commercial outcomes are not available" | S2 deck pp. 3–9; S1 | Supported. The page never says "UK launch" (the deck's title uses "Launch", but no launch is evidenced) |
| Merchandising Platform is independent, synthetic, separate from PlanetArt systems; catalog stock status, product drawer (chance of running out, unit economics, 28 days), replenishment calculation, "does not place orders", CSV export, Ask screen with fixed query shapes and "no language model involved", 240 SKUs, no backend | S2 recording 0.3s, 8.5s, 12.0s, 46.0s, 53.9s and in-app footer | Supported |
| Spreadsheet Agent approach sentences (request, build plan for review with source, filters, columns, sort, row limit, Edit plan, "Not used" words; sheet opens in an editable grid with formula bar and toolbar; saved to the sheet list) | S2 recording 12.9s, 20.5s, 25.3s, 35.5s | Supported. No cell edit is shown being typed, so the page does not say an edit was made |
| "Simulated AI responses. No live model connection." | S1 | Supported (S1). The résumé describes the project as retrieving data through chat; the site follows S1 |
| AI Leasing Agent: opportunity proposal, requirements, testing; third-party production platform; adopted across 18 properties; "Changes in response time and conversion were not independently verified." | S1; S3 (requirements, 18 properties) | Requirements and adoption supported by S3; proposal, testing and third-party platform S1 only. The résumé's "reducing response time by 95%" is deliberately not published |
| The three approach categories (general information, current information, staff decisions) | S1 (brief wording) | S1 only; the illustrative conversation is invented data and labelled on every use |
| Jumpstart: Founder & Product Lead, five-person international team, European Innovation Academy, Porto, Jun–Jul 2024, 150 sign-ups in 24 hours reported in the program pitch, not retention, revenue or product-market fit; business model tiers are assumptions | S3; S2 pitch pp. 7, 10 | Supported. The problem sentence is presented as the team's premise, not a research finding |
| Client Work role "Creative Strategy and Client Solutions Intern" | S3 ("&"); S1 (brief wording "and") | Supported |
| Third project title "The Night Club Global Tour" (a run club event with Gymshark; HECK branding in the film) | S2 agency project summary; the film; Harlie's previous portfolio | Supported. Tab label uses this title |
| Nickleby film is Video 1 | `scripts/prepare-media.mjs` remuxes "Nickleby Capital Video 1.mp4" (100.3s) | Supported. Video 2 (41.0s) is not published |
| Nickleby contribution (equipment and lighting setup, B-roll during the interviews); deliverable (five testimonials, nine FAQ responses, a 60-second social cut) | S3 journal; S2 agency summary | Supported, but the journal does not name the firm, so linking the shoot to Nickleby remains an inference |
| Aristocracy contribution (setup, lighting, coordination, behind-the-scenes documentation, two-day production for the Manchester store launch); deliverable (Spring/Summer campaign video, e-commerce imagery, social assets) | S3 report and journal; S2 agency summary | Supported |
| Night Club contribution "Production support on the event, working with the agency team" | S3 report ("a branded Run Club event") | Supported. The previous portfolio's "Videographer" credit is not verified and is not used |
| Other agency work (pitch decks, LinkedIn posts, six Google Ads campaigns, Google Ads Search certification, CSS changes to the Squarespace site, editing B-roll in Premiere Pro) | S3 journals and report | Supported |
| About biography paragraphs | S1 (verbatim) | Personal positioning, not a professional research claim |
| About experience list and education dates | S3 | Supported exactly |
| An Artistic End on About: description and "Published on YouTube, January 2026" | Previous portfolio (description); YouTube oEmbed (date) | Supported. The role (Writer, Director, Cinematographer, Editor) comes from the previous portfolio only and is shown on /film, not on About |
| Drawing titles and series notes on /art | Harlie's previous portfolio (her own titles) | Supported. "Published in BSB Magazine" and awards are omitted |
| Film roles on /film | Previous portfolio | Not independently verified |

### Open questions for Harlie (this revision)

1. The Jumpstart Results now show a small excerpt of the pitch's "Traction & Validation" slide (the title and "150 sign-ups in 24 hours" only; the unverified "Encouraging customer interviews" bullet, the Instagram handles and the reels are left out). Confirm it may be published.
2. Confirm that the Nickleby interview shoot in the journal is the Nickleby Capital project. Until then the contribution sentence stays as written (the lead's plan accepts it as a modest inference), and the "Frames from the film" pair no longer includes a B-roll shot, so no frame reads as Harlie's own footage.
3. Titles for the three drawings not placed in a series on the old site (turn, line, man), if they have any.
4. The film roles on /film come from the previous portfolio; confirm them.

### Final revision: review fixes (2026-09-24)

| Change | Reason |
|---|---|
| The provenance label on every Merchandising Platform image and on its recording reads “Independent prototype · Synthetic data” (was “Independent reconstruction · Synthetic data”). The `merch-overview` caption reads “Merch Console overview screen. Synthetic data, separate from PlanetArt’s internal systems.” | “Reconstruction” implied a copy of an employer system. The brief calls it an independent prototype separate from PlanetArt's internal systems. |
| CafePress UK storefront dialog caption: “Prototype view. A proposed experience, not a launched site.” | The old wording (“not evidence of a completed UK launch”) implied a launch was underway. |
| AI Leasing Agent conversation caption: “A leasing web chat with invented names and data. Not a production screenshot.” | The provenance label already says Illustrative · Synthetic; the caption no longer repeats it and matches the page captions. |
| Watch demo recordings are named by their titles (“Merch Console walkthrough”), not “…walkthrough, recorded walkthrough”. | Repetition. |
| `film-nickleby-b` is now a wide interview frame (50s). The B-roll frame (70s) was removed. | The B-roll shot invited readers to take it as Harlie's footage; individual camera credits are not documented. |
| Jumpstart opening summary ends “not evidence of retention, revenue, or product-market fit.” | Matches the Results qualification. |
| /art intro: “Drawings in four series, each drawing shown with its title, followed by three untitled drawings outside the series.” | The titles belong to drawings, not series; the three extra drawings have none. |
| The CafePress UK cover pairs the storefront with the Competitor Findings slide. | It showed the storefront hero twice; the tile now shows the research half of the project too. |
| The social preview shows “Harlie Katz”, “Portfolio” and the homepage sentence. | It still carried the old positioning line. |
| The CafePress UK page does not say “pricing in pounds”. | The prototype shows no prices; GBP pricing appears only as a recommendation in the deck (p. 7). |

**Facts the page specialists could not verify (kept, conservatively worded):**
- CafePress UK: “among UK competitors” and “recurring product categories” are the brief's wording; the deck's competitor slide (p. 5) reviews Printful, Prodigi, Printify, Vistaprint and a logo reading “4imprint USA” as comparable businesses for the UK market (not all UK-only), and the recurring theme it names is eco-friendly products. The deck says “existing US B2B model” where the brief says “existing US storefront”. The deck's cover title is “CPB Merchandising Intern”; the page uses the résumé title and dates. The Localization caption names only what is visible (“Basket” is UK wording on the prototype but not on the deck's language list; the £ is an icon beside No Setup Fees).
- Merchandising Platform: authorship (“I developed this independent prototype”) rests on the brief; the 2026 timeframe comes from `projects.ts` (the in-app date 2026-09-01 belongs to the synthetic data); “no backend” and “edits are stored in the browser” come from the app's own text (no reload is shown); CSV export and “does not place orders” are stated by the drawer's note (no export is run); the catalog filters are shown but not used; the Ask result's Order column is read from its header and summary line.
- Spreadsheet Agent: “can be reopened” (the new sheet is listed first in All Sheets and starred, but never reopened on screen); “editable” (toolbar, formula bar and an “Ask for a change” field are visible, but no cell edit is typed); only Build sheet of the three plan controls is used; the 2026 timeframe comes from `projects.ts`.


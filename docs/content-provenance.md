# Content provenance

This file traces every public factual claim on the site to its source, lists claims that were deliberately left out, and records open questions for Harlie. The public copy is the exact copy from the page briefs (`src/content/projects.ts` plus the page components). Media are covered in [`asset-audit.md`](asset-audit.md). Reviewed 2026-09-23.

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
| “AI product, strategy & operations.” | Homepage, page titles, social image | S1. Close to the S3 résumé header “AI Implementation \| Product Strategy & Operations”. | Positioning line |
| “Portfolio of Harlie Katz: merchandising research and prototypes, AI leasing requirements, an independent spreadsheet prototype, a financial-learning venture, and agency creative production.” | Meta description | S1; summarizes the five projects below | Supported via the project rows |
| “Selected work in AI product definition, product operations, prototyping, and creative production.” | `og:description` | S1 | Summary |
| `harliekatz@berkeley.edu` | Contact block, footer, About, `<noscript>` | S3 résumé | Supported |
| LinkedIn `https://www.linkedin.com/in/harliekatz/` | Contact block, footer, About | S3 résumé (“linkedin.com/in/harliekatz”) | Supported. The URL was not opened. |
| Résumé download | Footer (every page), About, `<noscript>` | S3 file, copied byte-identical | **See Q1.** The PDF contains content the site excludes. |
| No phone number, no GitHub | Whole UI | S1 | Holds for the UI. Does not hold for the résumé PDF (Q1). |
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
| “I studied Cognitive Science at UC Berkeley, with a minor in Data Science and a Certificate in Entrepreneurship & Technology.” | S3 résumé | Supported |
| “My work has included merchandising research and prototypes, AI leasing requirements, a financial-learning venture, enterprise AI research, and creative production.” | S3 résumé; S2 | Supported. “Enterprise AI research” is the Artesian role, which only the résumé documents. |
| “Across these projects, I have worked close to the people, information, and decisions a product needs to support.” | S1 | Self-description |
| “I’m interested in early-career roles in AI product, implementation, product strategy, and operations.” | S1 | Statement of intent |
| “University of California, Berkeley”; “B.A. Cognitive Science · Minor in Data Science”; “Aug 2023–May 2026”; “Certificate in Entrepreneurship & Technology, Sutardja Center”; “Completed in three years.” | S3 résumé (“Completed in 3 years”) | Supported. GPA omitted per S1. |
| Experience: PlanetArt (Jun–Aug 2026), Shift Content (Jan–May 2026), Artesian Network, “Enterprise AI Research Associate” (Jun 2025–Jan 2026), Valiance Capital (Oct 2024–Jun 2025), Jumpstart Finance (Jun–Jul 2024) | S3 résumé | Supported. The résumé names “The Artesian Network”. |
| “A small selection of personal drawing work.”; captions “Portrait study.” ×2, “Hand study.” | S1; images from S6 | Descriptive only |
| Portrait, alt “Harlie Katz.” | S3 | Supported |
| Contact copy and links | S1; S3 | Supported |

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
| Shift | “Built six Google Ads campaigns”; “Google Ads Search Certification” (journals) | The site says only “Google Ads campaigns” |
| Shift | LinkedIn posts for the founder, editing footage in Premiere Pro, a voiceover script, BTS content, asset organization (journals and report) | Not tied to the three films, or minor. Editing is not claimed for the published films. |
| Shift | Nickleby's “five testimonials, nine FAQ responses, and a 60 second social mashup” and its “game show format”; Aristocracy's “over two days”, “Spring/Summer campaign” and “Manchester store launch” (Film case studies) | The agency's descriptions; Harlie's share is not established |
| Shift | Nickleby Capital Video 2 | Editorial choice: one film per client |
| Shift | Director, camera, editor or photographer credits | Unknown |
| Shift | Agency deck client list and case study (`shift content deck.pdf`) | Agency claims unrelated to Harlie's work |
| About | GPA 3.7; coursework; skills lists; location “San Francisco, CA”; phone number; `harliekatz.netlify.app` (résumé) | Omitted per S1 (phone never in the UI) |
| About | “Produced 4 executive white papers…”; “Evaluated LLM, RAG, and agent platforms…” (résumé, Artesian); `Olympus.io Projects.pdf` | Not one of the published projects; no evidence reviewed for public use |
| About | Old-portfolio titles and series (“A Life, Beautifully Worn”, “Time Unspoken”, “The Inevitable”; series “The Art of Aging”); film-festival awards and a magazine credit attached to other works | Descriptive captions only; no titles or awards imported |

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
3. **The résumé download republishes excluded content** (Q1).

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

1. **Résumé PDF (high priority).** The public résumé (`/resume/harlie-katz-resume.pdf`) is byte-identical to the supplied file and is linked from every page's footer. It contains:
   - a personal phone number;
   - “reducing response time by 95%”;
   - the “qualified inquiries … 100+ keywords and 6 client domains” claim;
   - “1,000+ tenant portfolio”;
   - “retrieves data” and the `spreadsheetagent.netlify.app` link;
   - GPA 3.7;
   - “4 executive white papers”.

   The site deliberately leaves out each of these. Should a portfolio version of the résumé replace it, or is publishing it as is intended?
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

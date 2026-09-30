# Motion components

The app is React + TypeScript + Vite with plain CSS: the site's styles live in `src/styles`, and the components adapted from outside sources live in `src/components/ui`, each with its own plain CSS. There is no Tailwind, shadcn setup or path alias, and the development-only demo route and the preview effects it showed have been removed (2026-09-29).

## Components

- `originkit/nebula-drift.tsx`: Originkit's Nebula Drift with Harlie's preset, the ground of the case studies and About (CaseGround). Its header lists the changes from the supplied code.
- `card-hover.tsx` and `card-hover.css`: 21st.dev's Card Hover, adapted as the case studies' gallery for pages with several pictures (CaseStory).
- `TypeLine.tsx`: after Aceternity's TypewriterEffectSmooth, the homepage's typed lines.
- `Stateful.tsx`: after Aceternity's stateful button, without Motion; the loader and check on the site's action buttons.
- `DockTitle.tsx`, `dockLetters.ts`, `dockText.ts` and `dock-title.css`: letters (titles and headings) and words (running text) that magnify under the pointer, after Aceternity's Floating Dock; on the titles since the start, on every text since 2026-09-30 (`dockText.ts`).
- `CursorLight.tsx`: the soft light around the cursor on the homepage film and the case studies' ground (the site's own).

Licence notes for the adapted components are in `THIRD_PARTY_NOTICES.md`.

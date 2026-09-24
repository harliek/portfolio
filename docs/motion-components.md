# Motion components

The app is already React + TypeScript + Vite. Reusable components now live in `src/components/ui`, matching `@/components/ui` through the Vite and TypeScript aliases. A root-level `components/ui` directory would be outside this app's source layout; the alias provides the requested convention without duplicating folders.

Tailwind v4 is configured through `@tailwindcss/vite`. `src/styles/utilities.css` imports theme and utility layers without Preflight so the existing portfolio reset is preserved. It is imported only by the development-only demo route (`src/components/ui/demo.tsx`), so the production portfolio ships no Tailwind CSS; a component moved into the site must bring its styles into plain CSS. Existing styles remain in `src/styles`. `components.json` and `src/lib/utils.ts` provide shadcn-compatible paths. Add future components with `npx shadcn@latest add <component>`. For a new Vite project use the official Vite shadcn setup and `npx shadcn@latest init -d`; do not reinitialize this project's theme.

## Preview

Run `npm run dev`, then open `/component-demos`. The route is development-only and does not change the homepage gallery or published case studies. It includes the three supplied effects and eight distinct Originkit effects. Duplicate Particle Drift input was consolidated. Only one Originkit preview mounts at a time. Reduced-motion mode replaces these previews with a static message.

## Components

- `spotlight-card.tsx` exposes GlowCard with optional children, color, size, custom dimensions and className. Pointer coordinates are local, styles are scoped, and touch scrolling is preserved. This is a rectangular spotlight, not an alpha-mask glow for the PNG gallery.
- `liquid-effect-animation.tsx` exposes LiquidEffectAnimation with imageUrl and className. It uses the pinned npm implementation instead of injected CDN script/global state. Parent must provide a height. Each instance owns its canvas and releases resources on cleanup. Reduced motion and import/WebGL failure retain the background image. Keep it out of the global video stage until that placement is chosen.
- `container-scroll-animation.tsx` exposes ContainerScroll with titleComponent, children and className. It uses framer-motion, normal content height and a short entry transform, avoiding the sample's huge spacers and Next-only Image dependency.
- `originkit/` contains user-supplied source for slider, neon/glow borders, cursor, click effects, wordmark, type sequence and particles. These remain preview effects, not site-wide effects. Review their standalone motion behavior before using outside the guarded demo.

No providers or external state store are required. No icon dependency is necessary. The demo uses a verified Unsplash image and existing project imagery. Do not use stock imagery as case-study evidence.

## Suggested placement

Spotlight works best around the two existing rectangular creative media previews. ContainerScroll is suitable for one large project introduction, not every paragraph or a nested sticky video. Liquid is an optional contained About visual rather than a replacement for the architectural video. Originkit's flat slider is a motion reference and should not replace the depth gallery without adapting depth, link semantics and keyboard selection.

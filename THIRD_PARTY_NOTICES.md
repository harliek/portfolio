# Third-party notices

This portfolio's source code is original to this project unless noted below. It ships the following third-party software and assets.

## Runtime software (bundled into the built site)

| Package | Version | License | Notes |
|---|---|---|---|
| react | 19.3.0 | MIT | © Meta Platforms, Inc. and affiliates |
| react-dom | 19.3.0 | MIT | © Meta Platforms, Inc. and affiliates |
| react-router / react-router-dom | 7.18.4 | MIT | © Remix Software Inc., React Training LLC |
| gsap (core, ScrollTrigger, Flip) | 3.15.0 | GSAP Standard “no charge” License | **Not MIT.** Terms: <https://gsap.com/standard-license>. Ordinary portfolio use falls within its no-charge terms. The package's own license headers are retained; the license is not relabeled. |

MIT license text (applies to the MIT packages above; copyright holders as listed):

> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Fonts

| Asset | Version | License | Source |
|---|---|---|---|
| Inter Variable (`public/fonts/InterVariable.woff2`) | 4.1 | SIL Open Font License 1.1 | Official release, <https://github.com/rsms/inter/releases/tag/v4.1> (<https://rsms.me/inter/>). Full license: `public/fonts/Inter-LICENSE.txt`. |

## Build and test tooling (not shipped to visitors)

Vite (MIT), @vitejs/plugin-react (MIT), TypeScript (Apache-2.0), ESLint and typescript-eslint (MIT), eslint-plugin-react-hooks (MIT), globals (MIT), Playwright (Apache-2.0), @axe-core/playwright (MPL-2.0), sharp (Apache-2.0; bundles libvips, LGPL-3.0-or-later). The project scaffold's TypeScript configuration comes from the official `create-vite` `react-ts` template (MIT, <https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts>).

## Code references

This section separates code that was copied or adapted from sources that were used only as visual or conceptual references.

- **Copied or adapted code:** none. No third-party component source ships in this site.
- **Layout idea adapted (no code copied):** Lightswind “3D Image Slider” (lightswind 3.2.5, MIT; <https://lightswind.com/r/3d-image-slider.json>). Its idea of stacking cards in one grid cell and placing each with `rotateY`/`translateZ` informs the project carousel, which was written from scratch in GSAP and plain CSS as a shallow arc with no continuous rotation.
- **Researched and not adopted:** Motion, Motion Primitives, Magic UI, Aceternity UI (proprietary licence), ScrollX UI (MIT plus Commons Clause), 21st.dev (mixed or unclear licences), HeroUI (full design system; its styles import Tailwind's preflight), uselayouts, Tailwind CSS and Three.js. This follows Harlie's final instruction to keep GSAP and plain CSS; see the note in `DESIGN_RULES.md`.
- **Visual and conceptual references only (no code copied):**
  - codrops/3DCarousel (MIT), <https://github.com/codrops/3DCarousel>: the general idea of arranging cards with CSS 3D transforms. The shallow-arc geometry here was written independently for this site.
  - codrops/ScrollBasedLayoutAnimations (MIT), <https://github.com/codrops/ScrollBasedLayoutAnimations>: the capture → change layout → animate pattern described in GSAP's Flip documentation.
  - DavidHDev/react-bits Circular Gallery (MIT plus Commons Clause): curvature reference only. No code and no OGL dependency were used.
  - Portfolio repositories reviewed for project-data organization only (aitezazdev/Portfolio, ak-rahul/portfolio, 5araang/Nextjs-cinematic-portfolio, HasnainIrfan/3d-portfolio; all MIT). Nothing was copied.

## Content

The project media (screenshots, presentation excerpts, films, and photographs) was supplied by Harlie Katz for this portfolio. Third-party brand marks visible inside those artifacts belong to their owners. Publication clearance for third-party material was not independently verified; see `docs/content-provenance.md`.

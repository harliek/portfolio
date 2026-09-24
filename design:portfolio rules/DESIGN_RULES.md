# Design Rules for Harlie's Portfolio

> **Note, 2026-09-23.** A short-lived amendment allowing Motion and Tailwind was **withdrawn** the same day at Harlie's instruction. The constraints below apply in full: GSAP (ScrollTrigger, Flip) plus plain CSS and custom properties, with no Tailwind, Motion or Three.js, and no UI library added only to build a carousel. The Lightswind 3D image slider was studied, and only its layout idea (cards stacked in one grid cell, turned with `rotateY` and pushed with `translateZ`) informs the GSAP/CSS project carousel.

Read this before building or changing any UI. These rules override your defaults.

## Project constraints (do not break these)

- Stack: React, TypeScript, Vite, GSAP (plus ScrollTrigger, Flip, Draggable as needed). All GSAP plugins are free.
- Do NOT add Three.js, Framer Motion / Motion, Tailwind, or any UI or state library. Plain CSS (CSS Modules or one global stylesheet with custom properties).
- Every tunable value (durations, distances, stagger, colors, radii) lives in a config object or a CSS custom property, never hard-coded inside a component.
- Keep code small and readable. No abstraction layers for one-off behavior. No state management beyond `useState`/`useRef`.
- If a rule below references Tailwind or Motion syntax from an outside source, translate it to plain CSS or GSAP.

## Guiding principle

The site should feel high-end because details are precise, not because things move. One big cinematic moment (the scroll-scrubbed intro). Everything else is calm.

- Motion must explain something: a card becoming a case study, content arriving, a state changing. Decorative motion gets cut.
- Never animate things a visitor triggers over and over (nav hovers, repeated clicks) beyond a quick color or shadow change.
- When in doubt, remove it.

## Design tokens

Define these in `:root` and use them everywhere.

```css
:root {
  /* Surfaces: off-white, never pure white */
  --bg: #fcfcfc;
  --text: #111;
  --text-muted: #6b6b6b;

  /* Radii: outer = inner + padding (see Corners) */
  --radius-inner: 12px;
  --pad-card: 8px;
  --radius-outer: calc(var(--radius-inner) + var(--pad-card));

  /* Motion */
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --dur-fast: 150ms;
  --dur-base: 300ms;
}

@supports (color: oklch(0 0 0)) {
  :root {
    --bg: oklch(0.991 0 0);
  }
}
```

Mirror motion values in one TS config:

```ts
export const MOTION = {
  ease: "power1.out",       // same curve as cubic-bezier(0.25,0.46,0.45,0.94)
  enter: { y: 12, blur: 8, duration: 0.6 },
  stagger: { sections: 0.1, words: 0.08 },
  exit: { xPercent: -70, blur: 4, duration: 0.3 },
  flip: { duration: 0.5, ease: "power3.inOut" },
};
```

## Color

- Write colors in OKLCH. Provide a hex fallback via `@supports` as shown above.
- Accent palettes: keep lightness and chroma fixed, change only hue, so every color reads equally bright.
  Example: `oklch(0.50 0.16 30)`, `oklch(0.50 0.16 150)`, `oklch(0.50 0.16 250)`.
- Shades: change lightness only; keep hue and chroma fixed so the color doesn't drift.
- Gradients: always declare the color space, `linear-gradient(in oklch, ...)`. Use color hints (`red, 40%, blue`) to shift the midpoint instead of adding stops.
- Avoid chroma so high it clips out of gamut. Check values at oklch.fyi.
- Text contrast must pass WCAG AA (4.5:1 body, 3:1 large text).

## Typography

- Global: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`
- Headings: `text-wrap: balance`. Paragraphs: `text-wrap: pretty`.
- Any number that changes or sits in a column (stats, dates, years): `font-variant-numeric: tabular-nums`.
- Body line length 60 to 75 characters. Line-height about 1.5 for body, 1.1 to 1.2 for large headings.
- Use a tight type scale (4 to 5 sizes max). Hierarchy comes from weight and color before size.

## Corners, edges, depth

- Nested corners: outer radius = inner radius + padding. Never use the same radius on a container and the element inside it.
- Prefer layered shadows over borders for cards and buttons:

```css
.surface {
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 1px 2px -1px rgba(0, 0, 0, 0.06),
    0 2px 4px 0 rgba(0, 0, 0, 0.04);
  transition: box-shadow var(--dur-fast) var(--ease-out);
}
@media (prefers-color-scheme: dark) {
  .surface { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08); }
}
```

  Hover state: darken the shadow slightly. Transition `box-shadow` only.
- Images and video thumbnails get an inner edge:

```css
.media-edge {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}
```

- Align icons and text optically, not geometrically. If an icon looks off-center, nudge it with padding or fix the SVG.

## Motion rules (GSAP)

Only animate `transform`, `opacity`, and `filter`. Never animate width, height, top, left, or margin. Keep blur at 8px or less and limit how many blurred elements animate at once.

**Enter (content arriving):** fade in, unblur, rise a little. Split big blocks into separate elements and stagger them.

```ts
gsap.from(items, {
  opacity: 0,
  y: MOTION.enter.y,
  filter: `blur(${MOTION.enter.blur}px)`,
  duration: MOTION.enter.duration,
  ease: MOTION.ease,
  stagger: MOTION.stagger.sections,
  scrollTrigger: { trigger: section, start: "top 80%", once: true },
});
```

**Exit:** quieter than the entrance. Move 70% of the way, not 100%, with a little blur.

**Interactions vs. sequences:** use CSS transitions or `gsap.to` (which retarget if interrupted) for hover, press, and toggles. Use timelines for one-time staged sequences like the intro.

**Press feedback:** buttons scale to about 0.97 on press, 150ms. Nothing bouncy.

**Card to case study:** use GSAP Flip so the card morphs into the detail view instead of cutting.

```ts
const state = Flip.getState(card);
openDetail();              // move or restyle the element in the DOM
Flip.from(state, { duration: MOTION.flip.duration, ease: MOTION.flip.ease, absolute: true });
```

**Drag (only if a feature needs it):** Draggable with snap points and no momentum. Reference values: snap at -116 / 0 / 116px, commit past 58px, low overshoot.

**Scroll-scrubbed intro:** pin the section with ScrollTrigger, scrub the video's `currentTime`, crossfade to the loop at the end. Keep all timings in the config object. Give the video a poster frame and preload it so the first frame never flashes blank.

**Reduced motion is required.** Wrap every animation:

```ts
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // full animations here
});
mm.add("(prefers-reduced-motion: reduce)", () => {
  // opacity-only fades, or no animation; show intro loop or a still frame
});
```

## Accessibility and invisible quality

- Every interactive element is reachable and usable by keyboard, with a visible `:focus-visible` ring that fits the design (don't remove outlines without a replacement).
- Hit areas at least 40 x 40px, even when the visible icon is smaller (use padding or a pseudo-element).
- Icon-only buttons need `aria-label`. Decorative video and images get `aria-hidden` or empty `alt`.
- Semantic HTML first: `nav`, `main`, `section`, `button` for actions, `a` for navigation.
- Dates formatted with `Intl.DateTimeFormat`, not hand-built strings.
- Responsive down to 360px wide with no horizontal scroll. Check spacing between tappable items on mobile.
- Performance: Lighthouse performance 90+ on desktop. Compress video, lazy-load anything below the fold, use AVIF/WebP images with fixed dimensions to avoid layout shift.

## Content structure

- Short bio: what I build and why I care, one or two sentences. Past roles link out to LinkedIn.
- Work shown as a clean, dated list or grid of focused projects, newest first. Each item: title, one-line description, date.
- Leave room for short written pieces (how I deploy AI, what I learned shipping it). Plain, readable article layout.

## Before you call something done

1. Nested radii follow outer = inner + padding.
2. Headings balanced, paragraphs pretty, changing numbers tabular.
3. Colors come from tokens; no stray hex in components.
4. Every animation respects reduced motion and only touches transform, opacity, or filter.
5. Tab through the page: every control is reachable with a visible focus ring.
6. Test at 360px, 768px, and 1440px.
7. No new dependencies added. Tunable values are in config, not buried in components.
8. Ask: does every moving thing earn it? If not, remove it.

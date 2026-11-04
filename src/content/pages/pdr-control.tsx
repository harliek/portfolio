/**
 * PDR Control (added 2026-11-04). An independent interactive prototype, first developed for a Rivian Applied
 * Intelligence case study. The page follows the site's told cases: the introduction and the sections on one side, the
 * walkthrough held on the other, playing the part of the recording each section describes.
 *
 * Facts are checked against the prototype's source (github.com/harliekatz/pdr-control at 88178e9: docs/REDESIGN.md,
 * docs/SYNTHETIC_AND_UNVERIFIED.md, src/plan, src/devices) and against the recording itself. The recording is of the
 * public build at pdr-control.netlify.app, which uses original stand-in vehicles; scans are synthetic, the hardware
 * and its telemetry are simulated, and decisions come from coded rules. The walkthrough's case uses the prototype's
 * limited-response preset, so verification has a shortfall to catch: the copy says so.
 *
 * Recording chapters (PDR Control/pdr-walkthrough-chapters.json, seconds): vehicle and panel 0, scan region 8.67,
 * registration 22.45, diagnosis 33.98, eligibility 56.05, tool selection 65.96, guided setup 76.14, connect and
 * calibrate 118.83, live repair 135.48, removal and inspection 149.55, verification 159.41, PDR Expert 172.39, case
 * record 180.38, end 184.03.
 */
export const PDR = {
  title: 'PDR Control',
  meta: ['Concept, product strategy, interaction design and prototype development', 'Independent product prototype · 2026'],
  subtitle: 'Intelligent Paintless Dent Repair',
  lede: 'An interactive system that helps less experienced technicians repair dents to an expert’s standard: it measures the damage, enforces the repair rules, guides the tool setup and verifies the result.',
  focus: 'Applied AI · Product design · Human-in-the-loop systems',
  /** The live prototype's link (2026-11-04: withheld at Harlie's request; was https://pdr-control.netlify.app/). */
  prototypeUrl: null as null | string,
  repoUrl: 'https://github.com/harliekatz/pdr-control',
  /**
   * The walkthrough (2026-11-04: withheld). The recording of the public build showed its stand-in vehicles, so the page
   * shows the gallery below until a new walkthrough is recorded on licensed models. To bring a recording back, set
   * this to its encodes (scripts/prepare-media.mjs, task `pdr`) and `segments` and `stills` to its chapters.
   */
  walkthrough: null as null | { src: string; dialogSrc: string; poster: string; width: number; height: number },
  /** The gallery while there is no walkthrough, and one picture per section (indices into it). */
  gallery: ['pdr-diagnosis', 'pdr-cross-section', 'pdr-eligibility', 'pdr-tool-choice', 'pdr-bridge-setup', 'pdr-telemetry', 'pdr-verification'] as const,
  show: [0, 3, 1, 5, 6, 0],
  /** One part of the recording per section (seconds). Set with the walkthrough. */
  segments: [
    [0, 8.6],
    [8.7, 33.9],
    [34.0, 76.1],
    [76.2, 149.5],
    [149.6, 180.3],
    [180.4, 184.0, 'hold'],
  ] as const,
  /** One still per section, under reduced motion. */
  stills: [5, 30, 50, 143, 163, 182],
  steps: [
    {
      title: 'The problem',
      text: 'Paintless dent repair depends on judgment that takes years to learn. PDR Control brings an expert’s guidance and measurable feedback into the repair itself.',
    },
    {
      title: 'Observe, decide, execute, verify',
      text: 'The repair splits into four functions. The software measures, applies the rules and guides; the technician does the physical work.',
    },
    {
      title: 'Diagnosis and rules',
      text: 'A registered surface scan measures the dent: 0.80 ± 0.05 mm deep here. Coded rules check eligibility before any method is suggested, and send dents near body lines to specialist review.',
    },
    {
      title: 'Guided setup, human control',
      text: 'Setup is taught on the panel, step by step. During the pull the technician turns the wheel; the app reads force and travel and never drives the tool.',
    },
    {
      title: 'Measured outcomes over inferred success',
      text: 'A second scan measures what actually changed. Here the low moved 0.05 mm, within what two scans can resolve, so the app reports no measurable improvement instead of a success.',
    },
    {
      title: 'Status and next steps',
      text: 'An independent prototype with synthetic scans, simulated hardware and rule-based logic. Next: test whether a portable sensor can measure shallow dents repeatably, then compare novices with and without the system on matched panels.',
    },
  ],
}

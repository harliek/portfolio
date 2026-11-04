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
  lede: 'I designed and built an interactive system that helps technicians with little paintless dent repair experience work toward an expert’s quality. It measures the dent, enforces the repair rules, guides setup with a connected tool and checks the result with a second scan, while the technician stays in control.',
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
  show: [0, 3, 1, 2, 5, 6, 6, 0],
  /** One part of the recording per section (seconds; the last holds on the case record). */
  segments: [
    [0, 8.6],
    [8.7, 33.9],
    [34.0, 56.0],
    [56.1, 76.1],
    [76.2, 149.5],
    [149.6, 180.3],
    [180.4, 184.0, 'hold'],
    [180.4, 184.0, 'hold'],
  ] as const,
  /** One still per section, under reduced motion. */
  stills: [5, 30, 50, 60, 143, 163, 182, 182],
  steps: [
    {
      title: 'The problem',
      text: 'Paintless dent repair restores a panel without filler or paint, but it depends on judgment that takes years to learn: reading a shallow low, deciding whether it can be repaired, placing a tool and knowing when to stop. The goal was to bring an expert’s guidance and measurable feedback into the repair itself.',
    },
    {
      title: 'Observe, decide, execute, verify',
      text: 'I split the repair into four functions: measure the damage, check eligibility and choose a method, set up and pull safely, then measure what changed. After comparing computer vision, connected tools and robotics, I chose a human-guided system: the software measures, applies the rules and guides, and the technician does the physical work.',
    },
    {
      title: 'Surface diagnosis',
      text: 'A proposed Surface Pod scans the selected region, registered to three reference marks so later scans line up. The app shows reflection bands, a deviation map and cross-sections, and reports the deepest point as 0.80 ± 0.05 mm, where ±0.05 mm is scan repeatability, not accuracy.',
    },
    {
      title: 'Rules before recommendations',
      text: 'Before any method is suggested, coded rules check scan quality, size and depth, distance from body lines, panel material, paint condition and repair authorization. A dent too close to a body line goes to specialist review instead of getting a tool.',
    },
    {
      title: 'Guided setup, human control',
      text: 'Setup is taught on the panel: the pulling tab, the adhesive, a projected tab outline and each foot of the connected bridge. During the pull the technician turns the wheel, while the software reads force and travel, flags stale or inconsistent data and never drives the tool.',
    },
    {
      title: 'Measured outcomes over inferred success',
      text: 'Force and travel describe the instrument, not the panel, so a second registered scan measures what actually changed. In the prepared demonstration the low moved 0.05 mm, less than two scans can resolve (±0.07 mm), so the app reports no measurable improvement and recommends a repeat scan or expert review, not another pull.',
    },
    {
      title: 'Validation and next steps',
      text: 'These experiments are proposed, not completed. First, can a portable sensor measure shallow lows on glossy, curved paint repeatably? Then experienced technicians, novices using conventional methods and novices using the system would repair matched panels, compared on quality, time, consistency and safety.',
    },
    {
      title: 'Project status',
      text: 'Independent interactive prototype built with synthetic surface data, simulated hardware feedback, and rule-based decision logic. Physical sensing, trained AI models, and real-world repair validation remain proposed future development.',
    },
  ],
}

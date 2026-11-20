/**
 * PDR Control (added 2026-11-04; Harlie's request of 2026-11-05: the same format and length as the other told cases,
 * with no buttons): the introduction and four sections on the left, the recording fixed beside them, playing the part
 * each section describes.
 *
 * The walkthrough is Harlie's screen recording of the finished prototype (Nov 3, 2026; the one in the final
 * presentation), published with Harlie's approval: the opening shows the vehicle as recorded, the picker's photos are
 * blurred, and after 23.6s the door lettering, inset pictures and vehicle thumbnails are masked
 * (scripts/prepare-media.mjs, task `pdr`). Scans are synthetic, the hardware and its telemetry are simulated, and
 * decisions come from coded rules; the case uses the prototype's limited-response preset, so verification has a
 * shortfall to catch.
 *
 * Recording chapters (seconds): vehicle and damage 0, scan region 23.6, diagnosis 33, eligibility 42, tool choice 54,
 * bridge and tab setup 66, bridge on the door 116, connect and calibrate 129, live repair 148, removal and inspection
 * 167, rescan 180, outcome 185, expert review 194, PDR Expert 203, end 209.8.
 */
export const PDR = {
  title: 'PDR Control',
  meta: ['Independent Product Development · 2026'],
  lede: (
    <p>
      I independently designed and built PDR Control, an interactive prototype that guides less experienced technicians through paintless dent repair, using synthetic scans and simulated hardware.
    </p>
  ),
  /** One part of the recording per section (seconds; the last plays once and holds). */
  segments: [
    [0, 23.5],
    [23.6, 69.0],
    [69.1, 167.0],
    [167.1, 209.6, 'hold'],
  ] as const,
  /** One still per section, under reduced motion. */
  stills: [5, 50, 155, 188],
  steps: [
    {
      title: 'Operational problem',
      text: 'Paintless dent repair depends on judgment that takes years to learn, and technicians have little measurable feedback during the repair itself.',
    },
    {
      title: 'Diagnosis and rules',
      text: 'I designed a surface scan that measures the dent, with coded rules that check eligibility before suggesting a repair method.',
    },
    {
      title: 'Guided repair',
      text: 'The system teaches tool setup on the panel, then reads force and travel while the technician controls the pull.',
    },
    {
      title: 'Measured outcomes',
      text: 'A second scan measures what changed. When the movement is within what two scans can resolve, the system reports no measurable improvement rather than a success.',
    },
  ],
}

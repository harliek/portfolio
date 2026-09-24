import '../../styles/pages/jumpstart-finance.css'
import { CaseLayout } from '../../components/case/CaseLayout'
import { CaseScroll, type CaseMedia } from '../../components/case/CaseScroll'
import { NextProject } from '../../components/case/NextProject'
import { PhoneGroup } from '../../components/pages/jumpstart-finance/PhoneGroup'
import { JUMPSTART_FINANCE as C, JUMPSTART_PHONES, jumpstartFocus } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'

const project = projectById('jumpstart-finance')

/** The group of original prototype phones; the phone that leads follows the section being read. */
const media: CaseMedia = {
  kind: 'custom',
  render: ({ active, layout }) => <PhoneGroup phones={JUMPSTART_PHONES} focus={jumpstartFocus(active)} layout={layout} label={C.mediaLabel} />,
}

/**
 * Jumpstart Finance (route /work/jumpstart): three original 2024 prototype
 * screens (lessons, progress, community) as one composed group beside the
 * story; the phone that matches the section being read comes forward. The
 * phone cover in the opening is later concept artwork; no pitch slides are
 * shown.
 */
export default function JumpstartFinance() {
  return (
    <CaseLayout project={project} className="page-jumpstart-finance">
      <CaseScroll
        project={project}
        meta={C.meta}
        summary={C.summary}
        media={media}
        // A wide box (about the column's width at 1440×900), centred in the visible stage, so the group keeps one
        // composition from a 1280×720 laptop to a 1920×1080 display.
        stage={{ ratio: '8 / 7' }}
        sections={C.sections}
        outcome={C.outcome}
      />
      <NextProject current={project.id} />
    </CaseLayout>
  )
}

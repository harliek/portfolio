import '../../styles/pages/valiance.css'
import { useRef } from 'react'
import { BoundaryNote } from '../../components/case-study/BoundaryNote'
import { CaseHeader } from '../../components/case-study/CaseHeader'
import { CaseSection, Prose } from '../../components/case-study/CaseSection'
import { NextProject } from '../../components/case-study/NextProject'
import { ValianceBoundaries } from '../../components/diagrams/ValianceBoundaries'
import { Figure } from '../../components/media/Figure'
import { projectById } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useReveal } from '../../hooks/useReveal'

const project = projectById('valiance')

const FULL_MEDIA_SIZES =
  '(min-width: 1248px) 1120px, (min-width: 1200px) calc(100vw - 128px), (min-width: 900px) calc(100vw - 80px), (min-width: 600px) calc(100vw - 64px), calc(100vw - 40px)'

const REQUEST_TYPES = [
  'Property and policy questions',
  'Availability and other current information',
  'Application and approval questions',
  'Requests that need a leasing team member',
]

const BOUNDARIES = [
  ['Current information', 'Property-specific answers need an appropriate source of current information.'],
  ['Approval boundaries', 'The assistant should not make decisions that require staff authority.'],
  ['Human handoff', 'Uncertainty and exceptions need a clear route to the leasing team.'],
] as const

const CHECKS = [
  ['Use current information', 'Does the response depend on information that may have changed?'],
  ['Respect approval boundaries', 'Is the assistant making a decision that belongs to staff?'],
  ['Handle uncertainty', 'Does the response acknowledge missing information?'],
  ['Provide a handoff', 'Is the next human step clear?'],
] as const

/**
 * Requirement-to-check matrix. A real table on every screen; below 600px the
 * rows restack as requirement + check. Explicit roles keep the table
 * semantics when CSS changes the display of its parts.
 */
function RequirementChecks() {
  return (
    <div className="vc">
      <table className="vc__table" role="table">
        <caption className="vc__caption diagram__title">Illustrative checks derived from the requirements</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">Requirement</th>
            <th scope="col" role="columnheader">What to check</th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {CHECKS.map(([requirement, check]) => (
            <tr key={requirement} role="row">
              <th scope="row" role="rowheader">{requirement}</th>
              <td role="cell">{check}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Valiance() {
  usePageMeta(project.seo.title, project.seo.description)
  const articleRef = useRef<HTMLElement>(null)
  useReveal(articleRef)

  return (
    <article ref={articleRef} className="case-study cs-valiance">
      <CaseHeader
        project={project}
        eyebrow={project.org}
        title={project.title}
        summary={project.caseSummary}
        meta={[
          { term: 'Role', detail: project.role },
          { term: 'When', detail: project.dateRange },
          { term: 'Context', detail: 'Residential leasing' },
          { term: 'Scope', detail: 'Product definition and workflow testing' },
        ]}
        ownership={project.ownership}
        hero={project.hero}
        chapters={[
          ['Workflow', 'workflow'],
          ['Requirements', 'requirements'],
          ['Testing', 'testing'],
          ['Adoption', 'adoption'],
        ]}
      />

      <div className="shell case-body">
        <CaseSection id="workflow" heading="Start with the work leasing teams already do">
          <div className="cs-valiance__intro">
            <Prose>
              <p>
                Working in leasing gave me direct exposure to recurring questions, property-specific information, and situations that needed staff
                judgment. I proposed an AI assistant around those workflows, then translated them into requirements and test scenarios.
              </p>
            </Prose>
            <div className="cs-valiance__requests">
              <p className="t-label" id="request-types-label">
                Recurring request types
              </p>
              <ul className="editorial-rows" role="list" aria-labelledby="request-types-label">
                {REQUEST_TYPES.map((type) => (
                  <li key={type}>
                    <span className="editorial-rows__title">{type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CaseSection>

        <CaseSection id="requirements" heading="Separate information from decisions">
          <Prose>
            <p>
              The important distinction was not simply whether the assistant could produce an answer. It was whether the answer relied on stable
              information, current property data, or a decision the assistant should not make.
            </p>
          </Prose>
          <ValianceBoundaries className="media-block" />
        </CaseSection>

        <CaseSection id="boundaries" heading="Make the boundaries visible">
          <Prose>
            <p>
              Requirements covered current-data needs, policy limits, approval boundaries, and human escalation. The goal was to make a useful
              response distinguishable from an unsupported promise or a decision that belonged to staff.
            </p>
          </Prose>
          <Figure image="valiance-messages" sizes={FULL_MEDIA_SIZES} zoom framed className="media-block cs-valiance__scenario" />
          <ul className="editorial-rows editorial-rows--split cs-valiance__boundaries" role="list">
            {BOUNDARIES.map(([title, text]) => (
              <li key={title}>
                <span className="editorial-rows__title">{title}</span>
                <span className="editorial-rows__text">{text}</span>
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection id="testing" heading="Test the edge cases as well as the routine questions">
          <Prose>
            <p>
              I tested workflows against the requirements, including situations involving changing information, policy boundaries, and escalation.
              The available materials support that testing role; they do not provide a complete test log or an independently measured accuracy
              rate.
            </p>
          </Prose>
          <RequirementChecks />
        </CaseSection>

        <CaseSection id="adoption" heading="Adopted across 18 properties" className="case-ending cs-valiance__ending">
          <Prose>
            <p>
              The assistant was later adopted across 18 properties. My contribution was the opportunity proposal, workflow translation,
              requirements, and <span className="cs-valiance__nowrap">testing—not</span> engineering the third-party production platform.
            </p>
          </Prose>
          <BoundaryNote>The available materials do not establish a separately verified response-time or conversion improvement.</BoundaryNote>
        </CaseSection>
      </div>

      <NextProject current={project.id} />
    </article>
  )
}

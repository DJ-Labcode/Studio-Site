import { useState } from 'react'
import { featuredIn, projectsIn } from '@/content/projects'
import { brand } from '@/shared/brand'
import { useWindows } from '@/shared/state/windows'
import { Rise } from '@/shared/ui/Rise'
import { ProjectInfo, Shot } from './ProjectInfo'

/**
 * The websites, shown in one browser window with a tab per project.
 * More websites means more tabs, up to HOME_TABS; the rest sit behind a "+N more" tab that opens All work.
 */
export function Browser() {
  const tabs = featuredIn('web')
  const all = projectsIn('web')
  const [slug, setSlug] = useState(tabs[0]?.slug)
  const openAll = useWindows((s) => s.openAllWork)
  const project = tabs.find((p) => p.slug === slug) ?? tabs[0]
  if (!project) return null
  const by = brand.founders.find((f) => f.world === 'web')?.name.split(' ')[0]
  return (
    <Rise>
      <div className="win">
        <div className="tabs" role="tablist" aria-label="Websites">
          <i />
          <i />
          <i />
          {tabs.map((p) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={p.slug === project.slug}
              onClick={() => setSlug(p.slug)}
            >
              {p.name}
            </button>
          ))}
          {all.length > tabs.length && (
            <button type="button" className="more" onClick={() => openAll('web')}>
              +{all.length - tabs.length} more
            </button>
          )}
        </div>
        <div className="addr" aria-hidden="true">
          ← → ↻{' '}
          <span>
            {project.slug} · by {by}
          </span>
        </div>
        <div className="pane" role="tabpanel">
          <Shot
            key={project.slug}
            src={project.shots[0]}
            label={`${project.name} screenshot`}
            className="wide swap"
          />
          <ProjectInfo project={project} />
        </div>
      </div>
    </Rise>
  )
}

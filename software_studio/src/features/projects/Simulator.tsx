import { useState } from 'react'
import { projectsIn } from '@/content/projects'
import { Rise } from '@/shared/ui/Rise'
import { TitleBar } from '@/shared/ui/Window'
import { ProjectInfo, Shot } from './ProjectInfo'

/** The apps, shown in a phone simulator: pick an app from the list and it loads in the phone. */
export function Simulator() {
  const apps = projectsIn('app')
  const [slug, setSlug] = useState(apps[0]?.slug)
  const project = apps.find((p) => p.slug === slug) ?? apps[0]
  if (!project) return null
  return (
    <Rise>
      <div className="win">
        <TitleBar title="Simulator · pick an app to load it" />
        <div className="sim">
          <div className="list" role="tablist" aria-label="Apps">
            <small>
              {apps.length} {apps.length === 1 ? 'app' : 'apps'}
            </small>
            {apps.map((p) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={p.slug === project.slug}
                onClick={() => setSlug(p.slug)}
              >
                <b>{p.name[0]}</b>
                {p.name}
              </button>
            ))}
          </div>
          <div className="device">
            <div className="notch" />
            <Shot
              key={project.slug}
              src={project.shots[0]}
              label={`${project.name} screen`}
              className="swap"
            />
          </div>
          <div
            className="pane"
            role="tabpanel"
            style={{ padding: 0, gridTemplateColumns: 'minmax(0, 1fr)' }}
          >
            <ProjectInfo project={project} />
          </div>
        </div>
      </div>
    </Rise>
  )
}

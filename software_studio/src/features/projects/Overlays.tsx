import { useEffect } from 'react'
import { projectBySlug, projects } from '@/content/projects'
import { brand, type World } from '@/shared/brand'
import { lockScroll, scrollToId } from '@/shared/lib/scrollTo'
import { SECTIONS } from '@/shared/lib/sections'
import { useVisit } from '@/shared/state/visit'
import { useWindows } from '@/shared/state/windows'
import { ProjectLinks, Shot } from './ProjectInfo'

const KIND = { web: 'Website', app: 'App' } as const
const FILTERS: { value: World | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Websites' },
  { value: 'app', label: 'Apps' },
]
const firstName = (world: World) =>
  brand.founders.find((f) => f.world === world)?.name.split(' ')[0] ?? ''

function CloseButton() {
  const close = useWindows((s) => s.closeTop)
  return (
    <button type="button" className="x" aria-label="Close" autoFocus onClick={close}>
      ✕
    </button>
  )
}

/** One project in full: screenshots, what was built, the tech, and where to see it. */
function ProjectWindow({ slug }: { slug: string }) {
  const project = projectBySlug(slug)
  const closeAll = useWindows((s) => s.closeAll)
  const closeTop = useWindows((s) => s.closeTop)
  if (!project) return null
  const app = project.world === 'app'
  const frames = app
    ? ['Screen 1', 'Screen 2', 'Screen 3', 'Screen 4']
    : ['Home page', 'Inner page', 'On a phone']
  const wantOne = () => {
    useVisit.getState().setBrief(`I want something like ${project.name}: `)
    closeAll()
    scrollToId(SECTIONS.contact)
  }
  return (
    <div
      id="pop"
      className="over"
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      onClick={(e) => e.target === e.currentTarget && closeTop()}
    >
      <div className="win">
        <div className="chrome">
          <i />
          <i />
          <i />
          <span className="t">
            {project.name} · {KIND[project.world].toLowerCase()} by {firstName(project.world)}
          </span>
          <CloseButton />
        </div>
        <div className="scroll" data-lenis-prevent>
          <div className="detail">
            {project.status && <span className="status">{project.status}</span>}
            <h2>{project.name}</h2>
            <p className="lead">{project.summary}</p>
            <div className={`gallery ${app ? 'app' : ''}`}>
              {frames.map((label, i) => (
                <Shot
                  key={label}
                  src={project.shots[i]}
                  label={`${project.name}: ${label.toLowerCase()}`}
                />
              ))}
            </div>
            <div className="cols">
              <div>
                <h4>What we built</h4>
                <ul className="points">
                  {project.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Built with</h4>
                <ul className="tags">
                  {project.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="links">
              <ProjectLinks project={project} />
              <button type="button" className="want" onClick={wantOne}>
                Want one like this? →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Every project in one list, with a filter for websites or apps. */
function AllWork({ filter }: { filter: World | 'all' }) {
  const { openAllWork, openProject, closeTop } = useWindows.getState()
  const rows = projects.filter((p) => filter === 'all' || p.world === filter)
  return (
    <div
      className="over"
      role="dialog"
      aria-modal="true"
      aria-label="All work"
      onClick={(e) => e.target === e.currentTarget && closeTop()}
    >
      <div className="win">
        <div className="chrome">
          <i />
          <i />
          <i />
          <span className="t">All work · {projects.length} projects</span>
          <CloseButton />
        </div>
        <div className="scroll" data-lenis-prevent>
          <div className="filters" role="group" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={f.value === filter}
                onClick={() => openAllWork(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="files">
            {rows.map((p) => (
              <button
                key={p.slug}
                type="button"
                className={p.world}
                onClick={() => openProject(p.slug)}
              >
                <b>{p.world === 'web' ? 'W' : 'A'}</b>
                <span>{p.name}</span>
                <small>{KIND[p.world]}</small>
                <small>{firstName(p.world)}</small>
                <small>{p.status ?? ''}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** The windows that open on top of the page. The page behind stops scrolling while one is open; Esc closes the top one. */
export function Overlays() {
  const project = useWindows((s) => s.project)
  const allWork = useWindows((s) => s.allWork)
  const open = project !== null || allWork !== null
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && useWindows.getState().closeTop()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [open])
  return (
    <>
      {allWork && <AllWork filter={allWork} />}
      {project && <ProjectWindow slug={project} />}
    </>
  )
}

import type { Project } from '@/content/projects'
import { cn } from '@/shared/lib/cn'
import { useWindows } from '@/shared/state/windows'

/** A screenshot of a project, or a frame saying it is on its way. */
export function Shot({
  src,
  label,
  className,
}: {
  src?: string
  label: string
  className?: string
}) {
  return src ? (
    <img
      src={src}
      alt={label}
      loading="lazy"
      className={cn('shot object-cover object-top', className)}
      style={{ padding: 0 }}
    />
  ) : (
    <div className={cn('shot', className)}>{label} coming soon</div>
  )
}

/** Links to where a project lives. Only links that have been added to the project are shown. */
export function ProjectLinks({ project }: { project: Project }) {
  return (
    <>
      {project.links?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
          {l.label} ↗
        </a>
      ))}
    </>
  )
}

/** The short description of a project shown beside its screenshot. */
export function ProjectInfo({ project }: { project: Project }) {
  const open = useWindows((s) => s.openProject)
  return (
    <div className="info swap" key={project.slug}>
      {project.status && <span className="status">{project.status}</span>}
      <h3>{project.name}</h3>
      <p>{project.summary}</p>
      <ul className="points">
        {project.highlights.slice(0, 3).map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <ul className="tags">
        {project.stack.slice(0, 5).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <div className="links">
        <ProjectLinks project={project} />
        <button type="button" onClick={() => open(project.slug)}>
          All details
        </button>
      </div>
    </div>
  )
}

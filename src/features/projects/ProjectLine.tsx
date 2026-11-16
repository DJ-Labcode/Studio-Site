import { Link } from 'react-router'
import { projects, type Project } from '@/content/projects'
import { brand, type World } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS, railReveal, railStop } from '@/shared/lib/rail'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Lane } from '@/shared/ui/Lane'

const LINES = {
  web: {
    id: RAIL_SECTIONS.web,
    line: 'web',
    lane: 'left',
    platform: 'Platform 1',
    label: 'Websites',
    title: 'Websites that explain, enrol and sell.',
  },
  app: {
    id: RAIL_SECTIONS.apps,
    line: 'app',
    lane: 'right',
    platform: 'Platform 2',
    label: 'Apps',
    title: 'Apps people open every day.',
  },
} as const

/** Screenshots of a project: one wide frame for a website, a row of tall frames for an app. */
function Shots({ project }: { project: Project }) {
  const wide = project.device === 'browser'
  const frame = 'border-line bg-surface overflow-hidden rounded-[14px] border'
  const empty =
    'text-muted grid place-items-center border-[1.5px] border-dashed p-3 text-center text-[0.8125rem] font-medium'
  if (wide) {
    const shot = project.shots[0]
    return shot ? (
      <img
        src={shot}
        alt={`${project.name} screenshot`}
        loading="lazy"
        className={cn(frame, 'aspect-[16/10] w-full object-cover object-top')}
      />
    ) : (
      <div className={cn(frame, empty, 'aspect-[16/10]')}>
        {project.name} screenshot coming soon
      </div>
    )
  }
  return (
    <div className="flex min-w-0 gap-3.5">
      {[0, 1, 2].map((i) => {
        const shot = project.shots[i]
        return shot ? (
          <img
            key={i}
            src={shot}
            alt={`${project.name} screen ${i + 1}`}
            loading="lazy"
            className={cn(frame, 'aspect-[9/18] min-w-0 flex-1 object-cover object-top')}
          />
        ) : (
          <div key={i} className={cn(frame, empty, 'aspect-[9/18] min-w-0 flex-1 text-xs')}>
            Screen {i + 1}
          </div>
        )
      })}
    </div>
  )
}

/**
 * One developer's line: a section heading and that developer's projects, each a station.
 * Websites hang on the left track; apps mirror on wide screens because their track runs on the right.
 * A project's screenshots wait off to its track's side until its train arrives.
 */
export function ProjectLine({ world }: { world: World }) {
  const cfg = LINES[world]
  const mirrored = world === 'app'
  const founder = brand.founders.find((f) => f.world === world)
  return (
    <section id={cfg.id} className="scroll-mt-10 pt-24 md:pt-30">
      <Lane className="grid gap-10 md:gap-14">
        <header
          className={cn(
            'grid max-w-[34rem] gap-3',
            mirrored && 'md:justify-self-end md:text-right',
          )}
        >
          <Eyebrow {...railStop(cfg.line, cfg.lane, true)}>
            {cfg.platform} <span className="text-ember">·</span> {cfg.label}
          </Eyebrow>
          <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.05] font-bold">{cfg.title}</h2>
          {founder && (
            <p className="text-muted">
              Built by {founder.name}, {founder.role.split('· ')[1]?.toLowerCase()}.
            </p>
          )}
        </header>
        {projects
          .filter((p) => p.world === world)
          .map((p) => (
            <article
              key={p.slug}
              id={p.slug}
              {...railReveal}
              className="group grid scroll-mt-24 items-start gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10"
            >
              <div
                className={cn(
                  'grid min-w-0 gap-3',
                  mirrored && 'md:order-2 md:justify-items-end md:text-right',
                )}
              >
                <h3
                  {...railStop(cfg.line, cfg.lane)}
                  className="text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[1.15] font-bold"
                >
                  {p.name}
                </h3>
                <p className="text-muted max-w-[44ch]">{p.summary}</p>
                {p.status && (
                  <span className="text-ember text-xs font-medium tracking-[0.12em] uppercase">
                    {p.status}
                  </span>
                )}
                <ul className={cn('mt-1 flex flex-wrap gap-2', mirrored && 'md:justify-end')}>
                  {p.stack.slice(0, 4).map((s) => (
                    <li
                      key={s}
                      className="border-line bg-surface text-muted rounded-full border px-2.5 py-[7px] text-xs leading-none font-medium"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/work/${p.slug}`}
                  className="text-ink mt-1 text-sm font-semibold underline underline-offset-4"
                >
                  View project <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div
                className={cn(
                  'min-w-0 opacity-0 transition duration-700 ease-out group-data-[arrived]:translate-x-0 group-data-[arrived]:opacity-100 motion-reduce:transition-none',
                  mirrored ? 'translate-x-14' : '-translate-x-14',
                )}
              >
                <Shots project={p} />
              </div>
            </article>
          ))}
      </Lane>
    </section>
  )
}

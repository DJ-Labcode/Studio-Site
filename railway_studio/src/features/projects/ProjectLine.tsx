import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { featuredIn, projectsIn, type Project } from '@/content/projects'
import { brand, type World } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS, railStop } from '@/shared/lib/rail'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Lane } from '@/shared/ui/Lane'
import { Coaches } from './Coaches'

const LINES = {
  web: {
    id: RAIL_SECTIONS.web,
    lane: 'left',
    platform: 'Platform 1',
    label: 'Websites',
    one: 'Website',
    many: 'websites',
    title: 'Websites that explain, enrol and sell.',
    color: 'var(--color-ink)',
  },
  app: {
    id: RAIL_SECTIONS.apps,
    lane: 'right',
    platform: 'Platform 2',
    label: 'Apps',
    one: 'App',
    many: 'apps',
    title: 'Apps people open every day.',
    color: 'var(--color-ember)',
  },
} as const

/** Screenshots of a project: one wide frame for a website, a row of tall frames for an app. */
function Shots({ project }: { project: Project }) {
  const frame = 'border-line bg-surface overflow-hidden rounded-xl border'
  const empty =
    'text-muted grid place-items-center border-[1.5px] border-dashed p-3 text-center text-[0.8125rem] font-medium'
  if (project.device === 'browser') {
    const shot = project.shots[0]
    return shot ? (
      <img
        src={shot}
        alt={`${project.name} screenshot`}
        loading="lazy"
        className={cn(frame, 'aspect-[16/10] w-full object-cover object-top')}
      />
    ) : (
      <div className={cn(frame, empty, 'aspect-[16/10]')}>Screenshot coming soon</div>
    )
  }
  return (
    <div className="flex min-w-0 gap-3">
      {[0, 1, 2].map((i) => {
        const shot = project.shots[i]
        return shot ? (
          <img
            key={i}
            src={shot}
            alt={`${project.name} screen ${i + 1}`}
            loading="lazy"
            className={cn(frame, 'aspect-[9/16] min-w-0 flex-1 object-cover object-top')}
          />
        ) : (
          <div key={i} className={cn(frame, empty, 'aspect-[9/16] min-w-0 flex-1 text-xs')}>
            Screen {i + 1}
          </div>
        )
      })}
    </div>
  )
}

/**
 * One developer's station on the home page. Its projects are the coaches of a train that slides
 * sideways, so the page is the same length with two projects or twenty. At most HOME_COACHES are
 * shown; when there are more, a last coach leads to the timetable.
 */
export function ProjectLine({ world }: { world: World }) {
  const cfg = LINES[world]
  const mirrored = world === 'app'
  const founder = brand.founders.find((f) => f.world === world)
  const all = projectsIn(world)
  const shown = featuredIn(world)
  const coaches = shown.map((p, i) => (
    <Link
      key={p.slug}
      to={`/work/${p.slug}`}
      className="group border-line bg-surface grid grid-rows-[auto_auto_1fr] rounded-[20px] border transition hover:-translate-y-1 hover:shadow-[0_22px_40px_-28px_rgb(22_21_28/0.6)]"
    >
      <div className="flex h-10 items-center justify-between rounded-t-[19px] bg-(--coach) px-4 font-mono text-[0.6875rem] leading-none font-medium tracking-[0.14em] text-white uppercase">
        <span>Coach {i + 1}</span>
        <span>{p.status ?? cfg.one}</span>
      </div>
      <div className="px-4 pt-4">
        <Shots project={p} />
      </div>
      <div className="grid content-start gap-2 px-[18px] pt-4 pb-5">
        <h3 className="text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[1.15] font-bold">{p.name}</h3>
        <p className="text-muted">{p.summary}</p>
        <span className="text-ink mt-1 text-sm font-semibold underline underline-offset-4">
          View project <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  ))
  if (all.length > shown.length)
    coaches.push(
      <Link
        key="more"
        to={`/work?line=${world}`}
        className="font-display grid min-h-[280px] content-center justify-items-center gap-2.5 rounded-[20px] bg-(--coach) p-7 text-center text-2xl leading-tight font-bold tracking-tight text-white"
      >
        <span>
          See all {all.length} {cfg.many} →
        </span>
        <small className="font-sans text-[0.8125rem] font-medium tracking-normal opacity-85">
          Open the full timetable
        </small>
      </Link>,
    )

  return (
    <section
      id={cfg.id}
      style={{ '--coach': cfg.color } as CSSProperties}
      className="scroll-mt-10 pt-24 md:pt-30"
    >
      <Lane className="grid gap-10 md:gap-12">
        <header
          className={cn(
            'grid max-w-[34rem] gap-3',
            mirrored && 'md:justify-self-end md:text-right',
          )}
        >
          <Eyebrow {...railStop(world, cfg.lane, true)}>
            {cfg.platform} <span className="text-ember">·</span> {cfg.label}
          </Eyebrow>
          <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.05] font-bold">{cfg.title}</h2>
          {founder && (
            <p className="text-muted">
              Built by {founder.name}, {founder.role.split('· ')[1]?.toLowerCase()}.
            </p>
          )}
        </header>
        <Coaches
          label={cfg.label}
          caption={
            <>
              {all.length} {all.length === 1 ? cfg.one.toLowerCase() : cfg.many}{' '}
              <span className="text-ember">·</span> slide through the coaches
            </>
          }
        >
          {coaches}
        </Coaches>
      </Lane>
    </section>
  )
}

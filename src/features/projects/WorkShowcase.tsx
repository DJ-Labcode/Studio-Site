import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { projects, type Project } from '@/content/projects'
import { cn } from '@/shared/lib/cn'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'
import { DeviceFrame } from './DeviceFrame'

const worldLabel = { web: 'Website', app: 'App' } as const
const label = 'font-mono text-[0.7rem] tracking-[0.18em] text-muted uppercase'

function Slide({
  project,
  index,
  state,
}: {
  project: Project
  index: number
  state: 'before' | 'active' | 'after'
}) {
  const active = state === 'active'
  return (
    <article
      aria-hidden={!active}
      style={{ '--hue': project.hue } as CSSProperties}
      className={cn(
        'absolute inset-0 grid content-center items-center gap-5 px-5 pt-28 pb-14 transition duration-700 ease-out md:grid-cols-2 md:gap-12',
        active ? 'opacity-100' : 'pointer-events-none opacity-0',
        state === 'before' && 'translate-y-16',
        state === 'after' && '-translate-y-16',
      )}
    >
      <div className="order-2 mx-auto grid w-full max-w-xl gap-2.5 md:order-1 md:mx-0 md:gap-4 md:justify-self-end">
        <p className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] tracking-widest uppercase">
          <span className="rounded-full border border-[var(--hue)] px-2.5 py-1 text-[var(--hue)]">
            {worldLabel[project.world]}
          </span>
          <span className="text-muted">{project.kind}</span>
          {project.status && <span className="text-[var(--hue)]">{project.status}</span>}
        </p>
        <h3 className="text-[clamp(2rem,4.6vw,4.2rem)] leading-none font-medium uppercase">
          {project.name}
        </h3>
        <p className="text-muted md:text-lg">{project.summary}</p>
        <ul className="grid gap-1.5 text-sm md:gap-2 md:text-base">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 max-md:nth-[n+3]:hidden">
              <span aria-hidden="true" className="mt-2 size-2 flex-none bg-[var(--hue)]" /> {h}
            </li>
          ))}
        </ul>
        <ul className="hidden flex-wrap gap-2 md:flex">
          {project.stack.map((t) => (
            <li
              key={t}
              className="border-line text-muted rounded border px-2.5 py-1.5 font-mono text-[0.7rem]"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-5 pt-1 text-sm font-semibold">
          <Link
            to={`/work/${project.slug}`}
            tabIndex={active ? 0 : -1}
            className="underline underline-offset-4"
          >
            Read more →
          </Link>
          {project.link && (
            <a
              href={project.link.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={active ? 0 : -1}
              className="text-[var(--hue)] underline underline-offset-4"
            >
              {project.link.label} ↗
            </a>
          )}
        </div>
      </div>
      <div className="order-1 mx-auto grid w-full place-items-center md:order-2 md:justify-self-start">
        <DeviceFrame
          project={project}
          className={
            project.device === 'phone'
              ? 'h-[30svh] md:h-[66svh]'
              : 'w-[min(100%,34rem)] max-md:h-[28svh] max-md:w-auto'
          }
        />
      </div>
      <p aria-hidden="true" className={cn(label, 'absolute top-24 right-5')}>
        {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
      </p>
    </article>
  )
}

/** Pinned section: scroll steps through the projects, one screen each. */
export function WorkShowcase() {
  const n = projects.length
  return (
    <ScrollSequence urls={[]} heightVh={100 * (n + 1)} id="work">
      {(p) => {
        const current = Math.min(Math.floor(p * n), n - 1)
        return (
          <>
            <h2 className={cn(label, 'absolute top-24 left-5')}>Work</h2>
            {projects.map((project, i) => (
              <Slide
                key={project.slug}
                project={project}
                index={i}
                state={i === current ? 'active' : i > current ? 'before' : 'after'}
              />
            ))}
            <div
              aria-hidden="true"
              className="absolute inset-x-5 bottom-6 mx-auto flex max-w-6xl gap-1.5"
            >
              {projects.map((project, i) => (
                <span key={project.slug} className="bg-line h-px flex-1 overflow-hidden">
                  <span
                    className="block h-full origin-left"
                    style={{
                      background: project.hue,
                      scale: `${Math.min(Math.max(p * n - i, 0), 1)} 1`,
                    }}
                  />
                </span>
              ))}
            </div>
          </>
        )
      }}
    </ScrollSequence>
  )
}

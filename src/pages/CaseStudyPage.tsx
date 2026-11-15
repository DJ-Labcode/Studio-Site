import type { CSSProperties } from 'react'
import { useParams } from 'react-router'
import { projectBySlug, projects } from '@/content/projects'
import { DeviceLoop } from '@/features/projects'
import { brand } from '@/shared/brand'
import { ButtonLink } from '@/shared/ui/Button'
import NotFoundPage from './NotFoundPage'

export default function CaseStudyPage() {
  const { slug = '' } = useParams()
  const p = projectBySlug(slug)
  if (!p) return <NotFoundPage />
  const builder = brand.founders.find((f) => f.world === p.world)!
  const next = projects[(projects.indexOf(p) + 1) % projects.length]!
  return (
    <article
      style={{ '--hue': p.hue } as CSSProperties}
      className="mx-auto grid max-w-6xl gap-12 px-5 pt-36 pb-24 md:grid-cols-2"
    >
      <div className="grid content-start gap-6">
        <p className="font-mono text-xs tracking-widest text-[var(--hue)] uppercase">
          {p.kind}
          {p.status ? ` · ${p.status}` : ''}
        </p>
        <h1 className="text-[clamp(3rem,8vw,7rem)] leading-[0.9]">{p.name}</h1>
        <p className="text-muted text-xl">{p.summary}</p>
        <ul className="border-line grid gap-3 border-t pt-6">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 size-2 flex-none bg-[var(--hue)]" /> {h}
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-2">
          {p.stack.map((t) => (
            <li
              key={t}
              className="border-line bg-surface/70 text-muted rounded border px-2.5 py-1.5 font-mono text-xs"
            >
              {t}
            </li>
          ))}
        </ul>
        <p className="text-muted font-mono text-xs tracking-widest uppercase">
          Built by {builder.name}
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          {p.link && (
            <a
              href={p.link.href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--hue)] underline underline-offset-4"
            >
              {p.link.label} ↗
            </a>
          )}
          <ButtonLink to="/#contact">Want one like this? →</ButtonLink>
          <ButtonLink to={`/work/${next.slug}`} variant="ghost">
            Next: {next.name}
          </ButtonLink>
        </div>
      </div>
      <div className="relative grid place-items-center">
        <div
          aria-hidden="true"
          className="absolute inset-[15%] rounded-full bg-[var(--hue)] opacity-25 blur-3xl"
        />
        <DeviceLoop project={p} active className="relative max-h-[70svh]" />
        {p.illustrative && (
          <p className="text-muted mt-4 font-mono text-[0.65rem] tracking-widest uppercase">
            Illustrative preview
          </p>
        )}
      </div>
    </article>
  )
}

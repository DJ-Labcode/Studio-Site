import { brand } from '@/shared/brand'
import { projects } from '@/content/projects'
import { ButtonLink } from '@/shared/ui/Button'
import { PixelGlyph } from '@/shared/ui/PixelGlyph'

/** Placeholder home page for the foundation commit: the real sections arrive feature by feature. */
export default function HomePage() {
  return (
    <section className="mx-auto grid min-h-[70svh] max-w-5xl content-center gap-8 px-5 py-24">
      <p className="text-ember font-mono text-xs tracking-[0.2em] uppercase">Foundation ready</p>
      <h1 className="text-5xl leading-none sm:text-7xl">{brand.tagline}</h1>
      <p className="text-muted max-w-xl text-lg">{brand.description}</p>
      <div className="flex flex-wrap items-center gap-6">
        {brand.founders.map((f) => (
          <div key={f.id} className="flex items-center gap-3">
            <PixelGlyph
              ch={f.initial}
              className={f.world === 'web' ? 'text-web h-10' : 'text-app h-10'}
            />
            <div>
              <p className="font-display font-bold">{f.name}</p>
              <p className="text-muted text-sm">{f.role}</p>
            </div>
          </div>
        ))}
      </div>
      {projects[0] && (
        <div>
          <ButtonLink to={`/work/${projects[0].slug}`}>See a case study route →</ButtonLink>
        </div>
      )}
    </section>
  )
}

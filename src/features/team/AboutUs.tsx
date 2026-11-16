import { team } from '@/content/team'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS, railStop } from '@/shared/lib/rail'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Lane } from '@/shared/ui/Lane'

/** The junction: the two lines run side by side down the middle, with one founder on each side. */
export function AboutUs() {
  return (
    <section id={RAIL_SECTIONS.about} className="scroll-mt-10 pt-24 md:pt-30">
      <Lane className="grid gap-10 md:gap-14">
        <header className="grid gap-3 md:justify-self-center md:text-center">
          <Eyebrow>
            Junction <span className="text-ember">·</span> About us
          </Eyebrow>
          <h2 className="text-[clamp(1.9rem,3.8vw,3rem)] leading-[1.05] font-bold">
            Two lines, one studio.
          </h2>
        </header>
        <div className="grid gap-10 md:grid-cols-2 md:gap-32">
          {brand.founders.map((f, i) => {
            const { story, facts } = team[f.id]
            const left = i === 0
            return (
              <article
                key={f.id}
                className={cn(
                  'grid content-start gap-2.5',
                  left && 'md:justify-items-end md:text-right',
                )}
              >
                <Eyebrow>{f.world === 'web' ? 'Websites' : 'Apps'}</Eyebrow>
                <h3
                  {...railStop(f.world, 'mid')}
                  className="text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[1.15] font-bold"
                >
                  {f.name}
                </h3>
                <p className="text-muted max-w-[42ch]">{story}</p>
                <ul className={cn('mt-1 flex flex-wrap gap-2', left && 'md:justify-end')}>
                  {facts.slice(1).map((fact) => (
                    <li
                      key={fact}
                      className="border-line bg-surface text-muted rounded-full border px-2.5 py-[7px] text-xs leading-none font-medium"
                    >
                      {fact}
                    </li>
                  ))}
                </ul>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink mt-1 text-sm font-semibold underline underline-offset-4"
                >
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
              </article>
            )
          })}
        </div>
      </Lane>
    </section>
  )
}

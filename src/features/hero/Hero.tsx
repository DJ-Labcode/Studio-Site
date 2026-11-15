import { brand } from '@/shared/brand'
import { ButtonLink } from '@/shared/ui/Button'

/** Opening statement. The background keeps drifting on its own; the copy only sets the scene. */
export function Hero() {
  return (
    <section id="top" className="relative grid min-h-svh content-end px-5 pt-32 pb-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10">
        <p className="text-muted font-mono text-xs tracking-[0.2em] uppercase">
          {brand.name} · Web &amp; app studio · {brand.location}
        </p>
        <h1 className="max-w-[14ch] text-[clamp(3rem,10vw,9.5rem)] leading-[0.92] uppercase">
          We forge <span className="text-web">websites</span> &amp;{' '}
          <span className="text-ember">apps</span> people love.
        </h1>
        <div className="border-line flex flex-wrap items-end justify-between gap-6 border-t pt-6">
          <p className="text-muted max-w-md text-lg">
            Two developers, one for the web and one for apps. You talk directly to the people
            writing your code.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink to="/#contact">Start a project →</ButtonLink>
            <ButtonLink to="/#work" variant="ghost">
              See our work
            </ButtonLink>
          </div>
        </div>
        <p
          aria-hidden="true"
          className="text-muted flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.18em] uppercase"
        >
          <span className="bg-ember inline-block h-8 w-px animate-pulse" /> Scroll: the story moves
          with you
        </p>
      </div>
    </section>
  )
}

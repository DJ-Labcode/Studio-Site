import { brand } from '@/shared/brand'
import { ButtonLink } from '@/shared/ui/Button'

/** Opening statement: quiet, left-aligned, with room around it. The background keeps drifting on its own. */
export function Hero() {
  return (
    <section id="top" className="relative grid min-h-svh grid-rows-[1fr_auto] px-5 pt-28 pb-8">
      <div className="mx-auto grid w-full max-w-6xl content-center gap-8">
        <p className="text-muted font-mono text-[0.7rem] leading-relaxed tracking-[0.18em] uppercase">
          {brand.name}
          <br />
          Web &amp; app studio · {brand.location}
        </p>
        <h1 className="max-w-[18ch] text-[clamp(2.2rem,5.4vw,5rem)] leading-[1.02] font-medium tracking-tight uppercase">
          We forge <span className="text-web">websites</span> and{' '}
          <span className="text-ember">apps</span> people love.
        </h1>
      </div>
      <div className="border-line mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 border-t pt-6">
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink to="/#contact">Start a project →</ButtonLink>
          <ButtonLink to="/#work" variant="ghost">
            See our work
          </ButtonLink>
        </div>
        <p
          aria-hidden="true"
          className="text-muted flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.18em] uppercase"
        >
          Scroll <span className="bg-ember inline-block h-8 w-px animate-pulse" />
        </p>
      </div>
    </section>
  )
}

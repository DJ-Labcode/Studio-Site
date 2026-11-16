import { lazy, Suspense } from 'react'
import { featuredIn, projects, shortName } from '@/content/projects'
import { brand } from '@/shared/brand'
import { palette } from '@/shared/brand/palette'
import { RAIL_SECTIONS } from '@/shared/lib/rail'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Lane } from '@/shared/ui/Lane'
import { DepartureBoard } from './DepartureBoard'
import { IdeaBox } from './IdeaBox'

const ForgeCanvas = lazy(() => import('@/three/ForgeCanvas'))

/** the dark train carries the websites (wide panels), the orange train the apps (tall panels); each shows its first two */
const TRAINS = [
  {
    color: palette.ink,
    wide: true,
    names: featuredIn('web').slice(0, 2).map(shortName),
    label: 'Websites',
    href: `#${RAIL_SECTIONS.web}`,
  },
  {
    color: palette.ember,
    wide: false,
    names: featuredIn('app').slice(0, 2).map(shortName),
    label: 'Apps',
    href: `#${RAIL_SECTIONS.apps}`,
  },
] as const

const FACTS = [
  { value: String(projects.length), label: 'projects built' },
  { value: '100+', label: 'learners on HSC-iT' },
  { value: 'Live', label: 'on Google Play', accent: true },
]

/**
 * The home screen is the station. On the left the visitor says what they want to build; on the right is
 * one card: the 3D forge (a sketch goes in, a finished screen comes out) above the departure board.
 */
export function Hero() {
  return (
    <section id={RAIL_SECTIONS.top}>
      <Lane className="grid grid-cols-[minmax(0,1fr)] items-center gap-x-11 gap-y-9 pt-28 pb-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          <Eyebrow>
            Web &amp; app studio <span className="text-ember">·</span>{' '}
            {brand.location.split(',')[0]}
          </Eyebrow>
          <h1 className="text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02] font-bold">
            <label htmlFor="idea">I want to build</label>
          </h1>
          <IdeaBox id="idea" />
          <p className="text-muted max-w-[40ch] text-[1.0625rem]">
            Say it in your own words. It goes straight onto your ticket, and we reply with a plan.
          </p>
          <dl className="border-line mt-1.5 flex flex-wrap gap-x-8 gap-y-3.5 border-t pt-5">
            {FACTS.map((f) => (
              <div key={f.label} className="grid gap-0.5">
                <dt
                  className={`font-display text-3xl leading-none font-bold tracking-tight ${f.accent ? 'text-ember' : ''}`}
                >
                  {f.value}
                </dt>
                <dd className="text-muted text-[0.8125rem]">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-line bg-surface min-w-0 overflow-hidden rounded-[22px] border shadow-[0_40px_70px_-45px_rgb(22_21_28/0.45)] md:rounded-[28px]">
          <div className="relative aspect-[16/10] bg-[radial-gradient(circle_at_50%_56%,#ffe4d7_0_36%,transparent_36.4%),linear-gradient(#ffffff,#fdf5ec)]">
            <Suspense fallback={null}>
              <ForgeCanvas
                trains={TRAINS}
                label="Two trains carry sketches into the forge and bring out finished project screens"
              />
            </Suspense>
            <p className="bg-ink text-paper absolute top-4 left-4 rounded-full px-3 py-2 text-[0.6875rem] leading-none font-medium tracking-[0.14em] uppercase max-md:hidden">
              {brand.nameParts[0]}
              <span className="text-ember">{brand.nameParts[1]}</span> Central
            </p>
            <Eyebrow className="absolute inset-x-0 bottom-3 text-center max-md:hidden">
              Sketch in <span className="text-ember">→</span> finished screen out
            </Eyebrow>
          </div>
          <DepartureBoard />
        </div>
      </Lane>
    </section>
  )
}

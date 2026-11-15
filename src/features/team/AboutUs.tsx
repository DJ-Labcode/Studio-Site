import { team } from '@/content/team'
import { brand, type Founder } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { segment } from '@/shared/lib/math'
import { PixelGlyph } from '@/shared/ui/PixelGlyph'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'

const tone = { web: 'text-web', app: 'text-ember' } as const

function Panel({ founder, visible }: { founder: Founder; visible: number }) {
  const { story, facts } = team[founder.id]
  return (
    <article
      aria-hidden={visible < 0.5}
      className="absolute inset-0 grid content-center px-5 pt-28 pb-10"
      style={{
        opacity: visible,
        translate: `0 ${(1 - visible) * 32}px`,
        pointerEvents: visible < 0.5 ? 'none' : undefined,
      }}
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 md:grid-cols-[1fr_1.1fr] md:gap-16">
        {/* the "portrait": the founder's initial, large and slowly floating */}
        <div className="relative grid place-items-center">
          <div
            aria-hidden="true"
            className={cn(
              'absolute size-[55%] rounded-full opacity-20 blur-3xl',
              founder.world === 'web' ? 'bg-web' : 'bg-ember',
            )}
          />
          <PixelGlyph
            ch={founder.initial}
            className={cn(
              'animate-float relative h-24 md:h-[clamp(10rem,46vh,26rem)]',
              tone[founder.world],
            )}
          />
        </div>
        <div className="grid gap-4 md:gap-5">
          <p className="text-muted font-mono text-[0.7rem] tracking-[0.18em] uppercase">
            {founder.role}
          </p>
          <h3 className="text-[clamp(2.2rem,5vw,4.6rem)] leading-none font-medium uppercase">
            {founder.name}
          </h3>
          <p className="text-muted max-w-xl leading-relaxed md:text-lg">{story}</p>
          <ul className="flex flex-wrap gap-2">
            {facts.map((f) => (
              <li
                key={f}
                className="border-line text-muted rounded border px-3 py-2 font-mono text-[0.7rem]"
              >
                {f}
              </li>
            ))}
          </ul>
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'justify-self-start text-sm font-semibold underline underline-offset-4',
              tone[founder.world],
            )}
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
    </article>
  )
}

/** Pinned section: the first founder, then a cross-fade to the second as you scroll. */
export function AboutUs() {
  const [first, second] = brand.founders
  return (
    <ScrollSequence urls={[]} heightVh={300} id="about">
      {(p) => {
        // the first founder fades out completely before the second fades in, so their text never overlaps
        const out = segment(p, 0.38, 0.5)
        const swap = segment(p, 0.5, 0.62)
        return (
          <>
            <h2 className="text-muted absolute top-24 left-5 font-mono text-[0.7rem] tracking-[0.18em] uppercase">
              About us
            </h2>
            <Panel founder={first} visible={1 - out} />
            <Panel founder={second} visible={swap} />
            <p
              aria-hidden="true"
              className="text-muted absolute top-24 right-5 font-mono text-[0.7rem] tracking-[0.18em]"
            >
              {swap < 0.5 ? '01' : '02'} / 02
            </p>
          </>
        )
      }}
    </ScrollSequence>
  )
}

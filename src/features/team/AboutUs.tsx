import { team } from '@/content/team'
import { brand, type Founder } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { segment } from '@/shared/lib/math'
import { PixelGlyph } from '@/shared/ui/PixelGlyph'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'

function Panel({ founder, className }: { founder: Founder; className: string }) {
  const { story, facts } = team[founder.id]
  return (
    <article
      className={cn('absolute inset-0 grid content-center px-5 pt-28 pb-8 text-white', className)}
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-4 md:grid-cols-[auto_1fr] md:gap-16">
        <PixelGlyph
          ch={founder.initial}
          className="animate-float h-16 md:h-[clamp(7rem,30vh,20rem)]"
        />
        <div className="grid gap-3 md:gap-5">
          <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-80">{founder.role}</p>
          <h3 className="text-[clamp(2.8rem,8vw,7rem)] leading-[0.9]">{founder.name}</h3>
          <p className="max-w-xl text-base leading-relaxed opacity-95 md:text-lg">{story}</p>
          <ul className="flex flex-wrap gap-2">
            {facts.map((f) => (
              <li key={f} className="rounded border border-white/60 px-3 py-2 font-mono text-xs">
                {f}
              </li>
            ))}
          </ul>
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noreferrer"
            className="justify-self-start font-semibold underline underline-offset-4"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
    </article>
  )
}

/** Pinned section: the first founder fills the screen, then the second wipes in over them as you scroll. */
export function AboutUs() {
  const [first, second] = brand.founders
  return (
    <ScrollSequence urls={[]} heightVh={300} id="about" className="bg-web">
      {(p) => {
        const wipe = segment(p, 0.35, 0.65)
        return (
          <>
            <h2 className="sr-only">About us</h2>
            <Panel founder={first} className="bg-web" />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}
              aria-hidden={wipe < 0.5}
            >
              <Panel founder={second} className="bg-ember" />
            </div>
            <p className="absolute top-24 right-5 font-mono text-xs tracking-[0.2em] text-white/80 uppercase">
              About us · {wipe < 0.5 ? '01' : '02'} / 02
            </p>
          </>
        )
      }}
    </ScrollSequence>
  )
}

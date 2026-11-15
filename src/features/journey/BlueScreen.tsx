import type { ReactNode } from 'react'
import { brand } from '@/shared/brand'
import { LogoMark } from '@/shared/ui/Logo'

/** The blue laptop screen, in HTML. It matches the footage so the video can hand over to the real page. */
function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="bg-screen relative grid size-full min-h-svh content-center justify-items-center gap-[3vh] px-5 text-center text-white">
      {children}
    </div>
  )
}

/** First screen inside the laptop: the last frame of the push-in. */
export function HeroScreen() {
  return (
    <Screen>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[4.4vw] py-[3.5vh]">
        <span className="font-display flex items-center gap-3 text-[clamp(1rem,1.6vw,1.4rem)] font-bold">
          <LogoMark onDark className="h-7 w-auto" /> {brand.name}
        </span>
        <span className="text-screen rounded-full bg-white px-5 py-3 text-[clamp(0.8rem,1.1vw,1rem)] leading-none font-semibold">
          Start a project
        </span>
      </div>
      <p className="font-display text-[clamp(2.6rem,8vw,8rem)] leading-[1.02] font-bold tracking-tight">
        WE FORGE APPS
        <br />
        <span
          aria-hidden="true"
          className="bg-ember inline-grid h-[0.72em] w-[1.1em] grid-cols-3 gap-[0.08em] rounded-[0.12em] p-[0.13em] align-[0.02em]"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} className="bg-spark" />
          ))}
        </span>{' '}
        &amp; WEBSITES
        <br />
        PEOPLE LOVE.
      </p>
      <p className="text-[clamp(1rem,1.9vw,1.6rem)] font-medium opacity-90">
        Two developers. Web and mobile. From idea to launch.
      </p>
    </Screen>
  )
}

/** Last screen inside the laptop: the first frame of the pull-out. */
export function ForgedScreen() {
  return (
    <Screen>
      <LogoMark onDark className="mb-[1vh] w-[min(27vw,300px)]" />
      <p className="font-display text-[clamp(2rem,6vw,5.6rem)] leading-none font-bold tracking-tight">
        100% · FORGED.
      </p>
      <p className="text-[clamp(1rem,1.9vw,1.6rem)] opacity-90">Your product, live.</p>
    </Screen>
  )
}

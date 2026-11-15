import { brand } from '@/shared/brand'
import { segment } from '@/shared/lib/math'
import { ButtonLink } from '@/shared/ui/Button'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'
import { ActionBar } from './ActionBar'
import { HeroScreen } from './BlueScreen'
import { HERO_LOOP, PUSH_FRAMES } from './footage'

/**
 * Hero + the glide into the laptop.
 * At rest the hero loop plays; scrolling scrubs the push-in until the screen fills the window,
 * then the HTML screen fades in over the last frames and the page continues "inside".
 */
export function PushIn() {
  return (
    <ScrollSequence urls={PUSH_FRAMES} heightVh={420} id="top" className="bg-paper">
      {(p) => (
        <>
          <h1 className="sr-only">
            {brand.name}: {brand.tagline}
          </h1>
          <video
            src={HERO_LOOP}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover transition-opacity duration-200"
            style={{ opacity: p < 0.004 ? 1 : 0 }}
          />
          <p
            aria-hidden="true"
            className="text-ink absolute inset-x-0 top-24 text-center font-mono text-[0.7rem] tracking-[0.14em] uppercase"
            style={{ opacity: 1 - segment(p, 0, 0.05) }}
          >
            Scroll to step inside ↓
          </p>
          <ActionBar
            style={{
              opacity: 1 - segment(p, 0.02, 0.12),
              translate: `0 ${segment(p, 0, 0.12) * 30}px`,
            }}
          >
            <p className="text-muted flex items-center gap-2.5 font-mono text-[0.8rem]">
              <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />{' '}
              Open for new projects
            </p>
            <p className="text-[0.95rem] font-medium">{brand.description}</p>
            <ButtonLink to="/#forge">Start a project →</ButtonLink>
          </ActionBar>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ opacity: segment(p, 0.93, 1) }}
            aria-hidden="true"
          >
            <HeroScreen />
          </div>
        </>
      )}
    </ScrollSequence>
  )
}

import type { CSSProperties } from 'react'
import { services } from '@/content/services'
import { brand, type World } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { segment } from '@/shared/lib/math'
import { PixelGlyph } from '@/shared/ui/PixelGlyph'
import { ScrollSequence } from '@/shared/ui/ScrollSequence'

const tone: Record<World, { text: string; bar: string }> = {
  web: { text: 'text-web', bar: 'bg-web' },
  app: { text: 'text-ember', bar: 'bg-ember' },
}

function Column({
  world,
  progress,
  align,
}: {
  world: World
  progress: number
  align: 'left' | 'right'
}) {
  const s = services[world]
  const founder = brand.founders.find((f) => f.world === world)!
  const n = s.lines.length
  return (
    <div
      className={cn(
        'relative grid content-center gap-3 md:gap-6',
        align === 'right' && 'md:justify-items-end md:text-right',
      )}
    >
      {/* faint code that types itself as the lines arrive: ambient detail, not content */}
      <div
        aria-hidden="true"
        className={cn(
          'text-ink/20 absolute top-6 font-mono text-[0.7rem] leading-6',
          align === 'right' ? 'right-0' : 'left-0',
        )}
      >
        {s.code.map((line, i) => (
          <p key={line} style={{ opacity: segment(progress, 0.1 + i * 0.18, 0.2 + i * 0.18) }}>
            {line}
          </p>
        ))}
      </div>
      <div className={cn('flex items-center gap-4', align === 'right' && 'md:flex-row-reverse')}>
        <PixelGlyph
          ch={founder.initial}
          className={cn('animate-float h-9 md:h-14', tone[world].text)}
        />
        <div>
          <p
            className={cn(
              'font-display text-3xl leading-none font-medium uppercase sm:text-5xl',
              tone[world].text,
            )}
          >
            {s.title}
          </p>
          <p className="text-muted mt-1 font-mono text-xs tracking-widest uppercase">
            {founder.name}
          </p>
        </div>
      </div>
      <ul className="grid gap-1.5">
        {s.lines.map((line, i) => {
          const k = segment(progress, 0.12 + (i / n) * 0.7, 0.22 + (i / n) * 0.7)
          return (
            <li
              key={line}
              className="font-display text-[clamp(1rem,2vw,1.7rem)] leading-snug font-medium tracking-tight uppercase"
              style={
                {
                  opacity: 0.14 + 0.86 * k,
                  translate: `${(1 - k) * (align === 'right' ? 24 : -24)}px 0`,
                } as CSSProperties
              }
            >
              {line}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Pinned section: the two sides of the studio fill in line by line as you scroll. */
export function WhatWeDo() {
  return (
    <ScrollSequence urls={[]} heightVh={280} id="what">
      {(p) => (
        <div className="mx-auto grid h-full max-w-6xl grid-rows-[auto_1fr] gap-2 px-5 pt-24 pb-6 md:gap-4 md:pt-28 md:pb-10">
          <p className="text-muted font-mono text-xs tracking-[0.2em] uppercase">What we do</p>
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-12">
            <Column world="web" progress={p} align="left" />
            <div
              aria-hidden="true"
              className="bg-ink hidden w-px origin-top md:block"
              style={{ scale: `1 ${segment(p, 0.05, 0.9)}` }}
            />
            <Column world="app" progress={p} align="right" />
          </div>
        </div>
      )}
    </ScrollSequence>
  )
}

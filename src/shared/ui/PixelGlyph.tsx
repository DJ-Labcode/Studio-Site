import { cn } from '@/shared/lib/cn'

/** 5x7 pixel letters in the same block style as the logo. Add a letter by adding its rows. */
const GLYPHS = {
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
} as const

export type Glyph = keyof typeof GLYPHS

export function PixelGlyph({ ch, className }: { ch: Glyph; className?: string }) {
  return (
    <svg
      viewBox="0 0 5 7"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={cn('fill-current', className)}
    >
      {GLYPHS[ch].flatMap((row, y) =>
        [...row].map((v, x) =>
          v === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="0.94" height="0.94" /> : null,
        ),
      )}
    </svg>
  )
}

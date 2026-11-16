import { cn } from '@/shared/lib/cn'

/** 5x7 pixel letters in the same block style as the logo. Add a letter by adding its rows. */
const GLYPHS = {
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
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

const isGlyph = (ch: string): ch is Glyph => ch in GLYPHS

/** A whole word in pixel letters; `accentFrom` colours the letters from that index in the accent colour. */
export function PixelWord({
  text,
  accentFrom,
  className,
}: {
  text: string
  accentFrom?: number
  className?: string
}) {
  const letters = [...text.toUpperCase()].filter(isGlyph)
  return (
    <svg
      viewBox={`0 0 ${letters.length * 6 - 1} 7`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={text}
      className={className}
    >
      {letters.flatMap((ch, i) =>
        GLYPHS[ch].flatMap((row, y) =>
          [...row].map((v, x) =>
            v === '1' ? (
              <rect
                key={`${i}-${x}-${y}`}
                x={i * 6 + x}
                y={y}
                width="1"
                height="1"
                className={accentFrom !== undefined && i >= accentFrom ? 'fill-ember' : 'fill-ink'}
              />
            ) : null,
          ),
        ),
      )}
    </svg>
  )
}

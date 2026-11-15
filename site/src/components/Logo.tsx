/** 2D DuoForge mark, same grid as brand/duoforge. */
const blk = (c0: number, c1: number, r0: number, r1: number) => {
  const out: [number, number][] = []
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) out.push([c, r])
  return out
}
const D = [...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)]
const F = [...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)]
const S = [...blk(16, 17, 0, 1), [15, 5] as [number, number]]

const path = (cells: [number, number][]) => cells.map(([c, r]) => `M${c} ${r}h1v1h-1z`).join('')

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 16) / 18} viewBox="0 0 18 16" shapeRendering="crispEdges" aria-hidden="true">
      <path d={path(D)} fill="var(--ash)" />
      <path d={path(F)} fill="var(--ember)" />
      <path d={path(S)} fill="var(--spark)" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="logo">
      <LogoMark size={30} />
      <span className="logo-word">
        Duo<span>Forge</span>
      </span>
    </span>
  )
}

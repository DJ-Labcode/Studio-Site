export type Cell = readonly [number, number]
const block = (c0: number, c1: number, r0: number, r1: number): Cell[] => {
  const out: Cell[] = []
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) out.push([c, r])
  return out
}
/** The mark on an 18 x 16 grid: a D closed by an F that shares its stroke, plus two sparks. */
export const MARK = {
  d: [
    ...block(0, 1, 2, 15),
    ...block(2, 5, 2, 3),
    ...block(2, 5, 14, 15),
    ...block(6, 7, 4, 5),
    ...block(6, 7, 12, 13),
  ],
  f: [...block(8, 9, 2, 15), ...block(10, 15, 2, 3), ...block(10, 13, 8, 9)],
  spark: [...block(16, 17, 0, 1), [15, 5] as Cell],
}

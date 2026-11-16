/** A piece of a code line and the colour class it takes: k keyword, s string, n number, c comment. */
export type Token = readonly [text: string, tone?: 'k' | 's' | 'n' | 'c']

/** The lines shown in the editor on the home screen: the studio, described as code. */
export const studioCode = (o: {
  name: string
  city: string
  team: string[]
  shipped: number
}): Token[][] => [
  [['const', 'k'], [' studio = {']],
  [['  name: '], [`'${o.name}'`, 's'], [',']],
  [['  city: '], [`'${o.city}'`, 's'], [',']],
  [
    ['  team: ['],
    ...o.team.flatMap((t, i): Token[] => [...(i ? [[', '] as Token] : []), [`'${t}'`, 's']]),
    ['],'],
  ],
  [
    ['  builds: ['],
    [`'websites'`, 's'],
    [', '],
    [`'apps'`, 's'],
    [', '],
    [`'AI features'`, 's'],
    ['],'],
  ],
  [['  shipped: '], [String(o.shipped), 'n'], [',']],
  [['}']],
  [],
  [['// your turn', 'c']],
  [['studio.'], ['build', 'k'], ['(yourIdea)']],
]

export const lengthOf = (lines: Token[][]) =>
  lines.reduce((sum, line) => sum + line.reduce((n, [text]) => n + text.length, 0), 0)

/** The same lines with only the first `count` characters typed. */
export function typed(lines: Token[][], count: number): Token[][] {
  const out: Token[][] = []
  let left = count
  for (const line of lines) {
    if (left <= 0 && out.length > 0) break
    const row: Token[] = []
    for (const [text, tone] of line) {
      if (left <= 0) break
      row.push([text.slice(0, left), tone])
      left -= text.length
    }
    out.push(row)
    // an empty line is typed in one step, so the caret does not stall on it
    if (line.length === 0) left -= 1
  }
  return out
}

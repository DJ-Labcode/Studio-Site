import { describe, expect, it } from 'vitest'
import { lengthOf, studioCode, typed } from './code'

const lines = studioCode({ name: 'DuoForge', city: 'Mumbai', team: ['A', 'B'], shipped: 5 })
const text = (rows: ReturnType<typeof typed>) =>
  rows.map((r) => r.map(([t]) => t).join('')).join('\n')

describe('studioCode', () => {
  it('describes the studio', () => {
    const all = text(lines)
    expect(all).toContain("name: 'DuoForge'")
    expect(all).toContain("team: ['A', 'B']")
    expect(all).toContain('shipped: 5')
  })
})

describe('typed', () => {
  it('types nothing, then part of the first line', () => {
    expect(text(typed(lines, 0))).toBe('')
    expect(text(typed(lines, 5))).toBe('const')
  })

  it('ends with every line whole', () => {
    expect(text(typed(lines, lengthOf(lines) + lines.length))).toBe(text(lines))
  })
})

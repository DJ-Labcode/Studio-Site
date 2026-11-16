import { describe, expect, it } from 'vitest'
import { BOOT_END, BOOT_LINES, bootAt } from './boot'

describe('bootAt', () => {
  it('starts with the lid shut and nothing on screen', () => {
    expect(bootAt(0)).toMatchObject({ lid: -88, lines: [], bar: 0, done: false })
  })

  it('opens the lid before the first log line', () => {
    const b = bootAt(1100)
    expect(b.lid).toBeCloseTo(0)
    expect(b.lines).toHaveLength(0)
  })

  it('finishes with every line ok and the bar full', () => {
    const b = bootAt(BOOT_END)
    expect(b.done).toBe(true)
    expect(b.bar).toBe(1)
    expect(b.lines).toHaveLength(BOOT_LINES.length)
    expect(b.lines.every((l) => l.ok)).toBe(true)
  })
})

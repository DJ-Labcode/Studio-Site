import { describe, expect, it } from 'vitest'
import { clamp01, frameAt, segment } from './math'

describe('math', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(3)).toBe(1)
  })
  it('maps a sub-range of progress to 0..1', () => {
    expect(segment(0.1, 0.2, 0.6)).toBe(0)
    expect(segment(0.4, 0.2, 0.6)).toBeCloseTo(0.5)
    expect(segment(0.9, 0.2, 0.6)).toBe(1)
  })
  it('picks the frame for a scroll position', () => {
    expect(frameAt(0, 96)).toBe(0)
    expect(frameAt(1, 96)).toBe(95)
    expect(frameAt(0.5, 96)).toBe(48)
    expect(frameAt(2, 96)).toBe(95)
  })
})

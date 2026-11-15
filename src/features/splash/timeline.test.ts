import { describe, expect, it } from 'vitest'
import { entryOffset, SPLASH, splashProgress } from './timeline'

describe('splashProgress', () => {
  it('starts with nothing open and the page hidden', () => {
    const p = splashProgress(0)
    expect(p).toMatchObject({ enter: 0, strike: null, fold: 0, uo: 0, orge: 0, fly: 0, reveal: 0 })
  })

  it('strikes only after the letters meet', () => {
    expect(splashProgress(SPLASH.hit - 1).strike).toBeNull()
    expect(splashProgress(SPLASH.hit + 100).strike).toBeGreaterThan(0)
    expect(splashProgress(SPLASH.hit + 800).strike).toBeNull()
  })

  it('folds the orange half away before the name has opened', () => {
    expect(splashProgress(SPLASH.open + 220).fold).toBe(1)
    expect(splashProgress(SPLASH.open + 220).orge).toBe(0)
    expect(splashProgress(SPLASH.opened)).toMatchObject({ uo: 1, orge: 1 })
  })

  it('ends in the header with the page fully shown and the extras gone', () => {
    const p = splashProgress(SPLASH.end)
    expect(p).toMatchObject({ fly: 1, reveal: 1, underline: 0, tag: 0, settle: expect.any(Number) })
    expect(p.settle).toBeCloseTo(1, 5)
  })
})

describe('entryOffset', () => {
  it('goes from the corner to rest', () => {
    expect(entryOffset(0, -100, -50)).toEqual([-100, -50])
    expect(entryOffset(1, -100, -50).map(Math.abs)).toEqual([0, 0])
  })
})

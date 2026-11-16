import { describe, expect, it } from 'vitest'
import { SPLASH, splashProgress, threeStops } from './timeline'

describe('splashProgress', () => {
  it('starts with the trains away and the page hidden', () => {
    expect(splashProgress(0)).toMatchObject({
      arrive: 0,
      jolt: 0,
      strike: null,
      lift: 0,
      lifted: false,
      depart: 0,
      fly: 0,
      reveal: 0,
    })
  })

  it('strikes only once the trains have coupled', () => {
    expect(splashProgress(SPLASH.coupled - 1).strike).toBeNull()
    expect(splashProgress(SPLASH.coupled).arrive).toBe(1)
    expect(splashProgress(SPLASH.coupled + 100).strike).toBeGreaterThan(0)
    expect(splashProgress(SPLASH.coupled + 800).strike).toBeNull()
  })

  it('lifts the letters before the trains have gone, and flies only after', () => {
    expect(splashProgress(SPLASH.lift).lifted).toBe(true)
    expect(splashProgress(SPLASH.lifted)).toMatchObject({ lift: 1, fly: 0 })
    expect(splashProgress(SPLASH.departed).depart).toBe(1)
  })

  it('ends in the header with the page fully shown', () => {
    expect(splashProgress(SPLASH.end)).toMatchObject({ fly: 1, reveal: 1, rail: 0 })
  })
})

describe('threeStops', () => {
  it('passes through start, middle and end', () => {
    expect(threeStops(10, 20, 30, 0, 0)).toBe(10)
    expect(threeStops(10, 20, 30, 1, 0)).toBe(20)
    expect(threeStops(10, 20, 30, 1, 1)).toBe(30)
  })
})

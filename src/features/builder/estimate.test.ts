import { describe, expect, it } from 'vitest'
import { estimate, formatInr } from './estimate'

describe('estimate', () => {
  it('returns the base project when nothing is picked', () => {
    expect(estimate([], ['android'])).toEqual({ weeks: [2, 3], price: [36_000, 46_000] })
  })
  it('adds the time and cost of each picked feature', () => {
    const e = estimate(['login', 'pay'], ['android'])
    expect(e.weeks[0]).toBe(3) // 2 + 0.5 + 1 = 3.5 -> floor
    expect(e.price).toEqual([Math.round(74_000 * 0.9), Math.round(74_000 * 1.15)])
  })
  it('charges extra for each additional platform, counting duplicates once', () => {
    const one = estimate(['pay'], ['android'])
    const two = estimate(['pay'], ['android', 'ios', 'ios'])
    expect(two.price[0]).toBe(Math.round(one.price[0] * 1.15))
  })
  it('ignores unknown feature ids', () => {
    expect(estimate(['nope'], ['web'])).toEqual(estimate([], ['web']))
  })
})

describe('formatInr', () => {
  it('formats thousands and lakhs', () => {
    expect(formatInr(97_000)).toBe('₹97k')
    expect(formatInr(120_000)).toBe('₹1.2L')
    expect(formatInr(200_000)).toBe('₹2L')
    expect(formatInr(1_250_000)).toBe('₹13L')
  })
})

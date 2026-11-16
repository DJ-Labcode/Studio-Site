import { describe, expect, it } from 'vitest'
import { zoomAt } from './zoom'

describe('zoomAt', () => {
  it('starts as a small laptop with the wordmark around it', () => {
    expect(zoomAt(0, false)).toMatchObject({ scale: 0.56, around: 1, inside: false, live: false })
    expect(zoomAt(0, true).scale).toBe(0.6)
  })

  it('ends with the screen filling the browser and taking clicks', () => {
    expect(zoomAt(1, false)).toMatchObject({
      scale: 1,
      lift: -0,
      around: 0,
      inside: true,
      live: true,
    })
  })

  it('never goes outside 0..1', () => {
    expect(zoomAt(-3, false).scale).toBe(0.56)
    expect(zoomAt(9, false).scale).toBe(1)
  })
})

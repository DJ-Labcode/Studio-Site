import { describe, expect, it } from 'vitest'
import { flapFrame } from './flap'

describe('flapFrame', () => {
  it('scrambles letters at the start but keeps the length and the spaces', () => {
    const f = flapFrame('Mind of Finance', 0, () => 0)
    expect(f.settled).toBe(false)
    expect(f.text).toHaveLength('Mind of Finance'.length)
    expect(f.text).toBe('AAAA AA AAAAAAA')
  })

  it('locks letters in from the left', () => {
    expect(flapFrame('HSC-iT', 300, () => 0).text).toBe('HAAAAA')
  })

  it('settles on the real text', () => {
    expect(flapFrame('RagLabs', 5000)).toEqual({ text: 'RagLabs', settled: true })
  })
})

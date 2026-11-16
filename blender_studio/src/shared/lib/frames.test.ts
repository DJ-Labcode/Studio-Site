import { describe, expect, it } from 'vitest'
import { frameUrls } from './frames'

describe('frameUrls', () => {
  it('builds zero-padded, 1-based frame paths', () => {
    expect(frameUrls('push', 3)).toEqual([
      '/frames/push/0001.webp',
      '/frames/push/0002.webp',
      '/frames/push/0003.webp',
    ])
  })
  it('returns nothing for an empty sequence', () => {
    expect(frameUrls('push', 0)).toEqual([])
  })
})

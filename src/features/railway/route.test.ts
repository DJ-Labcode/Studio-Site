import { describe, expect, it } from 'vitest'
import { planRoutes, roundedPath, type RailMeasures } from './route'

const measures: RailMeasures = {
  left: 30,
  right: 970,
  mid: 500,
  gap: 24,
  narrow: false,
  start: 60,
  toApps: 800,
  toAbout: 2400,
  toEnd: 3000,
  end: { x: 500, y: 3100 },
}

describe('roundedPath', () => {
  it('starts and ends on the first and last point', () => {
    const d = roundedPath([
      [0, 0],
      [0, 100],
      [100, 100],
    ])
    expect(d.startsWith('M0 0')).toBe(true)
    expect(d.endsWith('L100 100')).toBe(true)
    expect(d).toContain('Q0 100')
  })

  it('ignores repeated points', () => {
    const d = roundedPath([
      [0, 0],
      [0, 0],
      [0, 50],
    ])
    expect(d).toBe('M0 0 L0 50')
  })
})

describe('planRoutes', () => {
  it('starts both lines side by side and ends them at the terminus', () => {
    const { web, app } = planRoutes(measures)
    expect(web[0]).toEqual([30, 60])
    expect(app[0]).toEqual([54, 60])
    expect(web.at(-1)).toEqual([488, 3100])
    expect(app.at(-1)).toEqual([512, 3100])
  })

  it('puts websites on the left lane and apps on the right lane', () => {
    const { laneX } = planRoutes(measures)
    expect(laneX('web', 'left')).toBe(30)
    expect(laneX('app', 'right')).toBe(970)
    expect(laneX('web', 'mid')).toBeLessThan(laneX('app', 'mid'))
  })

  it('keeps both lines in the left lane through About on a narrow screen', () => {
    const { laneX } = planRoutes({ ...measures, narrow: true })
    expect(laneX('web', 'mid')).toBe(30)
    expect(laneX('app', 'mid')).toBe(54)
  })
})

import type { RailLane, RailLine } from '@/shared/lib/rail'

export type Point = readonly [x: number, y: number]

/** SVG path through the points with rounded corners, like a line on a transit map. */
export function roundedPath(points: readonly Point[], radius = 26): string {
  const p = points.filter((q, i) => {
    const prev = points[i - 1]
    return !prev || Math.hypot(q[0] - prev[0], q[1] - prev[1]) > 0.5
  })
  const [start, ...rest] = p
  if (!start) return ''
  let d = `M${start[0]} ${start[1]}`
  for (let i = 1; i < p.length - 1; i++) {
    const [ax, ay] = p[i - 1]!
    const [bx, by] = p[i]!
    const [cx, cy] = p[i + 1]!
    const l1 = Math.hypot(bx - ax, by - ay)
    const l2 = Math.hypot(cx - bx, cy - by)
    const k = Math.min(radius, l1 / 2, l2 / 2)
    d += ` L${bx - ((bx - ax) / l1) * k} ${by - ((by - ay) / l1) * k}`
    d += ` Q${bx} ${by} ${bx + ((cx - bx) / l2) * k} ${by + ((cy - by) / l2) * k}`
  }
  const end = rest[rest.length - 1]
  return end ? `${d} L${end[0]} ${end[1]}` : d
}

/** Positions measured from the page, all relative to the railway's own box. */
export type RailMeasures = {
  /** x of the website line's lane (under the logo) and of the app line's lane (mirrored on the right) */
  left: number
  right: number
  /** x of the middle of the column, where the two lines run side by side through About */
  mid: number
  /** distance between the two tracks when they run side by side */
  gap: number
  /** on a narrow screen the lines stay in the left lane through About, so they do not cross the text */
  narrow: boolean
  /** y where the tracks start, and the y of each turn */
  start: number
  toApps: number
  toAbout: number
  toEnd: number
  /** the terminus both lines end at */
  end: { x: number; y: number }
}

/**
 * The two routes. Both leave from under the logo. The app line crosses to the right lane before
 * the first section, so websites hang on the left line and apps on the right one. They come
 * together for About and end side by side at the terminus.
 */
export function planRoutes(m: RailMeasures) {
  const beside = m.left + m.gap
  const pair: [number, number] = m.narrow
    ? [m.left, beside]
    : [m.mid - m.gap / 2, m.mid + m.gap / 2]
  const last: [number, number] = [m.end.x - m.gap / 2, m.end.x + m.gap / 2]
  // where both turn the same way, the outer line turns one track-gap later so they stay parallel
  const web: Point[] = [
    [m.left, m.start],
    [m.left, m.toAbout + m.gap],
    [pair[0], m.toAbout + m.gap],
    [pair[0], m.toEnd + m.gap],
    [last[0], m.toEnd + m.gap],
    [last[0], m.end.y],
  ]
  const app: Point[] = [
    [beside, m.start],
    [beside, m.toApps],
    [m.right, m.toApps],
    [m.right, m.toAbout],
    [pair[1], m.toAbout],
    [pair[1], m.toEnd],
    [last[1], m.toEnd],
    [last[1], m.end.y],
  ]
  const laneX = (line: RailLine, lane: RailLane) =>
    lane === 'left' ? m.left : lane === 'right' ? m.right : pair[line === 'web' ? 0 : 1]
  return { web, app, laneX }
}

import { useEffect, useRef } from 'react'
import { palette } from '@/shared/brand/palette'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { clamp01, segment } from '@/shared/lib/math'
import { RAIL_SECTIONS, type RailLane, type RailLine } from '@/shared/lib/rail'
import { WORDMARK_ANCHOR } from '@/shared/ui/Wordmark'
import { planRoutes, roundedPath } from './route'

const NS = 'http://www.w3.org/2000/svg'
const SAMPLE = 6
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)

type Track = {
  line: RailLine
  path: SVGPathElement
  length: number
  /** lowest point the line has reached after each SAMPLE px of its length */
  depth: number[]
  cars: SVGGElement[]
  lamp: SVGCircleElement
  drawn: number
  headY: number
}
type Stop = {
  line: RailLine
  y: number
  radius: number
  dot: SVGCircleElement
  ripple: SVGCircleElement
  fill: number
  arrivedAt: number
}

/**
 * The two railway lines of the story home, drawn behind the page.
 * Each line has a small train (seen from above) that drives down its track as the page scrolls
 * and stops at every station. Stations are the elements other features mark with `railStop`.
 * Must be the first child of a `position: relative` wrapper that holds the whole page.
 */
export function Railway() {
  const ref = useRef<SVGSVGElement>(null)
  const still = useReducedMotion()

  useEffect(() => {
    const svg = ref.current
    const box = svg?.parentElement
    if (!svg || !box) return
    const make = <K extends keyof SVGElementTagNameMap>(
      name: K,
      attrs: Record<string, string | number>,
      into: Element = svg,
    ) => {
      const node = document.createElementNS(NS, name)
      for (const key in attrs) node.setAttribute(key, String(attrs[key]))
      into.appendChild(node)
      return node
    }

    let tracks: Track[] = []
    let stops: Stop[] = []
    let ring: {
      arcs: SVGPathElement[]
      core: SVGCircleElement
      radius: number
      fill: number
    } | null = null
    let car = 30

    const layout = () => {
      const anchor = document.querySelector(`[${WORDMARK_ANCHOR}]`)
      const terminus = box.querySelector('[data-rail-terminus]')
      const section = (id: string) => document.getElementById(id)
      const first = section(RAIL_SECTIONS.web)
      const about = section(RAIL_SECTIONS.about)
      const contact = section(RAIL_SECTIONS.contact)
      if (!anchor || !terminus || !first || !about || !contact) return
      svg.replaceChildren()

      const b = box.getBoundingClientRect()
      const W = box.clientWidth
      const H = box.scrollHeight
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      svg.style.height = `${H}px`
      const top = (el: Element) => el.getBoundingClientRect().top - b.top
      const narrow = W < 768
      const gauge = narrow ? 8 : 10
      const gap = narrow ? 17 : 24
      car = narrow ? 24 : 30
      const turn = narrow ? 40 : 56

      const logo = anchor.getBoundingClientRect()
      const end = terminus.getBoundingClientRect()
      const endRadius = end.width / 2 - 4
      const endY = end.top - b.top + end.height / 2
      const left = logo.left - b.left + 9
      const { web, app, laneX } = planRoutes({
        left,
        right: W - left,
        mid: W / 2,
        gap,
        narrow,
        // the header is fixed, so its place on the page is its place on screen when the page is at the top
        start: logo.bottom + 10,
        toApps: top(first) + turn,
        toAbout: top(about) + turn,
        toEnd: top(contact) + turn,
        end: { x: end.left - b.left + end.width / 2, y: endY - endRadius - 2 },
      })
      const routes = [
        { line: 'web' as const, color: palette.ink, d: roundedPath(web) },
        { line: 'app' as const, color: palette.ember, d: roundedPath(app) },
      ]

      // bottom to top: sleepers, rails, the travelled part in the line's colour, then the gap between the rails
      const stroke = (d: string, color: string, width: number, dash?: string) =>
        make('path', {
          d,
          fill: 'none',
          stroke: color,
          'stroke-width': width,
          ...(dash ? { 'stroke-dasharray': dash } : {}),
        })
      routes.forEach((r) => stroke(r.d, palette.sleeper, gauge + 8, '3 9'))
      routes.forEach((r) => stroke(r.d, palette.rail, gauge))
      const travelled = routes.map((r) => stroke(r.d, r.color, gauge))
      routes.forEach((r) => stroke(r.d, palette.paper, gauge - 5))
      routes.forEach((r) => stroke(r.d, palette.sleeper, gauge - 5, '3 9'))

      const previous = stops
      stops = [...box.querySelectorAll<HTMLElement>('[data-rail-stop]')].map((el, i) => {
        const line = el.dataset.railStop as RailLine
        const color = line === 'web' ? palette.ink : palette.ember
        const r = el.getBoundingClientRect()
        const x = laneX(line, el.dataset.railLane as RailLane)
        const y = r.top - b.top + r.height / 2
        const radius = 'railBig' in el.dataset ? 13 : 10.5
        const ripple = make('circle', {
          cx: x,
          cy: y,
          r: radius,
          fill: 'none',
          stroke: color,
          'stroke-width': 2,
          opacity: 0,
        })
        make('circle', {
          cx: x,
          cy: y,
          r: radius,
          fill: palette.paper,
          stroke: color,
          'stroke-width': 3,
        })
        const dot = make('circle', { cx: x, cy: y, r: 0, fill: color })
        return {
          line,
          y,
          radius,
          dot,
          ripple,
          fill: previous[i]?.fill ?? 0,
          arrivedAt: previous[i]?.arrivedAt ?? 0,
        }
      })

      const old = tracks
      tracks = routes.map((r, i) => {
        const path = travelled[i]!
        const length = path.getTotalLength()
        const depth: number[] = []
        let deepest = -1
        for (let l = 0; l <= length; l += SAMPLE) {
          deepest = Math.max(deepest, path.getPointAtLength(l).y)
          depth.push(deepest)
        }
        path.style.strokeDasharray = String(length)
        // the train, seen from above: a nose car and two coaches
        const w = gauge + 5
        const cars = [0, 1, 2].map((n) => {
          const g = make('g', {})
          const body = { fill: r.color, stroke: palette.paper, 'stroke-width': 1.5 }
          if (n === 0)
            make(
              'path',
              {
                d: `M${-car / 2} ${-w / 2} H${car * 0.12} Q${car * 0.52} ${-w / 2} ${car * 0.62} 0 Q${car * 0.52} ${w / 2} ${car * 0.12} ${w / 2} H${-car / 2} Z`,
                ...body,
              },
              g,
            )
          else make('rect', { x: -car / 2, y: -w / 2, width: car, height: w, rx: 4, ...body }, g)
          make(
            'rect',
            {
              x: -car / 2 + 5,
              y: -1.5,
              width: n === 0 ? car * 0.5 : car - 10,
              height: 3,
              rx: 1.5,
              fill: palette.paper,
              opacity: 0.55,
            },
            g,
          )
          return g
        })
        const lamp = make('circle', { r: 3, fill: '#fff' })
        return {
          line: r.line,
          path,
          length,
          depth,
          cars,
          lamp,
          drawn: Math.min(old[i]?.drawn ?? 0, length),
          headY: 0,
        }
      })

      // the terminus: both lines end in one ring
      const cx = end.left - b.left + end.width / 2
      const arc = (from: number, to: number, color: string) =>
        make('path', {
          d: `M${cx + Math.cos(from) * endRadius} ${endY + Math.sin(from) * endRadius} A${endRadius} ${endRadius} 0 0 ${to > from ? 1 : 0} ${cx + Math.cos(to) * endRadius} ${endY + Math.sin(to) * endRadius}`,
          fill: 'none',
          stroke: color,
          'stroke-width': 5,
          'stroke-linecap': 'round',
        })
      const up = -Math.PI / 2
      const arcs = [
        arc(up - 0.5, up - Math.PI + 0.12, palette.ink),
        arc(up + 0.5, up + Math.PI - 0.12, palette.ember),
      ]
      arcs.forEach((a) => (a.style.strokeDasharray = String(a.getTotalLength())))
      ring = {
        arcs,
        core: make('circle', { cx, cy: endY, r: 0, fill: palette.ember }),
        radius: endRadius,
        fill: ring?.fill ?? 0,
      }
    }

    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const vh = window.innerHeight
      const doc = document.documentElement
      const atEnd = window.scrollY + vh >= doc.scrollHeight - 4
      // the trains keep a little ahead of the middle of the screen
      const targetY = -box.getBoundingClientRect().top + vh * 0.6

      for (const t of tracks) {
        let i = 0
        while (i < t.depth.length - 1 && t.depth[i + 1]! <= targetY) i++
        const parkedAt = Math.min(car * 3.6, t.length)
        const want = still || atEnd ? t.length : Math.max(Math.min(i * SAMPLE, t.length), parkedAt)
        t.drawn += (want - t.drawn) * (still ? 1 : 0.085)
        if (Math.abs(want - t.drawn) < 0.4) t.drawn = want
        t.path.style.strokeDashoffset = String(t.length - t.drawn)
        t.headY = t.depth[Math.min(t.depth.length - 1, Math.floor(t.drawn / SAMPLE))] ?? 0

        t.cars.forEach((g, n) => {
          const at = t.drawn - car * 0.62 - n * (car + 4)
          if (at < 0) return g.setAttribute('opacity', '0')
          const p = t.path.getPointAtLength(at)
          const ahead = t.path.getPointAtLength(Math.min(t.length, at + 2))
          const behind = t.path.getPointAtLength(Math.max(0, at - 2))
          const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI
          g.setAttribute('opacity', '1')
          g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})`)
        })
        // while a train waits, its headlight breathes
        const nose = t.path.getPointAtLength(Math.max(0, t.drawn - 3))
        const beat = (Math.sin(now / 380 + (t.line === 'web' ? 0 : 1.7)) + 1) / 2
        t.lamp.setAttribute('cx', String(nose.x))
        t.lamp.setAttribute('cy', String(nose.y))
        t.lamp.setAttribute('r', String(still ? 2.5 : 2 + beat * 1.6))
        t.lamp.setAttribute('opacity', t.drawn >= t.length - 1 ? '0' : '0.95')
      }

      for (const s of stops) {
        const head = tracks.find((t) => t.line === s.line)?.headY ?? 0
        const arrived = head >= s.y - 2
        if (arrived && !s.arrivedAt) s.arrivedAt = now
        s.fill += ((arrived ? 1 : 0) - s.fill) * (still ? 1 : 0.16)
        s.dot.setAttribute('r', String(Math.max(0, (s.radius - 4.5) * s.fill)))
        // a ripple when the train pulls in
        const k = s.arrivedAt ? segment(now, s.arrivedAt, s.arrivedAt + 900) : 1
        s.ripple.setAttribute('r', String(s.radius + easeOut(k) * 22))
        s.ripple.setAttribute('opacity', String(still || k >= 1 ? 0 : (1 - k) * 0.7))
      }

      if (ring) {
        const closed = tracks.length > 0 && tracks.every((t) => t.drawn >= t.length - 2)
        ring.fill += ((closed ? 1 : 0) - ring.fill) * (still ? 1 : 0.07)
        for (const a of ring.arcs)
          a.style.strokeDashoffset = String(a.getTotalLength() * (1 - ring.fill))
        ring.core.setAttribute('r', String((ring.radius - 13) * clamp01(ring.fill * 1.4 - 0.4)))
      }
    }

    let queued = 0
    const relayout = () => {
      cancelAnimationFrame(queued)
      queued = requestAnimationFrame(layout)
    }
    layout()
    const observer = new ResizeObserver(relayout)
    observer.observe(box)
    void document.fonts.ready.then(relayout)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(queued)
      observer.disconnect()
    }
  }, [still])

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 w-full"
    />
  )
}

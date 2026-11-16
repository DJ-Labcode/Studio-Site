import { useEffect, useRef } from 'react'
import { brand } from '@/shared/brand'
import { palette } from '@/shared/brand/palette'
import { WORDMARK_ANCHOR } from '@/shared/ui/Wordmark'
import { easeOut, SPLASH, splashProgress, threeStops } from './timeline'

const NS = 'http://www.w3.org/2000/svg'
const SPARKS = 14
const [first, second] = brand.nameParts
const LETTERS = [...first, ...second]
const SPLIT = first.length

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const blend = (from: string, to: string, k: number) => {
  const a = rgb(from)
  const b = rgb(to)
  return `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * k)).join(',')})`
}

/** Side view of a bullet-train nose; `flip` points it to the right. */
function Nose({ flip = false }: { flip?: boolean }) {
  const shape = flip
    ? 'polygon(0 0, 0 100%, 88% 100%, 100% 82%, 94% 62%, 48% 6%, 30% 0)'
    : 'polygon(100% 0, 100% 100%, 12% 100%, 0 82%, 6% 62%, 52% 6%, 70% 0)'
  const glass = flip
    ? 'polygon(0 0, 62% 0, 100% 100%, 0 100%)'
    : 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)'
  return (
    <div data-s="nose" className="relative bg-current" style={{ clipPath: shape }}>
      <i
        className="absolute top-[16%] h-[30%] w-[30%] rounded bg-[#cfe3ee]"
        style={{ clipPath: glass, [flip ? 'left' : 'right']: '8%' }}
      />
    </div>
  )
}

function Coach({ letter, light }: { letter: string; light: string }) {
  return (
    <div data-s="coach" className="relative grid place-items-center bg-current leading-none">
      <span data-s="on" style={{ color: light }}>
        {letter}
      </span>
      <i className="absolute inset-x-[12%] -bottom-[9%] h-[9%] rounded-b-md bg-[#3a3844]" />
    </div>
  )
}

/**
 * Opening animation, played once per page load.
 * Two bullet trains roll in along one diagonal: the dark one carries the first half of the name,
 * the orange one the second half. They couple with a ring and sparks, the letters lift off into
 * the wordmark, the trains drive away, and the name travels to the header logo (the element
 * marked with WORDMARK_ANCHOR), where the real logo takes over.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const el = root.current
    if (!el) return
    const one = <T extends Element>(name: string) => el.querySelector<T>(`[data-s="${name}"]`)!
    const all = <T extends Element>(name: string) => [
      ...el.querySelectorAll<T>(`[data-s="${name}"]`),
    ]
    const veil = one<HTMLElement>('veil')
    const rail = one<HTMLElement>('rail')
    const a = one<HTMLElement>('a')
    const b = one<HTMLElement>('b')
    const fx = one<SVGSVGElement>('fx')
    const measure = one<HTMLElement>('measure')
    const onCoach = all<HTMLElement>('on')
    const free = all<HTMLElement>('free')
    const anchor = document.querySelector<HTMLElement>(`[${WORDMARK_ANCHOR}]`)

    let W = 0
    let H = 0
    let u = 1
    let coachH = 0
    let coupling = 0
    /** each letter's place in the wordmark at 100px, and where it rides on its coach */
    let slots: { x: number; w: number }[] = []
    let rides: { x: number; y: number; k: number }[] = []
    let wordW = 1

    const place = () => {
      W = window.innerWidth
      H = window.innerHeight
      u = Math.min(1, W / 1320)
      const cw = 104 * u
      const gap = 8 * u
      const nose = 128 * u
      coachH = 118 * u
      const wA = nose + SPLIT * (cw + gap)
      const wB = (LETTERS.length - SPLIT) * (cw + gap) + nose
      const x0 = (W - (wA + wB)) / 2
      const y = H / 2 - coachH / 2
      coupling = x0 + wA
      for (const [train, x] of [
        [a, x0],
        [b, coupling],
      ] as const) {
        Object.assign(train.style, {
          left: `${x}px`,
          top: `${y}px`,
          height: `${coachH}px`,
          gap: `${gap}px`,
          transform: 'none',
        })
      }
      all<HTMLElement>('coach').forEach((c) =>
        Object.assign(c.style, {
          width: `${cw}px`,
          borderRadius: `${14 * u}px`,
          fontSize: `${84 * u}px`,
        }),
      )
      all<HTMLElement>('nose').forEach((n) => (n.style.width = `${nose}px`))
      rail.style.top = `${y + coachH * 1.09}px`

      const m = measure.getBoundingClientRect()
      wordW = m.width
      slots = [...measure.children].map((s) => {
        const r = s.getBoundingClientRect()
        return { x: r.left - m.left, w: r.width }
      })
      const k = 0.84 * u
      rides = onCoach.map((s, i) => {
        const r = s.getBoundingClientRect()
        return {
          x: r.left + r.width / 2 - (slots[i]!.w * k) / 2,
          y: r.top + r.height / 2 - 50 * k,
          k,
        }
      })
    }

    const strike = (k: number | null) => {
      fx.replaceChildren()
      if (k === null) return
      const add = (name: string, attrs: Record<string, string | number>) => {
        const node = document.createElementNS(NS, name)
        for (const key in attrs) node.setAttribute(key, String(attrs[key]))
        fx.appendChild(node)
      }
      const cx = coupling
      const cy = H / 2
      const fade = 1 - k
      add('circle', {
        cx,
        cy,
        r: (30 + easeOut(k) * 380) * u,
        fill: 'none',
        stroke: palette.ember,
        'stroke-width': 3.5 * fade,
        opacity: fade,
      })
      add('circle', {
        cx,
        cy,
        r: (20 + easeOut(k) * 220) * u,
        fill: 'none',
        stroke: palette.ink,
        'stroke-width': 2.5 * fade,
        opacity: fade * 0.7,
      })
      for (let i = 0; i < SPARKS; i++) {
        const ang = (i / SPARKS) * Math.PI * 2 + 0.3
        const r0 = (110 + easeOut(k) * 190) * u
        const r1 = r0 + 46 * fade * u
        add('line', {
          x1: cx + Math.cos(ang) * r0,
          y1: cy + Math.sin(ang) * r0,
          x2: cx + Math.cos(ang) * r1,
          y2: cy + Math.sin(ang) * r1,
          stroke: i % 2 ? palette.ember : palette.ink,
          'stroke-width': 3 * u + 1,
          'stroke-linecap': 'round',
          opacity: fade,
        })
      }
    }

    const render = (t: number) => {
      const p = splashProgress(t)
      // both trains come in along one diagonal and level out: dark from the top-left, orange from the bottom-right
      const away = 1 - p.arrive
      const dx = away * W * 0.8 + p.jolt * 10 * u + p.depart * W * 1.1
      const dy = away * H * 0.42
      const tilt = away * 24
      a.style.transform = `translate(${-dx}px, ${-dy}px) rotate(${tilt}deg)`
      b.style.transform = `translate(${dx}px, ${dy}px) rotate(${tilt}deg)`
      rail.style.opacity = String(p.rail)
      strike(p.strike)

      // the letters: on the coaches -> the wordmark in the middle -> the header logo
      const kw = Math.min(1.3 * u, (W * 0.84) / wordW)
      const wx = (W - wordW * kw) / 2
      const wy = H / 2 - 50 * kw - coachH * 0.1
      const target = anchor?.getBoundingClientRect()
      const kh = target && target.width > 0 ? target.width / wordW : kw * 0.2
      const hx = target?.left ?? 24
      const hy = target?.top ?? 24
      const tint = Math.min(1, Math.max(0, (p.lift - 0.15) / 0.55))
      free.forEach((s, i) => {
        const ride = rides[i]!
        const slot = slots[i]!
        const x = threeStops(ride.x, wx + slot.x * kw, hx + slot.x * kh, p.lift, p.fly)
        const y = threeStops(ride.y, wy, hy, p.lift, p.fly)
        const k = threeStops(ride.k, kw, kh, p.lift, p.fly)
        s.style.transform = `translate(${x}px, ${y}px) scale(${k})`
        s.style.color =
          i < SPLIT
            ? blend(palette.paper, palette.ink, tint)
            : blend('#ffffff', palette.ember, tint)
        s.style.visibility = p.lifted ? 'visible' : 'hidden'
      })
      onCoach.forEach((s) => (s.style.visibility = p.lifted ? 'hidden' : 'visible'))
      veil.style.opacity = String(1 - p.reveal)
    }

    // while the splash plays: no scrolling, and the real header logo waits for the flying one to land
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    if (anchor) anchor.style.visibility = 'hidden'

    let raf = 0
    let t0: number | null = null
    let skip = false
    let finished = false
    const loop = (now: number) => {
      t0 ??= now
      // a click or key press jumps straight to the hand-off
      if (skip) {
        skip = false
        if (now - t0 < SPLASH.fly) t0 = now - SPLASH.fly
      }
      const t = now - t0
      render(Math.min(t, SPLASH.end))
      if (t < SPLASH.end) raf = requestAnimationFrame(loop)
      else if (!finished) {
        finished = true
        done.current()
      }
    }
    const onSkip = () => (skip = true)
    const onResize = () => place()

    let cancelled = false
    const start = () => {
      if (cancelled) return
      place()
      window.addEventListener('resize', onResize)
      window.addEventListener('pointerdown', onSkip)
      window.addEventListener('keydown', onSkip)
      raf = requestAnimationFrame(loop)
    }
    // wait for the brand font so the letters are measured at their real size (but never wait long)
    void Promise.race([
      document.fonts.load('700 100px "Space Grotesk"').catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).then(start)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerdown', onSkip)
      window.removeEventListener('keydown', onSkip)
      html.style.overflow = overflow
      if (anchor) anchor.style.visibility = ''
    }
  }, [])

  const type = 'leading-none tracking-[-0.04em] whitespace-nowrap'
  return (
    <div
      ref={root}
      role="status"
      aria-label={`${brand.name} is loading`}
      data-lenis-prevent
      className="font-display fixed inset-0 z-[100] overflow-hidden font-bold"
    >
      <div data-s="veil" className="bg-paper absolute inset-0" />
      <div data-s="rail" className="bg-line absolute inset-x-0 h-[3px] opacity-0">
        <div className="absolute inset-x-0 top-[3px] h-[7px] bg-[repeating-linear-gradient(90deg,var(--color-line)_0_4px,transparent_4px_22px)]" />
      </div>
      <div aria-hidden="true">
        <div
          data-s="a"
          className="text-ink absolute flex origin-[100%_60%] items-stretch will-change-transform"
        >
          <Nose />
          {LETTERS.slice(0, SPLIT).map((c, i) => (
            <Coach key={i} letter={c} light={palette.paper} />
          ))}
        </div>
        <div
          data-s="b"
          className="text-ember absolute flex origin-[0%_60%] items-stretch will-change-transform"
        >
          {LETTERS.slice(SPLIT).map((c, i) => (
            <Coach key={i} letter={c} light="#ffffff" />
          ))}
          <Nose flip />
        </div>
        <svg data-s="fx" className="absolute inset-0 size-full" />
        {LETTERS.map((c, i) => (
          <span
            key={i}
            data-s="free"
            className={`invisible absolute top-0 left-0 origin-top-left text-[100px] ${type}`}
          >
            {c}
          </span>
        ))}
        <div
          data-s="measure"
          className={`invisible absolute top-0 -left-[9999px] text-[100px] ${type}`}
        >
          {LETTERS.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

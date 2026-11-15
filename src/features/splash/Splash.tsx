import { useEffect, useRef } from 'react'
import { brand } from '@/shared/brand'
import { WORDMARK_ANCHOR } from '@/shared/ui/Wordmark'
import { easeOut, entryOffset, SPLASH, splashProgress } from './timeline'

const NS = 'http://www.w3.org/2000/svg'
const INK = '#16151c'
const EMBER = '#ff5a1f'
const SPARKS = 14

const [first, second] = brand.nameParts
const [capA, restA] = [first.slice(0, 1), first.slice(1)]
const [capB, restB] = [second.slice(0, 1), second.slice(1)]

/**
 * Opening animation, played once per page load.
 * A light half carrying the D and an orange half carrying the F slide together; where the letters meet,
 * a ring and sparks burst out; the orange folds into the F; the name opens; and the wordmark travels
 * to the header logo (the element marked with WORDMARK_ANCHOR), where the real logo takes over.
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
    const q = <T extends Element>(name: string) => el.querySelector<T>(`[data-s="${name}"]`)!
    const veil = q<HTMLElement>('veil')
    const mark = q<HTMLElement>('mark')
    const d = q<HTMLElement>('d')
    const f = q<HTMLElement>('f')
    const uo = q<HTMLElement>('uo')
    const orge = q<HTMLElement>('orge')
    const orange = q<HTMLElement>('orange')
    const f2 = q<HTMLElement>('f2')
    const under = q<HTMLElement>('under')
    const tag = q<HTMLElement>('tag')
    const fx = q<SVGSVGElement>('fx')
    const fx2 = q<SVGSVGElement>('fx2')
    const anchor = document.querySelector<HTMLElement>(`[${WORDMARK_ANCHOR}]`)

    let W = 0
    let H = 0
    let size = 0
    let wD = 0
    let wF = 0
    let wUo = 0
    let wOrge = 0
    let hM = 0
    let target = { x: 24, y: 24, scale: 0.2 }

    const measure = () => {
      W = window.innerWidth
      H = window.innerHeight
      size = Math.min(150, W * 0.17)
      mark.style.fontSize = `${size}px`
      mark.style.transform = 'none'
      d.style.transform = f.style.transform = 'none'
      uo.style.width = orge.style.width = 'auto'
      wUo = uo.getBoundingClientRect().width
      wOrge = orge.getBoundingClientRect().width
      wD = d.getBoundingClientRect().width
      wF = f.getBoundingClientRect().width
      hM = mark.getBoundingClientRect().height
      const r = anchor?.getBoundingClientRect()
      if (r && r.width > 0)
        target = { x: r.left, y: r.top, scale: r.width / (wD + wUo + wF + wOrge) }
    }

    const draw = (into: SVGSVGElement, k: number, c1: string, c2: string) => {
      const u = size / 150
      const add = (name: string, attrs: Record<string, string | number>) => {
        const node = document.createElementNS(NS, name)
        for (const key in attrs) node.setAttribute(key, String(attrs[key]))
        into.appendChild(node)
      }
      const cx = W / 2
      const cy = H / 2
      const fade = 1 - k
      const ring = { cx, cy, fill: 'none' }
      add('circle', {
        ...ring,
        r: (30 + easeOut(k) * 430) * u,
        stroke: c1,
        'stroke-width': 3.5 * fade,
        opacity: fade,
      })
      add('circle', {
        ...ring,
        r: (20 + easeOut(k) * 250) * u,
        stroke: c2,
        'stroke-width': 2.5 * fade,
        opacity: fade * 0.7,
      })
      for (let i = 0; i < SPARKS; i++) {
        const a = (i / SPARKS) * Math.PI * 2 + 0.3
        const r0 = (110 + easeOut(k) * 190) * u
        const r1 = r0 + 46 * fade * u
        add('line', {
          x1: cx + Math.cos(a) * r0,
          y1: cy + Math.sin(a) * r0,
          x2: cx + Math.cos(a) * r1,
          y2: cy + Math.sin(a) * r1,
          stroke: i % 2 ? c1 : c2,
          'stroke-width': 3 * u,
          'stroke-linecap': 'round',
          opacity: fade,
        })
      }
    }

    const render = (t: number) => {
      const p = splashProgress(t)

      // the name: hidden halves open by growing in width while their text slides out from behind the capital
      const wu = wUo * p.uo
      const wo = wOrge * p.orge
      uo.style.width = `${wu}px`
      orge.style.width = `${wo}px`
      ;(uo.firstElementChild as HTMLElement).style.transform = `translateX(${wu - wUo}px)`
      ;(orge.firstElementChild as HTMLElement).style.transform = `translateX(${wo - wOrge}px)`

      // centre of the screen -> the header logo
      const total = wD + wu + wF + wo
      const cx = W / 2 - total / 2
      const cy = H / 2 - hM / 2
      const s = 1 + (target.scale - 1) * p.fly
      const x = cx + (target.x - cx) * p.fly
      const y = cy + (target.y - cy) * p.fly
      mark.style.transform = `translate(${x}px, ${y}px) scale(${s})`

      // D from the top-left, F from the bottom-right
      const [dx, dy] = entryOffset(p.enter, -W * 0.62, -H * 0.62)
      const [fxOff, fyOff] = entryOffset(p.enter, W * 0.62, H * 0.62)
      const tilt = (1 - easeOut(p.enter)) * 14
      const fTransform = `translate(${fxOff}px, ${fyOff}px) rotate(${tilt}deg) scale(${p.settle})`
      d.style.transform = `translate(${dx}px, ${dy}px) rotate(${-tilt}deg) scale(${p.settle})`
      f.style.transform = fTransform
      d.style.opacity = f.style.opacity = String(Math.min(1, p.enter * 4))

      // ring and sparks: brand colours on the light side, white inside the orange half
      fx.replaceChildren()
      fx2.replaceChildren()
      if (p.strike !== null) {
        draw(fx, p.strike, EMBER, INK)
        draw(fx2, p.strike, '#fff', '#fff')
      }

      // the orange half slides in, then every corner folds into the centre of the F
      if (p.fold >= 1) orange.style.display = 'none'
      else {
        orange.style.display = 'block'
        const off = (1 - easeOut(p.enter)) * (W + H) * 0.6
        const fLeft = x + (wD + wu) * s
        const fcx = fLeft + fxOff + (wF * s) / 2
        const fcy = y + fyOff + (hM * s) / 2
        const corners = [
          [W * 0.62, -10],
          [W + 10, -10],
          [W + 10, H + 10],
          [W * 0.38, H + 10],
        ].map(([px, py]) => {
          const ax = px! + off
          const ay = py! + off
          return `${ax + (fcx - ax) * p.fold}px ${ay + (fcy - ay) * p.fold}px`
        })
        orange.style.clipPath = `polygon(${corners.join(', ')})`
        f2.style.fontSize = `${size * s}px`
        f2.style.left = `${fLeft}px`
        f2.style.top = `${y}px`
        f2.style.transform = fTransform
      }

      // underline and tagline sit under the open name and leave before it travels
      const bottom = y + hM * s
      under.style.left = `${x}px`
      under.style.top = `${bottom + 16 * (size / 150)}px`
      under.style.width = `${total * s}px`
      under.style.transform = `scaleX(${p.underline})`
      under.style.opacity = p.underline > 0 ? '1' : '0'
      tag.style.opacity = String(p.tag)
      tag.style.top = `${bottom + 46 * (size / 150) + (1 - p.tag) * 10}px`

      veil.style.opacity = String(1 - p.reveal)
    }

    // while the splash plays: no scrolling, and the real header logo waits for the flying one to land
    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'
    if (anchor) anchor.style.visibility = 'hidden'

    let raf = 0
    let t0: number | null = null
    let skipTo: number | null = null
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      done.current()
    }
    const loop = (now: number) => {
      t0 ??= now
      if (skipTo !== null) {
        t0 = now - skipTo
        skipTo = null
      }
      const t = now - t0
      render(Math.min(t, SPLASH.end))
      if (t >= SPLASH.end) finish()
      else raf = requestAnimationFrame(loop)
    }
    // a click or key press jumps straight to the hand-off
    const skip = () => {
      if (t0 !== null && performance.now() - t0 < SPLASH.hold) skipTo = SPLASH.hold
    }
    const onResize = () => measure()

    let cancelled = false
    const start = () => {
      if (cancelled) return
      measure()
      window.addEventListener('resize', onResize)
      window.addEventListener('pointerdown', skip)
      window.addEventListener('keydown', skip)
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
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      html.style.overflow = overflow
      if (anchor) anchor.style.visibility = ''
    }
  }, [])

  const letter = 'inline-block will-change-transform'
  const rest = 'inline-block w-0 overflow-hidden align-baseline'
  return (
    <div
      ref={root}
      role="status"
      aria-label={`${brand.name} is loading`}
      data-lenis-prevent
      className="font-display fixed inset-0 z-[100] overflow-hidden font-bold"
    >
      <div data-s="veil" className="bg-paper absolute inset-0" />
      <svg data-s="fx" aria-hidden="true" className="absolute inset-0 size-full" />
      <div
        data-s="mark"
        aria-hidden="true"
        className="absolute top-0 left-0 flex origin-top-left items-baseline leading-none tracking-[-0.04em] whitespace-nowrap"
      >
        <span data-s="d" className={`${letter} text-ink opacity-0`}>
          {capA}
        </span>
        <span data-s="uo" className={`${rest} text-ink`}>
          <span className="inline-block">{restA}</span>
        </span>
        <span data-s="f" className={`${letter} text-ember opacity-0`}>
          {capB}
        </span>
        <span data-s="orge" className={`${rest} text-ember`}>
          <span className="inline-block">{restB}</span>
        </span>
      </div>
      <div
        data-s="orange"
        aria-hidden="true"
        className="bg-ember absolute inset-0 [clip-path:polygon(0_0,0_0,0_0)]"
      >
        <svg data-s="fx2" className="absolute inset-0 size-full" />
        <span data-s="f2" className="absolute leading-none tracking-[-0.04em] text-white">
          {capB}
        </span>
      </div>
      <div data-s="under" aria-hidden="true" className="absolute flex h-[3px] opacity-0 md:h-[5px]">
        <i className="bg-ink flex-1" />
        <i className="bg-ember flex-1" />
      </div>
      <p
        data-s="tag"
        aria-hidden="true"
        className="text-muted absolute inset-x-0 text-center font-sans text-[11px] font-medium tracking-[0.22em] uppercase opacity-0 md:text-lg"
      >
        Web &amp; app studio
      </p>
    </div>
  )
}

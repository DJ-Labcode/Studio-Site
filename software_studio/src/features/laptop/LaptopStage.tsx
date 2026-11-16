import { useEffect, useRef, type ReactNode } from 'react'
import { brand } from '@/shared/brand'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { lockScroll } from '@/shared/lib/scrollTo'
import { SECTIONS } from '@/shared/lib/sections'
import { useVisit } from '@/shared/state/visit'
import { bootAt } from './boot'
import { ZOOM_SHARE, zoomAt } from './zoom'

/**
 * The opening of the site. A laptop sits in the middle of the page; on load its lid opens and it
 * boots. Scrolling then grows its screen until it fills the browser, so the visitor ends up inside it.
 * `children` is what the screen shows: it is laid out at full browser size and scaled down while small.
 * On a narrow screen the device is drawn as a phone.
 */
export function LaptopStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null)
  const still = useReducedMotion()

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const one = <T extends HTMLElement>(name: string) => el.querySelector<T>(`[data-l="${name}"]`)!
    const laptop = one('laptop')
    const lid = one('lid')
    const screen = one('screen')
    const around = [one('top'), one('bottom')]
    const boot = one('boot')
    const log = one('log')
    const bar = one('bar')
    const visit = useVisit.getState()
    let booting = !still
    let raf = 0

    // the zoom follows the scroll
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const narrow = window.innerWidth < 760
      laptop.classList.toggle('phone', narrow)
      const distance = (el.offsetHeight - window.innerHeight) * ZOOM_SHARE
      const z = zoomAt(still ? 1 : -el.getBoundingClientRect().top / distance, narrow)
      laptop.style.transform = `translateY(${z.lift}vh) scale(${z.scale})`
      for (const a of around) a.style.opacity = String(booting ? 0 : z.around)
      screen.style.pointerEvents = z.live ? 'auto' : 'none'
      screen.style.borderRadius = z.scale >= 0.999 ? '0' : ''
      const inside = z.inside && !booting
      if (useVisit.getState().inside !== inside) visit.setInside(inside)
    }
    raf = requestAnimationFrame(frame)

    if (still) {
      boot.hidden = true
      visit.finishIntro()
      return () => cancelAnimationFrame(raf)
    }

    // start-up: the lid swings open and the laptop boots; a click or key press skips it
    window.scrollTo(0, 0)
    lockScroll(true)
    let start: number | null = null
    let skipped = false
    let bootRaf = 0
    let hide = 0
    const skip = () => (skipped = true)
    const finish = () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      lid.style.transform = ''
      boot.style.opacity = '0'
      hide = window.setTimeout(() => (boot.hidden = true), 520)
      lockScroll(false)
      booting = false
      visit.finishIntro()
    }
    const step = (now: number) => {
      start ??= now
      const b = bootAt(skipped ? Infinity : now - start)
      lid.style.transform = `perspective(1600px) rotateX(${b.lid}deg)`
      log.textContent = ''
      for (const line of b.lines) {
        log.append(`> ${line.text}${'.'.repeat(line.dots)}`)
        if (line.ok) {
          const ok = document.createElement('b')
          ok.textContent = ' ok'
          log.append(ok)
        }
        log.append('\n')
      }
      bar.style.width = `${b.bar * 100}%`
      if (b.done) finish()
      else bootRaf = requestAnimationFrame(step)
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    bootRaf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(bootRaf)
      window.clearTimeout(hide)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      lockScroll(false)
    }
  }, [still])

  const [first, second] = brand.nameParts
  return (
    <div id={SECTIONS.stage} ref={stage}>
      <div className="rig">
        <p className="out top" data-l="top">
          <span className="brand">
            {first}
            <b>{second}</b>
          </span>
          <span className="eyebrow">
            Web &amp; app studio <i>·</i> {brand.location.split(',')[0]}
          </span>
        </p>
        <div className="laptop" data-l="laptop">
          <div className="lid" data-l="lid">
            <div className="bezel" />
            <div className="screen" data-l="screen">
              {children}
              <div
                className="boot"
                data-l="boot"
                role="status"
                aria-label={`${brand.name} is starting`}
              >
                <span className="brand" aria-hidden="true">
                  {first[0]}
                  <b>{second[0]}</b>
                </span>
                <pre data-l="log" aria-hidden="true" />
                <div className="bar">
                  <i data-l="bar" />
                </div>
              </div>
            </div>
          </div>
          <div className="base" />
        </div>
        <p className="out bottom eyebrow" data-l="bottom">
          Scroll to step inside <i>↓</i>
        </p>
      </div>
    </div>
  )
}
